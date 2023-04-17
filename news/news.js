async function main() {
    async function getNews() {
        return (await fetch("https://min-api.cryptocompare.com/data/v2/news/?lang=EN")).json().then(({ Data }) => Data);
    }

    async function createCard(article) {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
        <h2>${article.title}</h2>
        <p>${article.body.substring(0, 200)}...</p>
        <span class="show-more">Show more</span>
        <span class="show-more" style="display:none">Show less</span>
        `;
        const [summary, showMore, showLess] = card.querySelectorAll("p, .show-more");
        const toggleSummary = (display) => {
            summary.textContent = display === "full" ? article.body : article.body.substring(0, 200) + "...";
            showMore.style.display = display === "full" ? "none" : "inline";
            showLess.style.display = display === "full" ? "inline" : "none";
        };
        showMore.addEventListener("click", () => toggleSummary("full"));
        showLess.addEventListener("click", () => toggleSummary("summary"));
        return card;
    }

    async function renderCards() {
        const cardContainer = document.getElementById("card-container");
        (await getNews()).forEach(async (article) => {
            cardContainer.appendChild(await createCard(article));
        });
    }

    renderCards();
}
main();