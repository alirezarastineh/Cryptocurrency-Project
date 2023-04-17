const apiTable = document.getElementById('api-table');
const checkboxes = document.querySelectorAll('input[name="filter"]');

const populateTable = () => {
    apiTable.querySelector('tbody').innerHTML = '';
    const symbols = [...checkboxes].filter(({ checked }) => checked).map(({ value }) => value.toUpperCase());
    const apiUrl = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${symbols.join(',')}&tsyms=USDT,BTC`;
    fetch(apiUrl).then(response => response.json()).then(({ DISPLAY: data }) => Object.entries(data).forEach(([symbol, { USDT, BTC }]) => {
        const row = apiTable.querySelector('tbody').insertRow();
        [symbol, USDT.PRICE, BTC.PRICE, [USDT.CHANGE24HOUR, USDT.CHANGEPCT24HOUR].join(" ")].forEach(v => row.insertCell().textContent = v);
        row.querySelector('td:last-child').classList.add(USDT.CHANGE24HOUR > 0 ? 'positive' : 'negative');
    })).catch(console.error);
};

checkboxes.forEach(c => c.addEventListener('change', populateTable));

populateTable();