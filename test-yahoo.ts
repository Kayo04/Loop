
import { fetchStockData } from "./app/dashboard/investments/stock-service"

async function main() {
    try {
        console.log("Fetching KO...")
        const ko = await fetchStockData("KO")
        console.log("KO Data:", JSON.stringify(ko, null, 2))

        console.log("\nFetching AAPL...")
        const aapl = await fetchStockData("AAPL")
        console.log("AAPL Data:", JSON.stringify(aapl, null, 2))
    } catch (e) {
        console.error(e)
    }
}

main()
