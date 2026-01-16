"use server"

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
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
    
    // Validate URL format
    if (!productUrl.includes('amazon.')) {
      throw new Error("Invalid Amazon URL format");
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
        scrapedProduct = await scrapeAmazonProduct(productUrl);
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
    
    console.log(`✅ Successfully scraped: ${scrapedProduct.title}`);

    let product = scrapedProduct;

    const existingProduct = await Product.findOne({ url: scrapedProduct.url });

    if(existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { 
          price: scrapedProduct.currentPrice,
          date: new Date()
        }
      ]

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      }
      
      console.log(`📊 Updated price history for existing product`);
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    );

    console.log(`💾 Product saved to database: ${newProduct._id}`);
    revalidatePath(`/products/${newProduct._id}`);
    
    return {
      success: true,
      productId: newProduct._id,
      message: "Product scraped and stored successfully"
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