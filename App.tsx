
import React, { useState, useCallback } from 'react';
import { ShoppingBag, Loader2, AlertCircle, Clock } from 'lucide-react';
import SearchBar from './components/SearchBar';
import ProductCard from './components/ProductCard';
import { PRODUCTS } from './constants';
import { Product } from './types';
import { GoogleGenAI, Type } from "@google/genai";

// 安全取得 AI Client 的輔助函式
// 避免在沒有 API Key 的環境下直接 new GoogleGenAI 導致錯誤
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// 產生各賣場真實搜尋連結的輔助函式
const getPlatformUrl = (platformCode: string, keyword: string): string => {
  const encodedKeyword = encodeURIComponent(keyword);
  switch (platformCode) {
    case 'M': // momo
      return `https://www.momoshop.com.tw/search/searchShop.jsp?keyword=${encodedKeyword}`;
    case 'S': // Shopee
      return `https://shopee.tw/search?keyword=${encodedKeyword}`;
    case 'P': // PChome (使用 Google Site Search)
      return `https://www.google.com/search?q=site%3Apchome.com.tw+${encodedKeyword}`;
    case 'C': // Coupang
      return `https://www.coupang.com/np/search?q=${encodedKeyword}`;
    default:
      return `https://www.google.com/search?q=${encodedKeyword}`;
  }
};

const App: React.FC = () => {
  const [results, setResults] = useState<Product[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchedTerm, setSearchedTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useAiSearch, setUseAiSearch] = useState(true);
  
  // 搜尋歷史記錄狀態
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('shopping_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const addToHistory = (term: string) => {
    setSearchHistory(prev => {
      // 移除重複並將最新的加到最前面，只保留前 5 筆
      const newHistory = [term, ...prev.filter(h => h !== term)].slice(0, 5);
      localStorage.setItem('shopping_search_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const handleSearch = useCallback(async (rawQuery: string) => {
    const query = rawQuery.trim();
    if (!query) {
      setResults([]);
      return;
    }

    setSearchedTerm(query);
    setHasSearched(true);
    setIsLoading(true);
    setError(null);
    
    // 更新歷史記錄
    addToHistory(query);

    try {
      const aiClient = getAiClient();
      
      if (useAiSearch && aiClient) {
        // 使用 Gemini AI 進行動態搜尋
        const model = "gemini-2.5-flash";
        
        const prompt = `
          請擔任一個台灣的購物比價助手。
          使用者想搜尋商品：「${query}」。
          請生成 8 筆該商品的搜尋結果資料，模擬來自台灣主要電商平台 (momo, PChome, 蝦皮, 酷澎) 的搜尋結果。
          
          規則：
          1. 商品名稱要具體且真實，包含品牌或型號更佳。
          2. 價格請用新台幣 (TWD)，並根據該商品的真實市場行情設定合理的價格範圍 (有些便宜有些貴)。
          3. 平台請平均分配 (M: momo, P: PChome, S: 蝦皮, C: 酷澎)。
          4. url 欄位請留空字串，後端會自動產生。
        `;

        const response = await aiClient.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  name: { type: Type.STRING },
                  keyword: { type: Type.STRING },
                  price: { type: Type.INTEGER },
                  platform: { type: Type.STRING },
                  platformCode: { type: Type.STRING, enum: ["M", "P", "S", "C"] },
                  url: { type: Type.STRING },
                },
                required: ["id", "name", "price", "platform", "platformCode"]
              }
            }
          }
        });

        const jsonText = response.text;
        if (jsonText) {
          const aiProducts = JSON.parse(jsonText);
          
          // 後製處理：生成真實賣場搜尋連結
          const productsWithMetadata = aiProducts.map((product: any) => {
             // 生成真實賣場連結 (使用商品名稱搜尋，讓使用者能找到該具體商品)
             const realUrl = getPlatformUrl(product.platformCode, product.name);

             return { 
                ...product, 
                url: realUrl,
             } as Product;
          });

          // 再次確保價格排序
          const sorted = productsWithMetadata.sort((a: Product, b: Product) => a.price - b.price);
          setResults(sorted);
        } else {
          throw new Error("AI 回傳無資料");
        }

      } else {
        // 備用方案：如果沒有 API Key 或關閉 AI 模式，使用原本的靜態過濾
        if (!aiClient && useAiSearch) {
           console.warn("未偵測到 API Key，已自動切換回本機範例模式。");
        }
        
        const lowerQuery = query.toLowerCase();
        const filtered = PRODUCTS.filter((product) => {
          const keywordMatch = product.keyword.toLowerCase().includes(lowerQuery);
          const nameMatch = product.name.toLowerCase().includes(lowerQuery);
          return keywordMatch || nameMatch;
        });
        const sorted = filtered.sort((a, b) => a.price - b.price);
        setResults(sorted);
      }

    } catch (err) {
      console.error("搜尋發生錯誤:", err);
      setError("連線 AI 發生錯誤，已切換為本機展示資料。");
      // 錯誤時 fallback 到本地資料，讓使用者至少看得到東西
      // 直接使用 query.toLowerCase() 避免定義未使用變數
      const filtered = PRODUCTS.filter((product) => {
          return product.keyword.toLowerCase().includes(query.toLowerCase()) || 
                 product.name.toLowerCase().includes(query.toLowerCase());
      });
      setResults(filtered.sort((a, b) => a.price - b.price));
    } finally {
      setIsLoading(false);
    }
  }, [useAiSearch]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      
      {/* Header Section */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white pt-8 pb-6 px-4 text-center shadow-lg">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <ShoppingBag size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">購物比價 Pro</h1>
        </div>
        <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto mb-4">
          AI 智能搜尋 momo、PChome、蝦皮、酷澎等各大平台，找到最優惠價格。
        </p>
        
        {/* AI Toggle (Optional UI for demo purposes) */}
        <div className="flex items-center justify-center gap-2 text-xs text-blue-200">
          <label className="flex items-center cursor-pointer gap-2 select-none">
             <div className={`w-8 h-4 rounded-full relative transition-colors ${useAiSearch ? 'bg-green-400' : 'bg-gray-600'}`} onClick={() => setUseAiSearch(!useAiSearch)}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${useAiSearch ? 'left-4.5 translate-x-full -ml-4' : 'left-0.5'}`}></div>
             </div>
             {useAiSearch ? 'AI 智能搜尋模式 (已開啟)' : '本機範例模式'}
          </label>
        </div>
      </header>

      {/* Sticky Search Bar */}
      <SearchBar onSearch={handleSearch} />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {error && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3 text-yellow-800">
                <AlertCircle size={20} />
                <span>{error}</span>
            </div>
        )}

        {!hasSearched && !isLoading && (
          <div className="flex flex-col items-center justify-center h-64 text-center opacity-60">
             <div className="mb-4 p-6 bg-white rounded-full shadow-inner">
               <ShoppingBag size={48} className="text-blue-300" />
             </div>
             <h2 className="text-xl font-medium text-gray-500">輸入商品名稱開始比價</h2>
             <p className="text-gray-400 mt-2 text-sm">試試搜尋「iPhone 15」、「衛生紙」或「電風扇」</p>
          </div>
        )}

        {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <h3 className="text-lg font-medium text-gray-600">AI 正在幫您比價中...</h3>
                <p className="text-gray-400 text-sm">正在搜尋各大賣場優惠方案...</p>
            </div>
        )}

        {!isLoading && hasSearched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">查無此商品</h2>
            <p className="text-gray-600">
              找不到符合「{searchedTerm}」的商品，請嘗試其他關鍵字。
            </p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-700">
                   搜尋「{searchedTerm}」共有 {results.length} 筆結果
                </h2>
                <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    排序：價格由低到高
                </span>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
             </div>
          </div>
        )}

        {/* 歷史記錄區塊 */}
        {searchHistory.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-4 text-gray-500">
              <Clock size={18} />
              <h3 className="text-sm font-semibold uppercase tracking-wider">最近搜尋記錄</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {searchHistory.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(term)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all duration-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} 購物比價 Pro. </p>
          <p className="mt-1 text-xs text-gray-300">注意：本頁面使用 AI 生成模擬比價資料，實際價格請以各平台官網為準。</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
