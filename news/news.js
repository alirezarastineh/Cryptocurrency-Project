const endpointUrl =
    "https://min-api.cryptocompare.com/data/v2/news/?lang=EN";
const container = document.getElementById("cards-container");

// Fetch news data from the API and create cards
fetch(endpointUrl)
    .then((response) => response.json())
    .then((data) => {
        const news = data.Data;

        news.forEach((article) => {
            const card = createCard(article);
            container.appendChild(card);
        });
    })
    .catch((error) => console.error(error));

// Helper function to create a card element
function createCard(article) {
    const card = document.createElement("div");
    card.classList.add("card");

    const title = document.createElement("h2");
    title.textContent = article.title;
    card.appendChild(title);

    const description = document.createElement("p");
    description.textContent = article.body;
    card.appendChild(description);

    const readMore = document.createElement("span");
    readMore.classList.add("read-more");
    readMore.textContent = "Show more";
    card.appendChild(readMore);

    // Add click event listener to the "Show more" button
    readMore.addEventListener("click", () => {
        if (readMore.textContent === "Show more") {
            description.textContent = article.body + article.body;
            readMore.textContent = "Show less";
        } else {
            description.textContent = article.body;
            readMore.textContent = "Show more";
        }
    });

    return card;
}