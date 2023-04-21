const apiTable = document.getElementById('api-table');
const checkboxes = document.querySelectorAll('input[name="filter"]');

function populateTable() {
    const selectedSymbols = [];
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            selectedSymbols.push(checkboxes[i].value.toUpperCase());
        }
    }
    const apiUrl = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=" + selectedSymbols.join(',') + "&tsyms=USDT,BTC";
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const tbody = apiTable.querySelector('tbody');
            tbody.textContent = '';
            for (let i = 0; i < selectedSymbols.length; i++) {
                const symbol = selectedSymbols[i];
                const USDT = data.DISPLAY[symbol].USDT;
                const BTC = data.DISPLAY[symbol].BTC;
                const row = document.createElement('tr');
                const symbolCell = document.createElement('td');
                symbolCell.textContent = symbol;
                row.appendChild(symbolCell);
                const priceUSDTCell = document.createElement('td');
                priceUSDTCell.textContent = USDT.PRICE;
                row.appendChild(priceUSDTCell);
                const priceBTCCell = document.createElement('td');
                priceBTCCell.textContent = BTC.PRICE;
                row.appendChild(priceBTCCell);
                const changeCell = document.createElement('td');
                const changeText = USDT.CHANGE24HOUR + ' ' + USDT.CHANGEPCT24HOUR;
                changeCell.textContent = changeText;
                if (USDT.CHANGE24HOUR > 0) {
                    changeCell.classList.add('positive');
                } else {
                    changeCell.classList.add('negative');
                }
                row.appendChild(changeCell);
                tbody.appendChild(row);
            }
        })
        .catch(error => {
            console.error(error);
        });
}

for (let i = 0; i < checkboxes.length; i++) {
    checkboxes[i].addEventListener('change', populateTable);
}

populateTable();

