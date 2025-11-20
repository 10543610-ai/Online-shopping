import React from 'react';

interface PlatformIconProps {
  code: string;
  name: string;
}

const PlatformIcon: React.FC<PlatformIconProps> = ({ code, name }) => {
  const getStyle = (code: string) => {
    switch (code) {
      case 'M': // momo
        return 'bg-pink-500 text-white';
      case 'P': // PChome
        return 'bg-blue-600 text-white';
      case 'S': // Shopee
        return 'bg-orange-500 text-white';
      case 'C': // Coupang
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="flex items-center gap-2 group cursor-pointer">
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm
          transition-transform duration-200 group-hover:scale-110 group-hover:shadow-md
          ${getStyle(code)}
        `}
      >
        {code}
      </div>
      <span className="text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
        {name}
      </span>
    </div>
  );
};

export default PlatformIcon;