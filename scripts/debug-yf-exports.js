
const yf = require('yahoo-finance2');
console.log("Keys of yf:", Object.keys(yf));
console.log("yf.default keys:", yf.default ? Object.keys(yf.default) : "no default");

if (yf.default) {
    console.log("Is YahooFinance in yf.default?", 'YahooFinance' in yf.default);
    // Maybe it's not enumerable?
    console.log("yf.default.YahooFinance type:", typeof yf.default.YahooFinance);
}
// Maybe it's a named export on the module itself but hidden?
console.log("yf.YahooFinance type:", typeof yf.YahooFinance);

// Is there a ._module?
console.log("yf._module?", yf._module);
try {
    // Try to find if default export is the class?
    // const instance = new yf.default(); 
    // console.log("Successfully instantiated default export");
} catch(e) {}
