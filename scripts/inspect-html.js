
const { JSDOM } = require("jsdom");

async function run() {
    const symbol = process.argv[2] || "INTC";
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
    
    console.log("--- Selectors Check ---");
    
    // 1. fin-streamer
    const streamers = doc.querySelectorAll('fin-streamer');
    console.log(`Found ${streamers.length} fin-streamers`);
    streamers.forEach((s, i) => {
        if (s.getAttribute('data-field') === 'regularMarketPrice') {
            console.log(`Matched Streamer ${i}: ${s.outerHTML}`);
            console.log(`   Value: "${s.getAttribute('value')}"`);
            console.log(`   Text: "${s.textContent}"`);
        }
    });

    // 2. data-test="qsp-price"
    const qsp = doc.querySelector('[data-test="qsp-price"]');
    if (qsp) {
        console.log(`qsp-price found: ${qsp.outerHTML}`);
        console.log(`   Text: "${qsp.textContent}"`);
    } else {
        console.log("qsp-price NOT FOUND");
    }

    // 3. livePrice class (sometimes used)
    const livePrice = doc.querySelector('.livePrice');
    console.log(`livePrice class: ${livePrice ? livePrice.textContent : 'NOT FOUND'}`);

    // 4. Dump first 500 chars of body just in case
    // console.log("--- Body Start ---");
    // console.log(html.substring(0, 500));
}

run();
