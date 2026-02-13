
export interface PopularAsset {
    symbol: string;
    name: string;
    type: 'crypto' | 'stock' | 'etf';
}

export const POPULAR_ASSETS: PopularAsset[] = [
    // Crypto
    { symbol: 'BTC-USD', name: 'Bitcoin', type: 'crypto' },
    { symbol: 'ETH-USD', name: 'Ethereum', type: 'crypto' },
    { symbol: 'SOL-USD', name: 'Solana', type: 'crypto' },
    { symbol: 'ADA-USD', name: 'Cardano', type: 'crypto' },
    { symbol: 'XRP-USD', name: 'Ripple', type: 'crypto' },
    { symbol: 'DOGE-USD', name: 'Dogecoin', type: 'crypto' },

    // Tech Stocks
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
    { symbol: 'MSFT', name: 'Microsoft', type: 'stock' },
    { symbol: 'GOOGL', name: 'Google (Alphabet)', type: 'stock' },
    { symbol: 'AMZN', name: 'Amazon', type: 'stock' },
    { symbol: 'TSLA', name: 'Tesla', type: 'stock' },
    { symbol: 'NVDA', name: 'NVIDIA', type: 'stock' },
    { symbol: 'META', name: 'Meta (Facebook)', type: 'stock' },
    { symbol: 'NFLX', name: 'Netflix', type: 'stock' },

    // ETFs / Index
    { symbol: 'SPY', name: 'S&P 500 ETF', type: 'etf' },
    { symbol: 'QQQ', name: 'Nasdaq 100 ETF', type: 'etf' },
    { symbol: 'VOO', name: 'Vanguard S&P 500', type: 'etf' },
    { symbol: 'VTI', name: 'Vanguard Total Stock', type: 'etf' }
];
