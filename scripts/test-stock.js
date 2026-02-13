
const { fetchStockData } = require('./app/dashboard/investments/stock-service');

async function test() {
    console.log("Testing fetchStockData...");
    try {
        const data = await fetchStockData("TSLA");
        console.log("Success:", data);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
