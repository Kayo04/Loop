import yahooFinance from 'yahoo-finance2';
import { JSDOM } from 'jsdom';

// Suppress notices if needed
// yahooFinance.suppressNotices(['yahooSurvey']);

export interface StockData {
    symbol: string;
    price: number;
    name: string;
    currency: string;
    type: 'stock' | 'etf' | 'crypto' | 'fund' | 'other'; // New field for grouping
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
    console.log(`[StockService] Fetching ${symbol} -> ${targetCurrency}`);
    let symbolClean = symbol.toUpperCase().trim();

    // SMART MAPPING: Handle known problematic symbols or regional preferences
    if (symbolClean === 'VUAG') symbolClean = 'VUAG.L';
    else if (symbolClean === 'VUSA') symbolClean = 'VUSA.L';
    else if (symbolClean === 'VWCE') symbolClean = 'VWCE.DE';

    try {
        // STRATEGY 1: Try to fetch the symbol directly
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

        // FALLBACK 1: Try Coinbase for Crypto (BTC, ETH) if Yahoo fails
        if (symbolClean.includes("BTC") || symbolClean.includes("ETH") || symbolClean.includes("-USD")) {
            try {
                return await fetchCryptoFallback(symbolClean, targetCurrency);
            } catch (fallbackError) {
                console.error("Coinbase Fallback failed:", fallbackError);
            }
        }

        // FALLBACK 2: Try Yahoo Chart API (Robust against Consent Wall)
        try {
            console.log(`[StockService] Attempting Chart API Fallback for ${symbolClean}`);
            const chartData = await fetchStockChartFallback(symbolClean, targetCurrency);
            if (chartData) return chartData;
        } catch (chartError) {
            console.error("Chart Fallback failed:", chartError);
        }

        // FALLBACK 3: Try HTML Scraping for Stocks/ETFs (AAPL, SPY) if Yahoo API fails
        try {
            console.log(`[StockService] Attempting HTML Scraping Fallback for ${symbolClean}`);
            return await fetchStockHtmlFallback(symbolClean, targetCurrency);
        } catch (htmlError) {
            console.error("HTML Fallback failed:", htmlError);
        }

        return null;
    }
}

async function fetchStockHtmlFallback(symbol: string, targetCurrency: string, depth: number = 0): Promise<StockData | null> {
    if (depth > 1) {
        console.warn(`[StockService] Recursion limit reached for ${symbol}`);
        return null;
    }

    // 1. Fetch HTML
    const url = `https://finance.yahoo.com/quote/${symbol}`;
    let html = "";

    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        if (!res.ok) throw new Error(`HTML Fetch failed: ${res.status}`);
        html = await res.text();
    } catch (e: any) {
        // Catch HeadersOverflowError and other network issues gracefully
        if (e.code === 'UND_ERR_HEADERS_OVERFLOW' || e.message?.includes('Headers Overflow')) {
            console.error(`[StockService] Headers Overflow detected for ${symbol}. Yahoo is blocking/redirecting loop.`);
            return null;
        }
        throw e;
    }

    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // 2. Extract Price
    // Robust search: iterate all streamers to match data-symbol exactly (case-insensitive just in case)
    const allStreamers = Array.from(doc.querySelectorAll('fin-streamer'));
    console.log(`[StockService] Found ${allStreamers.length} total streamers on page.`);

    let priceText = "";

    let streamer = allStreamers.find(s => {
        const sSym = s.getAttribute('data-symbol');
        const sField = s.getAttribute('data-field');
        return sField === 'regularMarketPrice' && sSym?.toUpperCase() === symbol.toUpperCase();
    });

    // Debug: Log what we found
    if (streamer) {
        priceText = streamer.getAttribute("value") || streamer.textContent || "";
        console.log(`[StockService] MATCHED Streamer for ${symbol}: ${priceText}`);
    } else {
        console.warn(`[StockService] No specific streamer found for ${symbol}.`);
    }

    if (streamer) {
        // Already extracted above
    } else {
        // Fallback selectors
        const qsp = doc.querySelector('[data-test="qsp-price"]');
        const metaPrice = doc.querySelector('meta[itemprop="price"]'); // New robust fallback

        if (qsp) priceText = qsp.textContent || "";
        else if (metaPrice) priceText = metaPrice.getAttribute("content") || "";
    }

    // Clean price
    const price = parseFloat(priceText.replace(/,/g, ''));
    if (isNaN(price)) throw new Error("Could not parse price from HTML");

    // 3. Extract Name
    let name = symbol;
    const h1 = doc.querySelector('h1');
    if (h1) {
        // Usually "Apple Inc. (AAPL)"
        name = h1.textContent?.split('(')[0].trim() || symbol;
    }

    // 4. Extract Currency
    // Often in a span like "Currency in USD"
    let currency = 'USD'; // Default
    const contentText = doc.body.textContent || "";
    if (contentText.includes("Currency in USD")) currency = 'USD';
    else if (contentText.includes("Currency in EUR")) currency = 'EUR';
    else if (contentText.includes("Currency in GBP")) currency = 'GBP';

    // 5. Convert Currency if needed
    console.log(`[StockService] ${symbol} Currency: ${currency}, Target: ${targetCurrency}`);

    if (currency !== targetCurrency) {
        try {
            // We reuse the API for exchange rate if possible, or we could scrape that too. 
            // Attempt to fetch exchange rate via API, then HTML fallback
            let rate = 1;
            const pair = `${currency}${targetCurrency}=X`;

            try {
                const rateQuote = await yahooFinance.quote(pair);
                if (rateQuote && rateQuote.regularMarketPrice) {
                    rate = rateQuote.regularMarketPrice;
                } else {
                    throw new Error("Rate API failed");
                }
            } catch (rateError) {
                console.warn(`[StockService] Rate API failed for ${pair}, trying HTML fallback`);
                // Fallback: Scrape the rate
                try {
                    // Pass depth+1 to prevent infinite recursion
                    const rateData = await fetchStockHtmlFallback(pair, targetCurrency, depth + 1);
                    if (rateData && rateData.price) {
                        if (rateData.price > 200 || rateData.price < 0.005) {
                            console.warn(`[StockService] Scraped rate ${rateData.price} for ${pair} seems invalid. Rejecting.`);
                            throw new Error("Invalid rate value");
                        }
                        rate = rateData.price;
                    }
                } catch (htmlRateError) {
                    console.error(`[StockService] Rate HTML Fallback failed for ${pair}`);

                    // Final Fallback: Hardcoded approximate rates (better than breaking)
                    const FALLBACK_RATES: Record<string, number> = {
                        'USDEUR=X': 0.93,
                        'EURUSD=X': 1.08,
                        'USDGBP=X': 0.79,
                        'GBPUSD=X': 1.26,
                        'USDBRL=X': 5.00,
                        'BRLUSD=X': 0.20
                    };

                    if (FALLBACK_RATES[pair]) {
                        console.warn(`[StockService] Using Hardcoded Fallback Rate for ${pair}: ${FALLBACK_RATES[pair]}`);
                        rate = FALLBACK_RATES[pair];
                    }
                }
            }

            console.log(`[StockService] Converting ${price} ${currency} to ${targetCurrency} using rate ${rate}`);

            if (rate !== 1) {
                return {
                    symbol,
                    price: price * rate,
                    name,
                    currency: targetCurrency,
                    type: inferType(symbol),
                    annualDividendRate: 0,
                    dividendYield: 0,
                    imageUrl: `https://logo.clearbit.com/${symbol.toLowerCase()}.com`
                };
            }
        } catch (e) {
            console.warn("Could not convert currency in fallback");
        }
    }

    return {
        symbol,
        price,
        name,
        currency,
        type: inferType(symbol),
        annualDividendRate: 0,
        dividendYield: 0,
        imageUrl: undefined
    };
}

function inferType(symbol: string): StockData['type'] {
    if (['SPY', 'VOO', 'QQQ', 'IVV', 'VUAG', 'VUSA', 'VWCE'].includes(symbol.split('.')[0])) return 'etf';
    if (symbol.includes('-USD') || symbol.includes('BTC') || symbol.includes('ETH')) return 'crypto';
    return 'stock';
}

function getBaseDomain(symbol: string) {
    if (symbol === 'BTC') return 'bitcoin.org';
    if (symbol === 'ETH') return 'ethereum.org';
    return 'coinbase.com';
}

function mapQuoteToStockData(quote: any, symbol: string): StockData {
    let type: StockData['type'] = 'stock';
    const qType = quote.quoteType || '';

    if (qType === 'ETF') type = 'etf';
    else if (qType === 'CRYPTOCURRENCY') type = 'crypto';
    else if (qType === 'MUTUALFUND') type = 'fund';

    return {
        symbol: symbol,
        price: quote.regularMarketPrice || 0,
        name: quote.longName || quote.shortName || symbol,
        currency: quote.currency || 'USD',
        type,
        annualDividendRate: quote.trailingAnnualDividendRate || 0,
        dividendYield: quote.trailingAnnualDividendYield || 0,
        nextPaymentDate: undefined,
        imageUrl: undefined
    };
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
        type: 'crypto', // Coinbase is always crypto
        annualDividendRate: 0,
        dividendYield: 0,
        imageUrl: `https://logo.clearbit.com/${getBaseDomain(base)}`,
        nextPaymentDate: undefined
    };
}

async function fetchStockChartFallback(symbol: string, targetCurrency: string): Promise<StockData | null> {
    // Unofficial Yahoo Chart API (v8) - Often bypasses consent wall/cookie checks
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;

    // Custom clean headers to avoid bot detection
    const res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
    });

    if (!res.ok) throw new Error(`Chart API Fetch failed: ${res.status}`);

    const json = await res.json();
    const result = json.chart?.result?.[0];
    const meta = result?.meta;

    if (!meta || !meta.regularMarketPrice) {
        throw new Error("No chart data found");
    }

    let price = meta.regularMarketPrice;
    let currency = meta.currency || 'USD';
    const name = meta.shortName || meta.longName || symbol; // Chart API has names!

    console.log(`[StockService] Chart API Success: ${symbol} = ${price} ${currency}`);

    // Convert Currency if needed
    if (currency !== targetCurrency) {
        // Reuse the HTML fallback logic's rate conversion or try Chart API for rate
        // Simplest is to recurse or fetch rate via Chart API
        try {
            const pair = `${currency}${targetCurrency}=X`;
            // Try fetching rate via Chart API too!
            const rateUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${pair}?interval=1d&range=1d`;
            const rateRes = await fetch(rateUrl);
            let rate = 1;

            if (rateRes.ok) {
                const rateJson = await rateRes.json();
                const rateMeta = rateJson.chart?.result?.[0]?.meta;
                if (rateMeta && rateMeta.regularMarketPrice) {
                    rate = rateMeta.regularMarketPrice;
                }
            }

            // Safety check on rate
            if (rate > 200 || rate < 0.005) {
                // Fallback to hardcoded if chart API gives weird rate
                const FALLBACK_RATES: Record<string, number> = {
                    'USDEUR=X': 0.93,
                    'EURUSD=X': 1.08,
                    'USDGBP=X': 0.79,
                    'GBPUSD=X': 1.26,
                    'USDBRL=X': 5.00,
                    'BRLUSD=X': 0.20
                };
                if (FALLBACK_RATES[pair]) rate = FALLBACK_RATES[pair];
            }

            if (rate !== 1) {
                price = price * rate;
                currency = targetCurrency;
            }

        } catch (e) {
            console.warn("[StockService] Chart API Rate conversion failed", e);
        }
    }

    return {
        symbol: symbol,
        price,
        name,
        currency,
        type: inferType(symbol),
        annualDividendRate: 0,
        dividendYield: 0,
        imageUrl: `https://logo.clearbit.com/${symbol.toLowerCase()}.com`
    };
}
