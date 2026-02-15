
import yahooFinance from 'yahoo-finance2';

async function testStock() {
    try {
        console.log("Fetching AAPL (Stock)...");
        const quote = await yahooFinance.quote('AAPL');
        console.log("AAPL Price:", quote.regularMarketPrice);

        console.log("\nFetching SPY (ETF)...");
        const quoteSpy = await yahooFinance.quote('SPY');
        console.log("SPY Price:", quoteSpy.regularMarketPrice);

    } catch (error) {
        console.error("Yahoo Finance Error:", error);
    }
}

testStock();
