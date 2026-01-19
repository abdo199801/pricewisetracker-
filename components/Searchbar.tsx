"use client"

import { scrapeAndStoreProduct } from '@/lib/actions';
import { FormEvent, useState } from 'react'

// Update to support multiple platforms
const isValidProductURL = (url: string) => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname.toLowerCase();

    // Amazon domains
    if(
      hostname.includes('amazon.com') || 
      hostname.includes('amazon.co.uk') ||
      hostname.includes('amazon.de') ||
      hostname.includes('amazon.fr') ||
      hostname.includes('amazon.it') ||
      hostname.includes('amazon.es') ||
      hostname.includes('amazon.ca') ||
      hostname.includes('amazon.com.au') ||
      hostname.includes('amazon.in') ||
      hostname.includes('amazon.') || 
      hostname.endsWith('amazon')
    ) {
      return { isValid: true, platform: 'Amazon' };
    }
    
    // eBay domains
    if(
      hostname.includes('ebay.com') || 
      hostname.includes('ebay.co.uk') ||
      hostname.includes('ebay.de') ||
      hostname.includes('ebay.fr') ||
      hostname.includes('ebay.it') ||
      hostname.includes('ebay.es') ||
      hostname.includes('ebay.ca') ||
      hostname.includes('ebay.com.au')
    ) {
      return { isValid: true, platform: 'eBay' };
    }
    
    return { isValid: false, platform: null };
  } catch (error) {
    return { isValid: false, platform: null };
  }
}

const Searchbar = () => {
  const [searchPrompt, setSearchPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const { isValid, platform } = isValidProductURL(searchPrompt);

    if(!isValid) {
      setError('Please provide a valid Amazon or eBay product link');
      return;
    }

    try {
      setIsLoading(true);
      setSuccess(`Scraping ${platform} product...`);

      // Scrape the product page
      const result = await scrapeAndStoreProduct(searchPrompt);
      
      if (result.success) {
        setSuccess(`${platform} product tracked successfully! Redirecting...`);
        setSearchPrompt('');
        
        // Redirect to product page after a short delay
        setTimeout(() => {
          window.location.href = `/products/${result.productId}`;
        }, 1500);
      } else {
        setError(result.message || `Failed to scrape ${platform} product`);
      }
    } catch (error: any) {
      console.error(error);
      setError('An error occurred while scraping the product');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <form 
        className="flex flex-wrap gap-4 mt-12" 
        onSubmit={handleSubmit}
      >
        <div className="flex-1 min-w-[250px]">
          <input 
            type="text"
            value={searchPrompt}
            onChange={(e) => {
              setSearchPrompt(e.target.value);
              setError('');
              setSuccess('');
            }}
            placeholder="Enter Amazon or eBay product link"
            className="searchbar-input w-full"
          />
        </div>

        <button 
          type="submit" 
          className="searchbar-btn whitespace-nowrap"
          disabled={searchPrompt === '' || isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
              Tracking...
            </span>
          ) : (
            'Track Product'
          )}
        </button>
      </form>

      {/* Platform hint */}
      <div className="mt-4 text-sm text-gray-600">
        <p>Supported platforms: 
          <span className="font-medium text-amber-600 ml-2">Amazon</span>
          <span className="mx-2">•</span>
          <span className="font-medium text-blue-600">eBay</span>
        </p>
        <p className="text-xs mt-1 text-gray-500">
          Example URLs: amazon.com/dp/..., ebay.com/itm/...
        </p>
      </div>

      {/* Success message */}
      {success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg transition-all duration-300">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg transition-all duration-300">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator with more details */}
      {isLoading && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent mr-3"></div>
              <p className="text-sm font-medium text-blue-800">
                Scraping product data...
              </p>
            </div>
            <div className="text-xs text-blue-600">
              This may take a few seconds
            </div>
          </div>
          <div className="mt-2 w-full bg-blue-100 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Searchbar