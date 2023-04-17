const params = new URLSearchParams(window.location.search);
const [name, email, phone, date, time, partySize, preference, invest, income] = [
    'name', 'email', 'phone', 'date', 'time', 'party-size', 'preference', 'type', 'type2'
].map(param => params.get(param));
const totalPoints = +invest + +income;

const createElem = (text) => Object.assign(document.createElement('p'), { textContent: text });

const nameElem = createElem(`Name: ${name}`);
const emailElem = createElem(`Email: ${email}`);
const phoneElem = createElem(`Phone: ${phone}`);
const dateElem = createElem(`Date: ${date}`);
const timeElem = createElem(`Time: ${time}`);
const partySizeElem = createElem(`Party Size: ${partySize}`);
const preferenceElem = createElem(`Preference: ${preference}`);

function myPreference() {
    document.getElementById('trader').checked = true;
    document.getElementById('holder').checked = true;
}

const investElem = createElem(`Invest: ${invest}`);
const incomeElem = createElem(`Income: ${income}`);
const totalPointsElem = createElem(`Total Points: ${totalPoints}`);

const confirmationElem = document.querySelector('#confirmation');
confirmationElem.append(...[
    nameElem,
    emailElem,
    phoneElem,
    dateElem,
    timeElem,
    partySizeElem,
    preferenceElem,
    investElem,
    incomeElem,
    totalPointsElem,
]);