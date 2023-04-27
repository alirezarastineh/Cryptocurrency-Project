const apiTable = document.getElementById("api-table");

function investTable(apiTable, checkboxes) {
  const selectedSymbols = getSelectedSymbols(checkboxes);
  const apiUrl =
    "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=" +
    selectedSymbols.join(",") +
    "&tsyms=USDT,BTC";

  return fetch(apiUrl)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      updateTable(data, selectedSymbols, apiTable);
    })
    .catch((error) => {
      console.error("error", error);
    });
}

function addCheckboxListeners(apiTable) {
  const checkboxes = Array.from(
    document.querySelectorAll('input[name="filter"]')
  );

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      investTable(apiTable, checkboxes);
    });
  });
}

function getSelectedSymbols(checkboxes) {
  return checkboxes
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value.toUpperCase());
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

function updateTable(data, selectedSymbols, apiTable) {
  const tbody = apiTable.querySelector("tbody");
  tbody.innerHTML = "";

  for (let i = 0; i < selectedSymbols.length; i++) {
    const symbol = selectedSymbols[i];
    const USDT = data.DISPLAY[symbol].USDT;
    const BTC = data.DISPLAY[symbol].BTC;
    const row2 = createTableRow(
      symbol,
      USDT.PRICE,
      BTC.PRICE,
      USDT.CHANGE24HOUR
    );
    tbody.appendChild(row2);
  }
}

addCheckboxListeners(apiTable);
investTable(
  apiTable,
  Array.from(document.querySelectorAll('input[name="filter"]'))
);
