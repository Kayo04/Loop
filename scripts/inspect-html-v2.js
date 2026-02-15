
const { JSDOM } = require("jsdom");

async function run() {
    const symbol = process.argv[2] || "INTC";
    console.log(`[DEBUG] Fetching URL for ${symbol}...`);
    
    const url = `https://finance.yahoo.com/quote/${symbol}`;
    const res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
    });
    
    const html = await res.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    console.log(`[DEBUG] Page Title: ${doc.title}`);

    // 1. DUMP ALL STREAMERS
    const streamers = doc.querySelectorAll('fin-streamer');
    console.log(`[DEBUG] Found ${streamers.length} total streamers.`);
    
    let priceStreamer = null;
    streamers.forEach((s, i) => {
        const field = s.getAttribute('data-field');
        const sym = s.getAttribute('data-symbol');
        const val = s.getAttribute('value');
        if (field === 'regularMarketPrice' || field === 'marketPrice') {
             console.log(`[STREAMER MATCH] Index: ${i} Field: ${field} Symbol: ${sym} Value: ${val} Text: ${s.textContent}`);
             if (val && !isNaN(parseFloat(val))) priceStreamer = val;
        }
    });

    // 2. CHECK OTHER SELECTORS
    const qsp = doc.querySelector('[data-test="qsp-price"]');
    const qspId = doc.querySelector('[data-testid="qsp-price"]');
    const livePrice = doc.querySelector('.livePrice');
    
    console.log(`[SELECTOR] data-test="qsp-price": ${qsp ? qsp.textContent : 'NULL'}`);
    console.log(`[SELECTOR] data-testid="qsp-price": ${qspId ? qspId.textContent : 'NULL'}`);
    console.log(`[SELECTOR] .livePrice: ${livePrice ? livePrice.textContent : 'NULL'}`);

    // 3. CHECK FOR PRICE IN TITLE OR DESCRIPTION
    const metaPrice = doc.querySelector('meta[itemprop="price"]');
    console.log(`[META] itemprop="price": ${metaPrice ? metaPrice.getAttribute('content') : 'NULL'}`);

    console.log("[DEBUG] Done.");
}

run();
