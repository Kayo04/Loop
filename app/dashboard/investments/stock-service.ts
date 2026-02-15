import yahooFinance from 'yahoo-finance2';

// Suppress notices if needed
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

// Mock Data - Minimal and clearly marked if used (fallback only)
// Removed outdated static prices to avoid confusion.
const MOCK_DATA: Record<string, Partial<StockData>> = {
    // We can add generic fallbacks here if strictly necessary, but better to return null error than wrong price.
};

export async function fetchStockData(symbol: string, targetCurrency: string = 'EUR'): Promise<StockData | null> {
    const symbolClean = symbol.toUpperCase().trim();

    try {
        // STRATEGY 1: Try to fetch the symbol directly in the target currency (Works well for Crypto/Forex)
        // e.g. BTC-USD -> BTC-EUR
        let querySymbol = symbolClean;
        let isDirectPair = false;

        // Simple heuristic: If it looks like a crypto pair (contains "-"), try swapping the suffix
        if (symbolClean.includes("-") && targetCurrency !== 'USD') {
            const parts = symbolClean.split("-");
            if (parts.length === 2) {
                // Try fetching BTC-EUR instead of BTC-USD
                const potentialSymbol = `${parts[0]}-${targetCurrency}`;
                try {
                    const quote = await yahooFinance.quote(potentialSymbol);
                    if (quote && quote.regularMarketPrice) {
                        // Found it directly!
                        return mapQuoteToStockData(quote, potentialSymbol);
                    }
                } catch (e) {
                    // Ignore, fallback to original symbol
                }
            }
        }

        // STRATEGY 2: Fetch Original Symbol + Exchange Rate
        const quote = await yahooFinance.quote(symbolClean);
        if (!quote || !quote.regularMarketPrice) throw new Error("Quote not found");

        let price = quote.regularMarketPrice;
        let currency = quote.currency || 'USD';

        // Conversion Logic
        if (currency !== targetCurrency) {
            try {
                // Fetch exchange rate, e.g. EURUSD=X (1 EUR = x USD) or USDEUR=X
                // Yahoo format for pair A to B is usually ADB=X
                const pair = `${currency}${targetCurrency}=X`;
                const rateQuote = await yahooFinance.quote(pair);

                if (rateQuote && rateQuote.regularMarketPrice) {
                    price = price * rateQuote.regularMarketPrice;
                    currency = targetCurrency;
                } else {
                    console.warn(`[StockService] Could not fetch exchange rate for ${pair}`);
                }
            } catch (e) {
                console.warn(`[StockService] Exchange rate fetch failed:`, e);
            }
        }

        // Fetch Extra Details (Summary) for Dividends/Logos
        // We do this AFTER price to ensure we at least have price.
        let summaryDetail: any = {};
        let calendarEvents: any = {};
        let summaryProfile: any = {};

        try {
            const summary = await yahooFinance.quoteSummary(symbolClean, { modules: ['summaryDetail', 'calendarEvents', 'summaryProfile'] });
            summaryDetail = summary.summaryDetail || {};
            calendarEvents = summary.calendarEvents || {};
            summaryProfile = summary.summaryProfile || {};
        } catch (e) {
            console.warn(`[StockService] Summary fetch failed for ${symbolClean}:`, e);
        }

        const data = mapQuoteToStockData({ ...quote, regularMarketPrice: price, currency }, symbolClean);

        // Enrich with summary data
        data.annualDividendRate = summaryDetail?.dividendRate || quote.trailingAnnualDividendRate || 0;
        data.dividendYield = summaryDetail?.dividendYield || quote.trailingAnnualDividendYield || 0;

        // Next Payment Date Logic
        if (calendarEvents?.dividendDate) {
            data.nextPaymentDate = calendarEvents.dividendDate.toISOString();
        } else if (calendarEvents?.exDividendDate) {
            data.nextPaymentDate = calendarEvents.exDividendDate.toISOString();
        } else if (quote.dividendDate) {
            data.nextPaymentDate = quote.dividendDate.toISOString();
        }

        // Logo Logic
        if (summaryProfile?.website) {
            try {
                const domain = new URL(summaryProfile.website).hostname;
                data.imageUrl = `https://logo.clearbit.com/${domain}`;
            } catch (e) { }
        }

        return data;

    } catch (error: any) {
        console.error(`Error fetching data for ${symbol}:`, error.message);

        // FALLBACK: Try Coinbase for Crypto (BTC, ETH) if Yahoo fails
        if (symbolClean.includes("BTC") || symbolClean.includes("ETH")) {
            try {
                return await fetchCryptoFallback(symbolClean, targetCurrency);
            } catch (fallbackError) {
                console.error("Coinbase Fallback failed:", fallbackError);
            }
        }

        return null;
    }
}

async function fetchCryptoFallback(symbol: string, currency: string): Promise<StockData | null> {
    // Symbol format expected: BTC-USD or BTC
    let base = symbol.split("-")[0];
    if (base === "BITCOIN") base = "BTC";
    if (base === "ETHEREUM") base = "ETH";

    const pair = `${base}-${currency}`;
    const url = `https://api.coinbase.com/v2/prices/${pair}/spot`;

    console.log(`[StockService] Attempting Coinbase Fallback for ${pair}`);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Coinbase API returned ${res.status}`);

    const json = await res.json();
    const amount = parseFloat(json.data.amount);

    return {
        symbol: symbol,
        price: amount,
        name: `${base} (${currency})`,
        currency: currency,
        annualDividendRate: 0,
        dividendYield: 0,
        imageUrl: `https://logo.clearbit.com/${getBaseDomain(base)}`,
        nextPaymentDate: undefined
    };
}

function getBaseDomain(symbol: string) {
    if (symbol === 'BTC') return 'bitcoin.org';
    if (symbol === 'ETH') return 'ethereum.org';
    return 'coinbase.com';
}

function mapQuoteToStockData(quote: any, symbol: string): StockData {
    return {
        symbol: symbol,
        price: quote.regularMarketPrice || 0,
        name: quote.longName || quote.shortName || symbol,
        currency: quote.currency || 'USD',
        annualDividendRate: quote.trailingAnnualDividendRate || 0,
        dividendYield: quote.trailingAnnualDividendYield || 0,
        nextPaymentDate: undefined,
        imageUrl: undefined
    };
}
