import yahooFinance from 'yahoo-finance2';

// yahooFinance.suppressNotices(['yahooSurvey']);

export interface StockData {
    symbol: string;
    price: number;
    name: string;
    currency: string;
    annualDividendRate: number;
    dividendYield: number;
    nextPaymentDate?: string; // ISO Date string
    imageUrl?: string;
}

// Mock Data for Dev when Rate Limited
const MOCK_DATA: Record<string, Partial<StockData>> = {
    "TSLA": { name: "Tesla, Inc.", price: 245.30, currency: "USD", annualDividendRate: 0, dividendYield: 0, imageUrl: "https://logo.clearbit.com/tesla.com" },
    "AAPL": { name: "Apple Inc.", price: 189.50, currency: "USD", annualDividendRate: 0.96, dividendYield: 0.005, imageUrl: "https://logo.clearbit.com/apple.com" },
    "BTC-USD": { name: "Bitcoin USD", price: 42350.10, currency: "USD", annualDividendRate: 0, dividendYield: 0, imageUrl: "https://logo.clearbit.com/bitcoin.org" },
    "NVDA": { name: "NVIDIA Corporation", price: 610.20, currency: "USD", annualDividendRate: 0.16, dividendYield: 0.0003, imageUrl: "https://logo.clearbit.com/nvidia.com" },
    "MSFT": { name: "Microsoft Corporation", price: 405.60, currency: "USD", annualDividendRate: 3.00, dividendYield: 0.007, imageUrl: "https://logo.clearbit.com/microsoft.com" },
};

export async function fetchStockData(symbol: string): Promise<StockData | null> {
    try {
        // 1. Fetch Basic Quote (Price, Name)
        const quote = await yahooFinance.quote(symbol) as any;
        if (!quote) throw new Error("Quote not found");

        const price = quote.regularMarketPrice || 0;
        const name = quote.longName || quote.shortName || symbol;
        const currency = quote.currency || 'USD';

        // 2. Fetch Detailed Summary (Dividends, Dates, Profile)
        let summaryDetail: any = {};
        let calendarEvents: any = {};
        let summaryProfile: any = {};

        try {
            const summary = await yahooFinance.quoteSummary(symbol, { modules: ['summaryDetail', 'calendarEvents', 'summaryProfile'] }) as any;
            summaryDetail = summary.summaryDetail || {};
            calendarEvents = summary.calendarEvents || {};
            summaryProfile = summary.summaryProfile || {};
        } catch (e) {
            console.warn(`[StockService] Summary fetch failed for ${symbol}:`, e);
        }

        let annualDividendRate = summaryDetail?.dividendRate || quote.trailingAnnualDividendRate || 0;
        // Fallback: Estimate from yield if rate missing: price * yield
        let dividendYield = summaryDetail?.dividendYield || quote.trailingAnnualDividendYield || 0;

        // Next Payment Date Strategy:
        // 1. Explicit Payment Date (calendarEvents.dividendDate) - This is the actual pay date
        // 2. Ex-Dividend Date (calendarEvents.exDividendDate) - Proxy if pay date missing
        // 3. Quote Dividend Date (quote.dividendDate) - Reliable fallback
        let nextPaymentDate = undefined;

        if (calendarEvents?.dividendDate) {
            nextPaymentDate = calendarEvents.dividendDate.toISOString();
        } else if (calendarEvents?.exDividendDate) {
            nextPaymentDate = calendarEvents.exDividendDate.toISOString();
        } else if (quote.dividendDate) {
            nextPaymentDate = quote.dividendDate.toISOString();
        } else if (summaryDetail?.exDividendDate) {
            nextPaymentDate = summaryDetail.exDividendDate.toISOString();
        }

        // Logo Logic
        let imageUrl = undefined;
        if (summaryProfile?.website) {
            try {
                const domain = new URL(summaryProfile.website).hostname;
                imageUrl = `https://logo.clearbit.com/${domain}`;
            } catch (e) { }
        }

        return {
            symbol: symbol.toUpperCase(),
            price,
            name,
            currency,
            annualDividendRate,
            dividendYield,
            nextPaymentDate,
            imageUrl
        };
    } catch (error: any) {
        console.error(`Error fetching data for ${symbol}:`, error.message);

        // Fallback for Development / Rate Limits
        if (process.env.NODE_ENV === 'development' || error.message.includes("Too Many Requests")) {
            const mock = MOCK_DATA[symbol.toUpperCase()];
            if (mock) {
                console.log(`[DEV MODE] Returning MOCK data for ${symbol}`);
                return {
                    symbol: symbol.toUpperCase(),
                    price: mock.price!,
                    name: mock.name!,
                    currency: mock.currency!,
                    annualDividendRate: mock.annualDividendRate || 0,
                    dividendYield: mock.dividendYield || 0,
                    nextPaymentDate: undefined,
                    imageUrl: mock.imageUrl
                };
            }
        }
        return null;
    }
}
