async function main() {
    async function getCryptoPrices() {
        return (await fetch(
            "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC,ETH,USDT,BNB,USDC,XRP,ADA,DOGE,MATIC,SOL,DOT,LTC,SHIB,TRX,AVAX&tsyms=USDT"
        )).json().then(data => data.RAW);
    }

    function createCryptoTable(prices) {
        const table = document.getElementById("crypto-table");
        const header = ["Coin", "Price (USDT)", "24h Change (%)", "Symbol", "Last Market"];

        table.innerHTML = "<thead><tr>" + header.map(col => "<th>" + col + "</th>").join('') + "</tr></thead><tbody>" + Object.entries(prices).map(([symbol, data]) => {
            const cells = [data.USDT.FROMSYMBOL, data.USDT.PRICE.toFixed(2), data.USDT.CHANGEPCT24HOUR.toFixed(2), "https://cryptocompare.com/" + data.USDT.IMAGEURL, data.USDT.LASTMARKET];
            return "<tr>" + cells.map(cell => cell.startsWith("http") ? "<td><img src='" + cell + "'></td>" : "<td>" + cell + "</td>").join('') + "</tr>";
        }).join('') + "</tbody>";
    }
    createCryptoTable(await getCryptoPrices());
}
main();