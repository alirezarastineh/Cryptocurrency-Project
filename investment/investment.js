const apiTable = document.getElementById('api-table');
const checkboxes = document.querySelectorAll('input[name="filter"]');

const populateTable = async () => {
    const selectedSymbols = [];
    for (const cb of checkboxes) {
        if (cb.checked) {
            selectedSymbols.push(cb.value.toUpperCase());
        }
    }
    const apiUrl = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${selectedSymbols.join(',')}&tsyms=USDT,BTC`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const tbody = apiTable.querySelector('tbody');
        tbody.innerHTML = '';
        for (const symbol of selectedSymbols) {
            const { USDT, BTC } = data.DISPLAY[symbol];
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
            const changeText = `${USDT.CHANGE24HOUR} ${USDT.CHANGEPCT24HOUR}`;
            changeCell.textContent = changeText;
            if (USDT.CHANGE24HOUR > 0) {
                changeCell.classList.add('positive');
            } else {
                changeCell.classList.add('negative');
            }
            row.appendChild(changeCell);
            tbody.appendChild(row);
        }
    } catch (error) {
        console.error(error);
    }
};

for (const cb of checkboxes) {
    cb.addEventListener('change', populateTable);
}

populateTable();
