
export interface Product {
  id: number;
  name: string;
  keyword: string;
  price: number;
  platform: string;
  platformCode: 'M' | 'P' | 'S' | 'C' | 'O'; // Momo, PChome, Shopee, Coupang, Other
  url: string;
}

export type SortOption = 'price-asc' | 'price-desc';
