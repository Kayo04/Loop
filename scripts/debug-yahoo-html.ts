
import { JSDOM } from 'jsdom';

async function testYahooHtml() {
    const symbol = 'AAPL';
    const url = `https://finance.yahoo.com/quote/${symbol}`;

    console.log(`Fetching HTML from ${url}...`);
    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        if (!res.ok) {
            console.error(`Error: ${res.status}`);
            return;
        }

        const html = await res.text();
        console.log(`HTML Length: ${html.length}`);

        const dom = new JSDOM(html);
        const doc = dom.window.document;

        // Try to find price
        // Selectors change, but usually [data-test="qsp-price"] or similar
        const priceElement = doc.querySelector('[data-test="qsp-price"]') || doc.querySelector('fin-streamer[data-field="regularMarketPrice"]');

        if (priceElement) {
            console.log("Found Price Element:", priceElement.textContent);
            console.log("Value:", priceElement.getAttribute("value") || priceElement.textContent);
        } else {
            console.log("Price element not found with standard selectors.");
            // Dump title to see if it loaded
            console.log("Page Title:", doc.title);
        }

    } catch (e) {
        console.error("Fetch error:", e);
    }
}

testYahooHtml();
