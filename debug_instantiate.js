async function main() {
    try {
        const mod = await import('yahoo-finance2');
        const YahooFinance = mod.default;
        
        console.log("Instantiating YahooFinance...");
        const yahooFinance = new YahooFinance();
        
        console.log("Fetching quote for KO...");
        const quote = await yahooFinance.quote('KO');
        console.log("Quote found:", quote ? "YES" : "NO");
        if (quote) {
            console.log("Price:", quote.regularMarketPrice);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
