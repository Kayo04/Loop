
const { JSDOM } = require("jsdom");

async function fetchStockCsv(symbol) {
    console.log(`Fetching CSV for ${symbol}...`);
    // Period: last 5 days just to be safe, interval 1d
    const period1 = Math.floor(Date.now() / 1000) - 86400 * 5;
    const period2 = Math.floor(Date.now() / 1000);
    const url = `https://query1.finance.yahoo.com/v7/finance/download/${symbol}?period1=${period1}&period2=${period2}&interval=1d&events=history&includeAdjustedClose=true`;
    
    console.log("URL:", url);

    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });
        
        console.log("Status:", res.status);
        if (!res.ok) {
            console.log("Error body:", await res.text());
            return;
        }

        const text = await res.text();
        console.log("--- CSV START ---");
        console.log(text);
        console.log("--- CSV END ---");
        
        // Parse CSV simply
        const lines = text.trim().split('\n');
        // Retrieve last line
        const lastLine = lines[lines.length - 1];
        console.log("Last Line:", lastLine);
        
        // Format: Date,Open,High,Low,Close,Adj Close,Volume
        const parts = lastLine.split(',');
        if (parts.length >= 6) {
             const close = parts[4];
             const adjClose = parts[5];
             console.log(`Close: ${close}, Adj Close: ${adjClose}`);
             // If Close is null (sometimes happens for current day), try checking previous line?
             if (close === 'null') {
                 console.log("Close is null, trying previous line...");
                 const prevLine = lines[lines.length - 2];
                 console.log("Prev Line:", prevLine);
             }
        }

    } catch (e) {
        console.error(e);
    }
}

async function run() {
    await fetchStockCsv("AMZN");
    await fetchStockCsv("USDEUR=X");
}

run();
