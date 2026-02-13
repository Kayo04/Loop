
import yahooFinance from 'yahoo-finance2';

async function test() {
    console.log("Testing Yahoo Finance directly...");
    try {
        const quote = await yahooFinance.quote("TSLA") as any;
        console.log("Success! Price:", quote.regularMarketPrice);
    } catch (e) {
        console.error("Error fetching quota:", e);
    }
}

test();
