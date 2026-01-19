import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  // Check if image is valid (not empty or null)
  const hasValidImage = product.image && product.image.trim() !== '';
  
  return (
    <Link href={`/products/${product._id}`} className="product-card">
      <div className="product-card_img-container">
        {hasValidImage ? (
          <Image 
            src={product.image}
            alt={product.title}
            width={200}
            height={200}
            className="product-card_img"
          />
        ) : (
          // Fallback placeholder when image is empty
          <div className="product-card_placeholder">
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="product-title">{product.title}</h3>

        <div className="flex justify-between">
          <p className="text-black opacity-50 text-lg capitalize">
            {product.category}
          </p>

          <p className="text-black text-lg font-semibold">
            <span>{product?.currency}</span>
            <span>{product?.currentPrice}</span>
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;