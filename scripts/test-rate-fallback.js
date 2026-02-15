
const { JSDOM } = require("jsdom");

async function fetchStockHtmlFallback(symbol) {
    console.log(`Fetching ${symbol}...`);
    const url = `https://finance.yahoo.com/quote/${symbol}`;
    const res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
    });
    
    const html = await res.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    // Check title
    console.log("Title:", doc.title);
    
    let priceText = "";
    const streamer = doc.querySelector(`fin-streamer[data-field="regularMarketPrice"][data-symbol="${symbol}"]`) || 
                     doc.querySelector(`fin-streamer[data-field="regularMarketPrice"]`);
    
    if (streamer) {
        priceText = streamer.getAttribute("value") || streamer.textContent || "";
        console.log("Streamer found:", priceText);
    } else {
        const qsp = doc.querySelector('[data-test="qsp-price"]');
        const metaPrice = doc.querySelector('meta[itemprop="price"]');
        
        if (qsp) {
             priceText = qsp.textContent || "";
             console.log("QSP found:", priceText);
        }
        else if (metaPrice) {
             priceText = metaPrice.getAttribute("content") || "";
             console.log("Meta found:", priceText);
        }
    }
    
    return parseFloat(priceText.replace(/,/g, ''));
}

async function run() {
    const rate = await fetchStockHtmlFallback("USDEUR=X");
    console.log("USDEUR=X Rate:", rate);
    
    const rate2 = await fetchStockHtmlFallback("EURUSD=X");
    console.log("EURUSD=X Rate:", rate2);
}

run();
