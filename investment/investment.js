function investTable() {
  const selectedSymbols = getSelectedSymbols();
  const apiUrl =
    "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=" +
    selectedSymbols.join(",") +
    "&tsyms=USDT,BTC";

  return fetch(apiUrl)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      updateTable(data, selectedSymbols);
    })
    .catch((error) => {
      console.error(error);
    });
}

const checkboxes = Array.from(
  document.querySelectorAll('input[name="filter"]')
);
function getSelectedSymbols() {
  return checkboxes
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value.toUpperCase());
}

const apiTable = document.getElementById("api-table");

function updateTable(data, selectedSymbols) {
  const tbody = apiTable.querySelector("tbody");
  tbody.innerHTML = "";

  for (let i = 0; i < selectedSymbols.length; i++) {
    const symbol = selectedSymbols[i];
    const USDT = data.DISPLAY[symbol].USDT;
    const BTC = data.DISPLAY[symbol].BTC;
    const row = createTableRow(
      symbol,
      USDT.PRICE,
      BTC.PRICE,
      USDT.CHANGE24HOUR
    );
    tbody.appendChild(row);
  }
}

function createTableRow(symbol, priceUSDT, priceBTC, change24Hour) {
  const row = document.createElement("tr");

  const symbolCell = document.createElement("td");
  symbolCell.textContent = symbol;
  row.appendChild(symbolCell);

  const priceUSDTCell = document.createElement("td");
  priceUSDTCell.textContent = priceUSDT;
  row.appendChild(priceUSDTCell);

  const priceBTCCell = document.createElement("td");
  priceBTCCell.textContent = priceBTC;
  row.appendChild(priceBTCCell);

  const changeCell = document.createElement("td");
  const changeText = `${change24Hour}`;
  changeCell.textContent = changeText;

  if (change24Hour > 0) {
    changeCell.classList.add("positive");
  } else {
    changeCell.classList.add("negative");
  }

  row.appendChild(changeCell);

  return row;
}

for (let i = 0; i < checkboxes.length; i++) {
  checkboxes[i].addEventListener("change", investTable);
}

investTable();
