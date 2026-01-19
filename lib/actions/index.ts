"use server"

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct, scrapeEbayProduct, detectPlatform } from "../scraper"; // Updated import
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "../nodemailer";

// Delay utility for rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function scrapeAndStoreProduct(productUrl: string) {
  if(!productUrl) {
    throw new Error("Product URL is required");
  }

  try {
    console.log(`🔄 Attempting to scrape: ${productUrl}`);
    
    // Validate URL and detect platform
    const platform = detectPlatform(productUrl);
    
    if (await platform === 'unsupported') {
      throw new Error("Unsupported platform. Currently supported: Amazon, eBay");
    }
    
    // Connect to database first
    await connectToDB();
    
    // Add a delay to avoid rate limiting (2-3 seconds between requests)
    await delay(2000 + Math.random() * 1000);
    
    // Try scraping with retry logic
    let scrapedProduct;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        // Use the appropriate scraper based on platform
        if (await platform === 'amazon') {
          scrapedProduct = await scrapeAmazonProduct(productUrl);
        } else if (await platform === 'ebay') {
          scrapedProduct = await scrapeEbayProduct(productUrl);
        }
        
        if (scrapedProduct) break;
      } catch (scrapeError: any) {
        retryCount++;
        console.log(`⚠️ Scrape attempt ${retryCount} failed: ${scrapeError.message}`);
        
        if (retryCount >= maxRetries) {
          throw new Error(`Failed to scrape product after ${maxRetries} attempts: ${scrapeError.message}`);
        }
        
        // Exponential backoff delay
        const delayTime = 2000 * Math.pow(2, retryCount - 1);
        console.log(`⏳ Waiting ${delayTime}ms before retry...`);
        await delay(delayTime);
      }
    }

    if(!scrapedProduct) {
      throw new Error("Failed to scrape product information");
    }
    
    // Add platform to scraped product data
    const enrichedProduct = {
      ...scrapedProduct,
      platform
    };
    
    console.log(`✅ Successfully scraped ${(await platform).toUpperCase()} product: ${enrichedProduct.title}`);

    let product = enrichedProduct;

    const existingProduct = await Product.findOne({ url: enrichedProduct.url });

    if(existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { 
          price: enrichedProduct.currentPrice,
          date: new Date()
        }
      ]

      product = {
        ...enrichedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      }
      
      console.log(`📊 Updated price history for existing product`);
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: enrichedProduct.url },
      product,
      { upsert: true, new: true }
    );

    console.log(`💾 ${(await platform).toUpperCase()} product saved to database: ${newProduct._id}`);
    revalidatePath(`/products/${newProduct._id}`);
    
    return {
      success: true,
      productId: newProduct._id,
      platform,
      message: `${(await platform).charAt(0).toUpperCase() + (await platform).slice(1)} product scraped and stored successfully`
    };
    
  } catch (error: any) {
    console.error(`❌ Error in scrapeAndStoreProduct: ${error.message}`);
    
    // Return structured error instead of throwing
    return {
      success: false,
      error: error.message,
      message: `Failed to create/update product: ${error.message}`
    };
  }
}

// Rest of your functions remain the same...
export async function getProductById(productId: string) {
  try {
    await connectToDB();

    const product = await Product.findOne({ _id: productId });

    if(!product) return null;

    return product;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getAllProducts() {
  try {
    await connectToDB();

    const products = await Product.find();

    return products;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    await connectToDB();

    const currentProduct = await Product.findById(productId);

    if(!currentProduct) return null;

    const similarProducts = await Product.find({
      _id: { $ne: productId },
      category: currentProduct.category, // Match by category for better similarity
      platform: currentProduct.platform, // Also match by platform
    }).limit(3);

    return similarProducts;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function addUserEmailToProduct(productId: string, userEmail: string) {
  try {
    await connectToDB();
    
    const product = await Product.findById(productId);

    if(!product) {
      return { success: false, message: "Product not found" };
    }

    const userExists = product.users.some((user: User) => user.email === userEmail);

    if(!userExists) {
      product.users.push({ 
        email: userEmail,
        createdAt: new Date()
      });

      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");

      await sendEmail(emailContent, [userEmail]);
      
      return { success: true, message: "Email added successfully" };
    }
    return { success: false, message: "Email already exists" };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

// New function to get products by platform
export async function getProductsByPlatform(platform: 'amazon' | 'ebay') {
  try {
    await connectToDB();

    const products = await Product.find({ platform });

    return products;
  } catch (error) {
    console.log(error);
    return [];
  }
}

// New function to get all platforms with product counts
export async function getPlatformStats() {
  try {
    await connectToDB();

    const stats = await Product.aggregate([
      {
        $group: {
          _id: "$platform",
          count: { $sum: 1 },
          totalTrackedUsers: { $sum: { $size: "$users" } }
        }
      },
      {
        $project: {
          platform: "$_id",
          count: 1,
          totalTrackedUsers: 1,
          _id: 0
        }
      }
    ]);

    return stats;
  } catch (error) {
    console.log(error);
    return [];
  }
}

// Optional: Function to batch scrape multiple products
export async function batchScrapeProducts(productUrls: string[]) {
  try {
    const results = [];
    
    for (const url of productUrls) {
      try {
        const result = await scrapeAndStoreProduct(url);
        results.push({
          url,
          success: result.success,
          productId: result.productId,
          message: result.message
        });
        
        // Add delay between requests to avoid rate limiting
        await delay(1000);
      } catch (error: any) {
        results.push({
          url,
          success: false,
          error: error.message,
          message: `Failed to scrape: ${error.message}`
        });
      }
    }
    
    return results;
  } catch (error: any) {
    console.error(`❌ Error in batchScrapeProducts: ${error.message}`);
    return [];
  }
}