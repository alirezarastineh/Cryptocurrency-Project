// The following code assigns elements from the HTML document to variables used to apply filters to an API table
const apiTable = document.getElementById('api-table'); // gets the DOM element with ID 'api-table' and assigns it to a constant variable 'apiTable'
const checkboxes = document.querySelectorAll('input[name="filter"]'); // applies a query selector to get all input elements with attribute 'name' equal to "filter"


// The following function is used to populate an API table based on the user's selected filtering options
function populateTable() {
    const selectedSymbols = []; // creates an empty array for storing selected symbols
    for (let i = 0; i < checkboxes.length; i++) { // loops through all checkboxes that have been retrieved from the HTML document
        if (checkboxes[i].checked) { // checks if the current checkbox is checked
            selectedSymbols.push(checkboxes[i].value.toUpperCase()); // adds the value of the current checkbox to the selectedSymbols array in uppercase
            // it has to be uppercase because the API
        }
    }
    const apiUrl = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=" + selectedSymbols.join(',') + "&tsyms=USDT,BTC"; // creates an API URL for fetching crypto data based on the selected symbols
    fetch(apiUrl) // sends a GET request to the specified URL and fetches data in JSON format
        .then(response => response.json()) // converts the data into a JSON object
        .then(data => { // handles the fetched JSON data
            const tbody = apiTable.querySelector('tbody'); // selects the table body element of the API table
            tbody.textContent = ''; // clears out the previous table contents
            for (let i = 0; i < selectedSymbols.length; i++) { // loops through all selected symbols
                const symbol = selectedSymbols[i]; // stores the current symbol in a constant variable
                const USDT = data.DISPLAY[symbol].USDT; // stores USDT price data for the current symbol in a constant variable
                const BTC = data.DISPLAY[symbol].BTC; // stores BTC price data for the current symbol in a constant variable
                const row = document.createElement('tr'); // creates a new row element
                const symbolCell = document.createElement('td'); // creates a new cell element for displaying symbol
                symbolCell.textContent = symbol; // sets the value of the symbol cell to the current symbol
                row.appendChild(symbolCell);
                const priceUSDTCell = document.createElement('td');
                priceUSDTCell.textContent = USDT.PRICE;
                row.appendChild(priceUSDTCell);
                const priceBTCCell = document.createElement('td');
                priceBTCCell.textContent = BTC.PRICE;
                row.appendChild(priceBTCCell);
                const changeCell = document.createElement('td');
                const changeText = USDT.CHANGE24HOUR + ' ' + USDT.CHANGEPCT24HOUR; // stores the text content for the change cell in a constant variable
                changeCell.textContent = changeText; // sets the value of the change cell to the stored text content
                if (USDT.CHANGE24HOUR > 0) { // checks if the 24-hour price change is positive
                    changeCell.classList.add('positive'); // adds the 'positive' class to the change cell
                } else {
                    changeCell.classList.add('negative'); // adds the 'negative' class to the change cell
                }
                row.appendChild(changeCell); // adds the change cell to the new row
                tbody.appendChild(row); // adds the new row to the API table
            }
        })
        .catch(error => { // handles errors in case an API URL is not valid or there is no data to fetch
            console.error(error); // logs the error message to the console
        });
}


// The following code adds event listeners for changes to the checkboxes and calls the populateTable function upon loading the webpage
for (let i = 0; i < checkboxes.length; i++) { // loops through all checkboxes that have been retrieved from the HTML document
    checkboxes[i].addEventListener('change', populateTable); // adds an event listener for changes to each checkbox, which triggers the populateTable function when a change occurs
}

populateTable(); // calls the populateTable function when the webpage is loaded to initially populate the API table with data


