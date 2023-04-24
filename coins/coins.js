// The following code defines variables used to filter and search a table of cryptocurrencies
const table = document.getElementById("crypto-table"); // assigns the DOM element with ID 'crypto-table' to a constant variable 'table'
let priceFilter = "all"; // initializes a variable 'priceFilter' with value "all" to filter by cryptocurrency price
let changeFilter = "all"; // initializes a variable 'changeFilter' with value "all" to filter by cryptocurrency change
let searchQuery = ""; // initializes a variable 'searchQuery' with an empty string to search for a specific cryptocurrency


//Defining an asynchronous arrow function named 'fetchCryptoPrices' which returns a Promise.
const fetchCryptoPrices = async () => {
    try {

        //Making an asynchronous request to the API endpoint using the 'fetch' method.
        const response = await fetch(
            "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC,ETH,USDT,BNB,USDC,XRP,ADA,DOGE,MATIC,SOL,DOT,LTC,SHIB,TRX,AVAX,DAI,LINK,UNI,ATOM,LEO,OKB,ETC,XMR,TON,ICP,XLM,BCH,FIL,TUSD,APT,HBAR,NEAR,LDO,ARB,CRO,VET,APE,ALSO,GRT,QNT,FTM,EOS,MANA,THETA,AAVE,STX,EGLD,FLOW,XTZ,AXS,RPL,USDP,SAND,IMX,BIT,CHZ,CFX,NEO,KCS,OP,SNX,CRV,RNDR,KLAY,USDD,MKR,GMX,LUNC,BSV,MINA,BTT,INJ,FXS,CAKE,ZEC,HT,DASH,XEC,XDC,MIOTA,IOTA,IOTX,CSPR,GT,TWT,PAXG,RUNE,LRC,ZIL,FLR,WOO,AGIX,DYDX,GUSD,CVX,1INCH,ENJ,KAVA,OSMO,ROSE&tsyms=USDT"
        );

        //Parsing the JSON content received from the API.
        const data = await response.json();

        //Extracting relevant data for each coin by mapping through the object 'RAW' in the received data.
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

        //Handling error if any occurs during the API call.
        console.error("Error fetching crypto prices:", error);

        //Returning an empty array if there is an error.
        return [];
    }
};




//Defining a function named 'formatPrice' that takes a numerical price value as input.
const formatPrice = (price) => {

    //Using the Intl API to format the given number to a currency representation.
    //Here, we are formatting the price in USD currency and with the style of a currency.
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
};


//Defining an async function named 'updateTable'.
const updateTable = async () => {
    //Awaiting the result of a function call to 'fetchCryptoPrices' and storing it in a variable named 'data'.
    const data = await fetchCryptoPrices();

    //Creating an HTML table body element.
    const tableBody = document.createElement("tbody");

    //Filtering the 'data' array using the values of 'priceFilter', 'changeFilter', and 'searchQuery'.
    data.filter((coin) => {

        //If price filter is set to "less" and the current price of the coin is greater than 10, return false.
        if (priceFilter === "less" && coin.current_price > 10) {
            return false;
        }

        if (priceFilter === "greater" && coin.current_price <= 10) {
            return false;
        }

        //If price filter is set to "1usd" and the difference between the current price of the coin and $1.00 USD is greater than 0.01, return false.
        if (priceFilter === "1usd" && Math.abs(coin.current_price - 1.00) > 0.01) {
            return false;
        }

        if (changeFilter === "less" && coin.price_change_percentage_24h > 0) {
            return false;
        }

        if (changeFilter === "greater" && coin.price_change_percentage_24h <= 0) {
            return false;
        }

        //If change filter is set to "nothing" and the absolute value of the percentage change in price of the coin in the last 24 hours is greater than 0.2, return false.
        if (changeFilter === "nothing" && Math.abs(coin.price_change_percentage_24h) > 0.2) {
            return false;
        }

        //If search query is set and the name of the coin (in lowercase) does not include the search query (also in lowercase), return false.
        if (searchQuery && !coin.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        //If all conditions are met, return true.
        return true;
    })

        //Iterating through each item of the filtered array using the '.forEach()' method.
        .forEach((coin) => {
            //Creating a table row element.
            const row = document.createElement("tr");

            //Creating a table data (td) element and assigning the value of the 'name' property of 'coin' to its inner text.
            const nameCell = document.createElement("td");
            nameCell.innerText = coin.name;

            //Appending the 'nameCell' to the current row.
            row.appendChild(nameCell);

            const imgCell = document.createElement("td");

            const img = document.createElement("img");
            img.src = coin.image;
            img.alt = coin.name;

            //Inserting the image into the table data (td) element.
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


    // This code tries to replace the `tbody` element in a table with the new `tableBody` variable if it exists,
    // otherwise, append `tableBody` as a new child element of the `table` element.

    const table = document.querySelector("table"); // We select the `table` element using its tag name.
    const tbody = table.querySelector("tbody"); // We select the first `tbody` element inside the `table` element.

    if (tbody) { // If we found an existing `tbody` element...
        table.replaceChild(tableBody, tbody); // ...we replace it with the new `tableBody` variable.
    } else { // Otherwise...
        table.appendChild(tableBody); // ...we append `tableBody` as a new child element of the `table` element.
    }
};



// This code is calling a function named `updateTable()` once immediately, and then scheduling it to be called again every 10 seconds (10000 milliseconds) using setInterval() method.

updateTable(); // We are calling the `updateTable()` function immediately.

setInterval(updateTable, 120000); // We schedule the `updateTable()` function to run repeatedly after every 10 seconds.


// Adds an event listener for a change in price filter element and invokes updateTable function
document.getElementById("price-filter").addEventListener("change", (event) => {
    priceFilter = event.target.value; // Updates the value of the global variable priceFilter with the selected price filter option from the event target
    updateTable(); // Calls the updateTable() function to update the displayed table based on the selected price filter
});


document.getElementById("change-filter").addEventListener("change", (event) => {
    changeFilter = event.target.value;
    updateTable();
});

document.getElementById("search").addEventListener("input", (event) => {
    searchQuery = event.target.value;
    updateTable();
});