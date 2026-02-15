
import { fetchStockData } from '../app/dashboard/investments/stock-service';

async function run() {
    console.log("--- DEBUG START ---");
    console.log("Fetching AMZN -> EUR");

    try {
        const data = await fetchStockData("AMZN", "EUR");
        console.log("--- RESULT AMZN ---");
        if (data) {
            console.log(`Symbol: ${data.symbol}`);
            console.log(`Price: ${data.price}`);
            console.log(`Currency: ${data.currency}`);
        } else {
            console.log("Data is null");
        }
    } catch (e) {
        console.error("--- ERROR ---");
        console.error(e);
    }

    console.log("--- DEBUG END ---");

    console.log("\n\nFetching TSLA -> EUR");
    try {
        const data2 = await fetchStockData("TSLA", "EUR");
        console.log("--- RESULT TSLA ---");
        if (data2) {
            console.log(`Symbol: ${data2.symbol}`);
            console.log(`Price: ${data2.price}`);
            console.log(`Currency: ${data2.currency}`);
        } else {
            console.log("Data is null");
        }
    } catch (e) {
        console.error("--- ERROR ---");
        console.error(e);
    }
}

run();
