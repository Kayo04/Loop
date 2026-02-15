
async function fetchChart(symbol) {
    console.log(`Fetching Chart for ${symbol}...`);
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    console.log("URL:", url);
    
    try {
        const res = await fetch(url, {
             headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });
        
        console.log("Status:", res.status);
        const text = await res.text();
        if (!res.ok) {
            console.log("Error:", text);
            return;
        }
        
        // Console log huge JSON snippet
        console.log(text.substring(0, 500));
        
        const data = JSON.parse(text);
        const meta = data.chart?.result?.[0]?.meta;
        if (meta) {
             console.log("Price:", meta.regularMarketPrice);
             console.log("Currency:", meta.currency);
             console.log("Symbol:", meta.symbol);
        } else {
             console.log("No meta found");
        }

    } catch (e) {
        console.error(e);
    }
}

async function run() {
    await fetchChart("AMZN");
    await fetchChart("TSLA");
    await fetchChart("USDEUR=X");
}

run();
