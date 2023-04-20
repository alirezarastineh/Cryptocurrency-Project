const table = document.getElementById("crypto-table");
let priceFilter = "all";
let changeFilter = "all";
let searchQuery = "";

const fetchCryptoPrices = async () => {
    try {
        const response = await fetch(
            "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC,ETH,USDT,BNB,USDC,XRP,ADA,DOGE,MATIC,SOL,DOT,LTC,SHIB,TRX,AVAX,DAI,LINK,UNI,ATOM,LEO,OKB,ETC,XMR,TON,ICP,XLM,BCH,FIL,TUSD,APT,HBAR,NEAR,LDO,ARB,CRO,VET,APE,ALSO,GRT,QNT,FTM,EOS,MANA,THETA,AAVE,STX,EGLD,FLOW,XTZ,AXS,RPL,USDP,SAND,IMX,BIT,CHZ,CFX,NEO,KCS,OP,SNX,CRV,RNDR,KLAY,USDD,MKR,GMX,LUNC,BSV,MINA,BTT,INJ,FXS,CAKE,ZEC,HT,DASH,XEC,XDC,MIOTA,IOTA,IOTX,CSPR,GT,TWT,PAXG,RUNE,LRC,ZIL,FLR,WOO,AGIX,DYDX,GUSD,CVX,1INCH,ENJ,KAVA,OSMO,ROSE&tsyms=USDT"
        );
        const data = await response.json();
        return Object.values(data.RAW).map((coin) => {
            return {
                name: coin.USDT.FROMSYMBOL,
                image: `https://www.cryptocompare.com/${coin.USDT.IMAGEURL}`,
                current_price: coin.USDT.PRICE,
                price_change_percentage_24h: coin.USDT.CHANGEPCT24HOUR,
                market_cap: coin.USDT.MKTCAP,
                total_volume: coin.USDT.TOTALVOLUME24HTO,
            };
        });
    } catch (error) {
        console.error("Error fetching crypto prices:", error);
        return [];
    }
};



const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
};

const updateTable = async () => {
    const data = await fetchCryptoPrices();
    table.innerHTML = `
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Logo</th>
          <th>Price</th>
          <th>24h Change</th>
          <th>Market Cap</th>
          <th>Volume (24h)</th>
        </tr>
      </thead>
      <tbody>
        ${data
            .filter((coin) => {
                console.log("priceFilter:", priceFilter);
                console.log("changeFilter:", changeFilter);
                console.log("coin.current_price:", coin.current_price);
                console.log("coin.price_change_percentage_24h:", coin.price_change_percentage_24h);

                if (priceFilter === "less" && coin.current_price > 10) {
                    return false;
                }
                if (priceFilter === "greater" && coin.current_price <= 10) {
                    return false;
                }
                if (priceFilter === "1usd" && Math.abs(coin.current_price - 1.00) > 0.01) {
                    return false;
                }
                if (changeFilter === "less" && coin.price_change_percentage_24h > 0) {
                    return false;
                }
                if (changeFilter === "greater" && coin.price_change_percentage_24h <= 0) {
                    return false;
                }
                if (changeFilter === "nothing" && Math.abs(coin.price_change_percentage_24h) > 0.5) {
                    return false;
                }
                if (searchQuery && !coin.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return false;
                }
                return true;
            })

            .map(
                (coin) => `
          <tr>
            <td>${coin.name}</td>
            <td><img src="${coin.image}" alt="${coin.name}"></td>
            <td>${formatPrice(coin.current_price)}</td>
            <td>${coin.price_change_percentage_24h.toFixed(2)}%</td>
            <td>${formatPrice(coin.market_cap)}</td>
            <td>${formatPrice(coin.total_volume)}</td>
          </tr>
        `
            )
            .join("")}
      </tbody>
    `;
};


updateTable();
setInterval(updateTable, 30000);

document.getElementById("price-filter").addEventListener("change", (event) => {
    priceFilter = event.target.value;
    updateTable();
});

document.getElementById("change-filter").addEventListener("change", (event) => {
    changeFilter = event.target.value;
    updateTable();
});

document.getElementById("search").addEventListener("input", (event) => {
    searchQuery = event.target.value;
    updateTable();
});