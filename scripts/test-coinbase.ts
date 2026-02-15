
async function testCoinbase() {
    try {
        console.log("Fetching BTC-EUR from Coinbase...");
        const res = await fetch("https://api.coinbase.com/v2/prices/BTC-EUR/spot");
        const json = await res.json();
        console.log("Result:", json);
    } catch (e) {
        console.error("Error:", e);
    }
}

testCoinbase();
