
const yahooFinance = require('yahoo-finance2').default;

async function run() {
    try {
        console.log("Fetching USDEUR=X...");
        const q1 = await yahooFinance.quote("USDEUR=X");
        console.log("USDEUR=X:", q1.regularMarketPrice);

        console.log("Fetching EURUSD=X...");
        const q2 = await yahooFinance.quote("EURUSD=X");
        console.log("EURUSD=X:", q2.regularMarketPrice);

        // Check cross rates if user has BRL or outputting strange things
        console.log("Fetching USDBRL=X...");
        const q3 = await yahooFinance.quote("USDBRL=X");
        console.log("USDBRL=X:", q3.regularMarketPrice);

    } catch (e) {
        console.error(e);
    }
}

run();
