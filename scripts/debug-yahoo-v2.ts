
import yahooFinance from 'yahoo-finance2';

async function testYahoo() {
    try {
        console.log("Fetching BTC-USD...");
        const quote = await yahooFinance.quote('BTC-USD');
        console.log("BTC-USD Price:", quote.regularMarketPrice);
        console.log("Currency:", quote.currency);

        console.log("\nFetching BTC-EUR...");
        const quoteEur = await yahooFinance.quote('BTC-EUR');
        console.log("BTC-EUR Price:", quoteEur.regularMarketPrice);
        console.log("Currency:", quoteEur.currency);

        console.log("\nFetching Exchange Rate EURUSD=X...");
        const rate = await yahooFinance.quote('EURUSD=X');
        console.log("EUR/USD Rate:", rate.regularMarketPrice);

    } catch (error) {
        console.error("Yahoo Finance Error:", error);
    }
}

testYahoo();
