"use server"

import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from '../utils';

export async function scrapeEbayProduct(url: string) {
  if(!url) return;

  // BrightData proxy configuration for eBay
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;

  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: 'brd.superproxy.io',
    port,
    rejectUnauthorized: false,
  }

  try {
    // Fetch the product page
    const response = await axios.get(url, options);
    const $ = cheerio.load(response.data);

    // Extract the product title for eBay
    const title = $('#itemTitle').text().trim() || 
                  $('.x-item-title').text().trim() ||
                  $('.it-ttl').text().trim();

    // Extract price for eBay
    const currentPrice = extractPrice(
      $('#prcIsum'),
      $('.vi-price'),
      $('.notranslate'),
      $('.x-price-primary')
    );

    const originalPrice = extractPrice(
      $('#orgPrc'),
      $('.x-original-price'),
      $('.strikethrough')
    );

    // Check stock status for eBay
    const outOfStock = $('#qtySubTxt').text().toLowerCase().includes('only') === false && 
                      $('#qtySubTxt').text().toLowerCase().includes('available') === false ||
                      $('.w2b-sgl').text().toLowerCase().includes('sold out') ||
                      $('.d-quantity__unavailable').length > 0;

    // Extract images for eBay
    const images = $('#icImg').attr('src') || 
                   $('.ux-image-carousel-item').attr('src') ||
                   $('#mainImgHldr img').attr('src') ||
                   $('.vi-image-gallery__img').attr('src') || '';

    const imageUrls = images ? [images] : [];

    // Extract currency (eBay usually shows currency in price)
    const currency = extractCurrency($('.notranslate')) || '$';
    
    // Extract seller rating and reviews count
    const sellerRating = $('#si-fb').text().trim() || '0';
    const reviewsCount = $('.mbg-l').text().trim() || '0';
    
    // Extract item specifics/description for eBay
    const description = extractDescription($) || 
                       $('.itemAttr').text().trim() ||
                       $('.x-about-this-item').text().trim();

    // Construct data object with scraped information
    const data = {
      url,
      platform: 'ebay',
      currency: currency || '$',
      image: imageUrls[0] || '',
      title: title || 'No title available',
      currentPrice: Number(currentPrice) || Number(originalPrice) || 0,
      originalPrice: Number(originalPrice) || Number(currentPrice) || 0,
      priceHistory: [],
      discountRate: 0, // eBay doesn't typically show discount rates
      category: 'category',
      reviewsCount: parseInt(reviewsCount) || 100,
      stars: parseFloat(sellerRating) || 4.5,
      isOutOfStock: outOfStock,
      description: description || 'No description available',
      lowestPrice: Number(currentPrice) || Number(originalPrice) || 0,
      highestPrice: Number(originalPrice) || Number(currentPrice) || 0,
      averagePrice: Number(currentPrice) || Number(originalPrice) || 0,
    }

    return data;
  } catch (error: any) {
    console.error(`Error scraping eBay product: ${error.message}`);
    throw error;
  }
}