"use server"

import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from '../utils';

// Type definitions for platform-specific scraping
interface ScrapeResult {
  url: string;
  platform: string;
  currency: string;
  image: string;
  title: string;
  currentPrice: number;
  originalPrice: number;
  priceHistory: any[];
  discountRate: number;
  category: string;
  reviewsCount: number;
  stars: number;
  isOutOfStock: boolean;
  description: string;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
}

// Detect platform from URL
export async function detectPlatform(url: string): Promise<'amazon' | 'ebay' | 'unsupported'> {
  const urlObj = new URL(url.toLowerCase());
  const hostname = urlObj.hostname;

  // Amazon domains
  const amazonDomains = [
    'amazon.com',
    'amazon.co.uk',
    'amazon.de',
    'amazon.fr',
    'amazon.it',
    'amazon.es',
    'amazon.ca',
    'amazon.com.au',
    'amazon.in',
    'amazon.com.mx',
    'amazon.com.br',
    'amazon.nl',
  ];

  // eBay domains
  const ebayDomains = [
    'ebay.com',
    'ebay.co.uk',
    'ebay.de',
    'ebay.fr',
    'ebay.it',
    'ebay.es',
    'ebay.ca',
    'ebay.com.au',
    'ebay.at',
    'ebay.be',
    'ebay.ch',
    'ebay.ie',
    'ebay.in',
    'ebay.nl',
    'ebay.pl',
    'ebay.se',
  ];

  if (amazonDomains.some(domain => hostname.includes(domain))) {
    return 'amazon';
  } else if (ebayDomains.some(domain => hostname.includes(domain))) {
    return 'ebay';
  }

  return 'unsupported';
}

// BrightData proxy configuration
function getProxyOptions() {
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;

  return {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: 'brd.superproxy.io',
    port,
    rejectUnauthorized: false,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Connection': 'keep-alive',
    }
  };
}

// Amazon scraper
export async function scrapeAmazonProduct(url: string): Promise<ScrapeResult | null> {
  try {
    console.log(`🔍 Scraping Amazon product: ${url}`);
    
    const response = await axios.get(url, getProxyOptions());
    const $ = cheerio.load(response.data);

    // Extract product information
    const title = $('#productTitle').text().trim();
    
    if (!title) {
      console.error('No title found, product might not exist');
      return null;
    }

    // Price extraction for Amazon
    const currentPrice = extractPrice(
      $('.priceToPay span.a-price-whole'),
      $('.a.size.base.a-color-price'),
      $('.a-button-selected .a-color-base'),
      $('.a-price .a-offscreen'),
      $('.apexPriceToPay .a-offscreen')
    );

    const originalPrice = extractPrice(
      $('#priceblock_ourprice'),
      $('.a-price.a-text-price span.a-offscreen'),
      $('#listPrice'),
      $('#priceblock_dealprice'),
      $('.a-size-base.a-color-price'),
      $('.basisPrice .a-offscreen')
    );

    // Stock status
    const outOfStock = $('#availability span').text().trim().toLowerCase().includes('currently unavailable') ||
                      $('.a-color-success').text().trim().toLowerCase().includes('in stock') === false;

    // Images
    const images = 
      $('#imgBlkFront').attr('data-a-dynamic-image') || 
      $('#landingImage').attr('data-a-dynamic-image') ||
      $('.a-dynamic-image').attr('data-a-dynamic-image') ||
      '{}';

    const imageUrls = Object.keys(JSON.parse(images));
    const mainImage = imageUrls[0] || '';

    // Currency
    const currency = extractCurrency($('.a-price-symbol')) || '$';

    // Discount rate
    const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "") ||
                        $('.a-text-price .a-offscreen').first().text().match(/\d+%/)?.[0]?.replace('%', '') ||
                        '0';

    // Description
    const description = extractDescription($) || 
                       $('#feature-bullets .a-list-item').text().trim() ||
                       $('.product-description').text().trim() ||
                       'No description available';

    // Reviews and rating
    const reviewsCountText = $('#acrCustomerReviewText').text().trim().replace(/[^\d]/g, '');
    const reviewsCount = reviewsCountText ? parseInt(reviewsCountText) : 100;
    
    const starsText = $('.a-icon-alt').text().trim();
    const stars = starsText ? parseFloat(starsText.split(' ')[0]) : 4.5;

    // Category
    const category = $('#wayfinding-breadcrumbs_feature_div .a-link-normal').last().text().trim() || 
                    $('.a-breadcrumb .a-link-normal').last().text().trim() ||
                    'category';

    const price = Number(currentPrice) || Number(originalPrice) || 0;
    const origPrice = Number(originalPrice) || price || 0;

    return {
      url,
      platform: 'amazon',
      currency,
      image: mainImage,
      title,
      currentPrice: price,
      originalPrice: origPrice,
      priceHistory: [],
      discountRate: Number(discountRate),
      category,
      reviewsCount,
      stars,
      isOutOfStock: outOfStock,
      description,
      lowestPrice: price,
      highestPrice: origPrice,
      averagePrice: price,
    };
  } catch (error: any) {
    console.error(`❌ Error scraping Amazon product: ${error.message}`);
    throw error;
  }
}

// eBay scraper
export async function scrapeEbayProduct(url: string): Promise<ScrapeResult | null> {
  try {
    console.log(`🔍 Scraping eBay product: ${url}`);
    
    const response = await axios.get(url, getProxyOptions());
    const $ = cheerio.load(response.data);

    // Extract product title for eBay
    const title = $('#itemTitle').text().trim() || 
                  $('.x-item-title').text().trim() ||
                  $('.it-ttl').text().trim() ||
                  $('.product-title').text().trim() ||
                  $('.product-name').text().trim() ||
                  'No title available';

    // Price extraction for eBay
    const currentPrice = extractPrice(
      $('#prcIsum'),
      $('.vi-price'),
      $('.notranslate'),
      $('.x-price-primary'),
      $('.display-price'),
      $('.item-price'),
      $('.price'),
      $('.vi-VR-cvipPrice')
    );

    const originalPrice = extractPrice(
      $('#orgPrc'),
      $('.x-original-price'),
      $('.strikethrough'),
      $('.was .strikethrough'),
      $('.originalPrice')
    );

    // Stock status for eBay
    const outOfStock = 
      $('#qtySubTxt').text().toLowerCase().includes('only') === false && 
      $('#qtySubTxt').text().toLowerCase().includes('available') === false ||
      $('.w2b-sgl').text().toLowerCase().includes('sold out') ||
      $('.d-quantity__unavailable').length > 0 ||
      $('.ux-call-to-action').text().toLowerCase().includes('sold') ||
      $('.ux-textspan').text().toLowerCase().includes('ended');

    // Images for eBay
    const mainImage = $('#icImg').attr('src') || 
                     $('.ux-image-carousel-item.active img').attr('src') ||
                     $('#mainImgHldr img').attr('src') ||
                     $('.vi-image-gallery__img').attr('src') ||
                     $('.image img').first().attr('src') ||
                     '';

    // Extract currency from price text
    const priceText = $('#prcIsum').text().trim() || $('.vi-price').text().trim();
    let currency = '$';
    if (priceText) {
      if (priceText.includes('$')) currency = '$';
      else if (priceText.includes('£')) currency = '£';
      else if (priceText.includes('€')) currency = '€';
      else if (priceText.includes('₹')) currency = '₹';
      else if (priceText.includes('¥')) currency = '¥';
      else if (priceText.includes('CAD')) currency = 'CAD';
      else if (priceText.includes('AUD')) currency = 'AUD';
    }

    // Seller rating and reviews
    const sellerRating = $('#si-fb').text().trim().match(/\d+\.?\d*/)?.[0] || '0';
    const reviewsCountText = $('.mbg-l').text().trim().replace(/[^\d]/g, '');
    const reviewsCount = reviewsCountText ? parseInt(reviewsCountText) : 100;

    // Description for eBay
    const description = $('.itemAttr').text().trim() ||
                       $('.x-about-this-item').text().trim() ||
                       $('.desc_div').text().trim() ||
                       $('#desc_ifr').contents().text().trim() ||
                       'No description available';

    // Category for eBay
    const category = $('.vi-VR-brumb-lbl').text().trim() ||
                    $('.breadcrumb').text().trim() ||
                    'category';

    const price = Number(currentPrice) || Number(originalPrice) || 0;
    const origPrice = Number(originalPrice) || price || 0;

    return {
      url,
      platform: 'ebay',
      currency,
      image: mainImage,
      title,
      currentPrice: price,
      originalPrice: origPrice,
      priceHistory: [],
      discountRate: 0, // eBay doesn't typically show discount rates
      category,
      reviewsCount,
      stars: parseFloat(sellerRating) || 4.5,
      isOutOfStock: outOfStock,
      description,
      lowestPrice: price,
      highestPrice: origPrice,
      averagePrice: price,
    };
  } catch (error: any) {
    console.error(`❌ Error scraping eBay product: ${error.message}`);
    throw error;
  }
}

// Main unified scraper function
export async function scrapeProduct(url: string): Promise<ScrapeResult | null> {
  if (!url) {
    throw new Error('Product URL is required');
  }

  try {
    const platform = await detectPlatform(url);
    
    switch (platform) {
      case 'amazon':
        return await scrapeAmazonProduct(url);
      case 'ebay':
        return await scrapeEbayProduct(url);
      case 'unsupported':
        throw new Error('Unsupported platform. Currently supported: Amazon, eBay');
      default:
        throw new Error('Unknown platform');
    }
  } catch (error: any) {
    console.error(`❌ Error in scrapeProduct: ${error.message}`);
    throw error;
  }
}

// Utility function to test scraping
export async function testScrape(url: string) {
  try {
    const result = await scrapeProduct(url);
    console.log('Scraping result:', result);
    return result;
  } catch (error) {
    console.error('Test scraping failed:', error);
    return null;
  }
}