import { fetchStockData } from "../app/dashboard/investments/stock-service"
import fs from 'fs';

// Hook console.error/log to capture internal service logs
const originalError = console.error;
const originalLog = console.log;
let logOutput = "";

console.error = (...args) => {
    logOutput += `[ERROR] ${args.join(' ')}\n`;
    originalError.apply(console, args);
};
console.log = (...args) => {
    logOutput += `[LOG] ${args.join(' ')}\n`;
    originalLog.apply(console, args);
};

async function main() {
    const symbols = ['KO', 'AAPL']; // Reduced set for speed

    logOutput += `Testing fetchStockData for symbols: ${symbols.join(', ')}\n`;

    for (const symbol of symbols) {
        try {
            logOutput += `\n--- ${symbol} ---\n`;
            const data = await fetchStockData(symbol);
            if (data) {
                logOutput += `  Price: ${data.price}\n`;
                logOutput += `  Next Payment Date: ${data.nextPaymentDate || "(MISSING)"}\n`;
            } else {
                logOutput += `  FAILED to fetch data (Returned null).\n`;
            }
        } catch (error: any) {
            logOutput += `  EXCEPTION: ${error.message}\n`;
        }
    }

    fs.writeFileSync('test-output.txt', logOutput);
    originalLog("Done writing to test-output.txt");
}

main();
