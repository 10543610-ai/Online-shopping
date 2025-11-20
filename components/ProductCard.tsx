
import React from 'react';
import { Product } from '../types';
import PlatformIcon from './PlatformIcon';
import { ExternalLink } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 flex flex-col h-full p-5">
      
      {/* Header: Platform & Title */}
      <div className="flex items-start justify-between gap-3 mb-3">
         <div className="flex-grow">
            <div className="mb-2">
                <PlatformIcon code={product.platformCode} name={product.platform} />
            </div>
            <h3 className="text-gray-800 font-medium text-lg leading-snug line-clamp-2">
            {product.name}
            </h3>
         </div>
      </div>

      {/* Spacer to push bottom content down */}
      <div className="flex-grow"></div>

      {/* Footer: Price & Action */}
      <div className="pt-4 mt-2 border-t border-gray-100 flex items-end justify-between">
        <div>
            <span className="text-xs text-gray-500 block mb-1">優惠價格</span>
            <span className="text-2xl font-bold text-blue-600 font-mono tracking-tight">
                NT$ {product.price.toLocaleString()}
            </span>
        </div>

        <a 
            href={product.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm hover:shadow"
        >
            前往賣場
            <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};

export default ProductCard;
