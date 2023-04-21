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
    const tableBody = document.createElement("tbody");
    data
        .filter((coin) => {
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
            if (changeFilter === "nothing" && Math.abs(coin.price_change_percentage_24h) > 0.2) {
                return false;
            }
            if (searchQuery && !coin.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            return true;
        })
        .forEach((coin) => {
            const row = document.createElement("tr");
            const nameCell = document.createElement("td");
            nameCell.innerText = coin.name;
            row.appendChild(nameCell);

            const imgCell = document.createElement("td");
            const img = document.createElement("img");
            img.src = coin.image;
            img.alt = coin.name;
            imgCell.appendChild(img);
            row.appendChild(imgCell);

            const priceCell = document.createElement("td");
            priceCell.innerText = formatPrice(coin.current_price);
            row.appendChild(priceCell);

            const changeCell = document.createElement("td");
            changeCell.innerText = `${coin.price_change_percentage_24h.toFixed(2)}%`;
            row.appendChild(changeCell);

            const marketCapCell = document.createElement("td");
            marketCapCell.innerText = formatPrice(coin.market_cap);
            row.appendChild(marketCapCell);

            const volumeCell = document.createElement("td");
            volumeCell.innerText = formatPrice(coin.total_volume);
            row.appendChild(volumeCell);

            tableBody.appendChild(row);
        });

    const table = document.querySelector("table");
    const tbody = table.querySelector("tbody");
    if (tbody) {
        table.replaceChild(tableBody, tbody);
    } else {
        table.appendChild(tableBody);
    }
};



updateTable();
setInterval(updateTable, 10000);

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