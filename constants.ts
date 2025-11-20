
import { Product } from './types';

// 輔助函式 (與 App.tsx 邏輯相同，用於靜態資料)
const getUrl = (code: string, keyword: string) => {
    const k = encodeURIComponent(keyword);
    if (code === 'S') return `https://shopee.tw/search?keyword=${k}`;
    if (code === 'M') return `https://www.momoshop.com.tw/search/searchShop.jsp?keyword=${k}`;
    if (code === 'P') return `https://www.google.com/search?q=site%3Apchome.com.tw+${k}`;
    if (code === 'C') return `https://www.coupang.com/np/search?q=${k}`;
    return '#';
};

export const PRODUCTS: Product[] = [
  // 垃圾桶
  { 
    id: 1, 
    name: "不鏽鋼垃圾桶 8L", 
    keyword: "垃圾桶", 
    price: 299, 
    platform: "蝦皮", 
    platformCode: "S", 
    url: getUrl('S', "不鏽鋼垃圾桶 8L")
  },
  { 
    id: 2, 
    name: "日系簡約垃圾桶 10L", 
    keyword: "垃圾桶", 
    price: 350, 
    platform: "momo", 
    platformCode: "M", 
    url: getUrl('M', "日系簡約垃圾桶 10L")
  },
  { 
    id: 3, 
    name: "極簡白色垃圾桶 12L", 
    keyword: "垃圾桶", 
    price: 399, 
    platform: "PChome", 
    platformCode: "P", 
    url: getUrl('P', "極簡白色垃圾桶 12L")
  },
  { 
    id: 4, 
    name: "韓系風格垃圾桶 9L", 
    keyword: "垃圾桶", 
    price: 320, 
    platform: "酷澎", 
    platformCode: "C", 
    url: getUrl('C', "韓系風格垃圾桶 9L")
  },
  { 
    id: 5, 
    name: "智能感應垃圾桶 15L", 
    keyword: "垃圾桶", 
    price: 899, 
    platform: "PChome", 
    platformCode: "P", 
    url: getUrl('P', "智能感應垃圾桶 15L")
  },
  
  // 水壺 (Water bottles)
  { 
    id: 6, 
    name: "大容量保溫瓶 500ml", 
    keyword: "水壺", 
    price: 450, 
    platform: "momo", 
    platformCode: "M", 
    url: getUrl('M', "大容量保溫瓶 500ml")
  },
  { 
    id: 7, 
    name: "運動健身大水壺 1L", 
    keyword: "水壺", 
    price: 199, 
    platform: "蝦皮", 
    platformCode: "S", 
    url: getUrl('S', "運動健身大水壺 1L")
  },
  { 
    id: 8, 
    name: "耐熱玻璃水瓶", 
    keyword: "水壺", 
    price: 299, 
    platform: "酷澎", 
    platformCode: "C", 
    url: getUrl('C', "耐熱玻璃水瓶")
  }
];
