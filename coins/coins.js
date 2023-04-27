const fetchCryptoPrices = () => {
  return fetch(
    "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC,ETH,USDT,BNB,USDC,XRP,ADA,DOGE,MATIC,SOL,DOT,LTC,SHIB,TRX,AVAX,DAI,LINK,UNI,ATOM,LEO,OKB,ETC,XMR,TON,ICP,XLM,BCH,FIL,TUSD,APT,HBAR,NEAR,LDO,ARB,CRO,VET,APE,ALSO,GRT,QNT,FTM,EOS,MANA,THETA,AAVE,STX,EGLD,FLOW,XTZ,AXS,RPL,USDP,SAND,IMX,BIT,CHZ,CFX,NEO,KCS,OP,SNX,CRV,RNDR,KLAY,USDD,MKR,GMX,LUNC,BSV,MINA,BTT,INJ,FXS,CAKE,ZEC,HT,DASH,XEC,XDC,MIOTA,IOTA,IOTX,CSPR,GT,TWT,PAXG,RUNE,LRC,ZIL,FLR,WOO,AGIX,DYDX,GUSD,CVX,1INCH,ENJ,KAVA,OSMO,ROSE&tsyms=USDT"
  )
    .then((response) => response.json())
    .then((data) => {
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
    })
    .catch((error) => {
      console.error("Error fetching crypto prices:", error);
      return [];
    });
};

const filterData = (data, priceFilter, changeFilter, searchQuery) => {
  return data.filter((coin) => {
    if (priceFilter === "less" && coin.current_price > 10) {
      return false;
    }

    if (priceFilter === "greater" && coin.current_price <= 10) {
      return false;
    }

    if (priceFilter === "1usd" && Math.abs(coin.current_price - 1.0) > 0.01) {
      return false;
    }

    if (changeFilter === "less" && coin.price_change_percentage_24h > 0) {
      return false;
    }

    if (changeFilter === "greater" && coin.price_change_percentage_24h <= 0) {
      return false;
    }

    if (
      changeFilter === "nothing" &&
      Math.abs(coin.price_change_percentage_24h) > 0.2
    ) {
      return false;
    }

    if (
      searchQuery &&
      !coin.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });
};

const updateTable = async () => {
  const table = document.getElementById("crypto-table");

  const priceFilter = document.getElementById("price-filter").value;
  const changeFilter = document.getElementById("change-filter").value;
  const searchQuery = document.getElementById("search").value;

  const data = await fetchCryptoPrices();

  const filteredData = filterData(data, priceFilter, changeFilter, searchQuery);

  const tbody = document.createElement("tbody");

  filteredData.forEach((coin) => {
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
    priceCell.innerText = `₮ ${coin.current_price.toLocaleString()}`;
    row.appendChild(priceCell);

    const changeCell = document.createElement("td");
    changeCell.innerText = `${coin.price_change_percentage_24h.toFixed(2)}%`;
    row.appendChild(changeCell);

    const marketCapCell = document.createElement("td");
    marketCapCell.innerText = `₮ ${coin.market_cap.toLocaleString()}`;
    row.appendChild(marketCapCell);

    const volumeCell = document.createElement("td");
    volumeCell.innerText = `₮ ${coin.total_volume.toLocaleString()}`;
    row.appendChild(volumeCell);

    tbody.appendChild(row);
  });

  // oldTbody is used to check if there is an existing <tbody> element in the DOM.
  // If it exists, the updated data will be added to the existing <tbody> element by replacing the old one with the new one.
  // If it doesn't exist, a new <tbody> element is created and appended to the <table> element.
  const oldTbody = table.querySelector("tbody");
  if (oldTbody) {
    table.replaceChild(tbody, oldTbody);
  } else {
    table.appendChild(tbody);
  }
};

const addEventListeners = () => {
  document.getElementById("price-filter").addEventListener("change", () => {
    updateTable();
  });

  document.getElementById("change-filter").addEventListener("change", () => {
    updateTable();
  });

  document.getElementById("search").addEventListener("input", () => {
    updateTable();
  });
};

const run = async () => {
  await updateTable();

  setInterval(updateTable, 10000);

  addEventListeners();
};

run();
