async function main() {
    try {
        const { default: yahooFinance } = await import('yahoo-finance2');
        console.log("Fetching quote for KO...");
        const quote = await yahooFinance.quote('KO');
        console.log("Quote Result:", quote ? "Found" : "Null");
        if (quote) {
             console.log("DividendDate:", quote.dividendDate);
             console.log("ExDividendDate:", quote.exDividendDate); // if available
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

main();
