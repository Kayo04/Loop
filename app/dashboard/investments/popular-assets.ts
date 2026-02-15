
export interface PopularAsset {
    symbol: string;
    name: string;
    type: 'crypto' | 'stock' | 'etf';
}

export const POPULAR_ASSETS: PopularAsset[] = [
    // Stocks (Tech & Popular)
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
    { symbol: 'MSFT', name: 'Microsoft', type: 'stock' },
    { symbol: 'GOOGL', name: 'Google (Alphabet)', type: 'stock' },
    { symbol: 'AMZN', name: 'Amazon', type: 'stock' },
    { symbol: 'TSLA', name: 'Tesla', type: 'stock' },
    { symbol: 'NVDA', name: 'NVIDIA', type: 'stock' },
    { symbol: 'META', name: 'Meta (Facebook)', type: 'stock' },
    { symbol: 'NFLX', name: 'Netflix', type: 'stock' },
    { symbol: 'COIN', name: 'Coinbase', type: 'stock' },
    { symbol: 'PLTR', name: 'Palantir', type: 'stock' },
    { symbol: 'AMD', name: 'AMD', type: 'stock' },
    { symbol: 'INTC', name: 'Intel', type: 'stock' },

    // Crypto
    { symbol: 'BTC-USD', name: 'Bitcoin', type: 'crypto' },
    { symbol: 'ETH-USD', name: 'Ethereum', type: 'crypto' },
    { symbol: 'SOL-USD', name: 'Solana', type: 'crypto' },
    { symbol: 'ADA-USD', name: 'Cardano', type: 'crypto' },
    { symbol: 'XRP-USD', name: 'Ripple', type: 'crypto' },
    { symbol: 'DOGE-USD', name: 'Dogecoin', type: 'crypto' },
    { symbol: 'DOT-USD', name: 'Polkadot', type: 'crypto' },
    { symbol: 'MATIC-USD', name: 'Polygon', type: 'crypto' },
    { symbol: 'LINK-USD', name: 'Chainlink', type: 'crypto' },


    // ETFs / Index
    { symbol: 'SPY', name: 'S&P 500 ETF (US)', type: 'etf' },
    { symbol: 'QQQ', name: 'Nasdaq 100 ETF (US)', type: 'etf' },
    { symbol: 'VOO', name: 'Vanguard S&P 500 (US)', type: 'etf' },
    { symbol: 'VUAG.L', name: 'Vanguard S&P 500 (Acc)', type: 'etf' },
    { symbol: 'VUSA.L', name: 'Vanguard S&P 500 (Dist)', type: 'etf' },
    { symbol: 'VWCE.DE', name: 'Vanguard All-World (Acc)', type: 'etf' },
    { symbol: 'IWDA.AS', name: 'iShares Core MSCI World (Acc)', type: 'etf' }
];
