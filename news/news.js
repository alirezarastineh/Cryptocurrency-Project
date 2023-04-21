const endpointUrl = "https://min-api.cryptocompare.com/data/v2/news/?lang=EN";
const container = document.getElementById("cards-container");

function createCard(article) {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h2");
    title.appendChild(document.createTextNode(article.title));
    card.appendChild(title);

    const description = document.createElement("p");
    description.appendChild(document.createTextNode(article.body));
    card.appendChild(description);

    const readMore = document.createElement("span");
    readMore.className = "read-more";
    readMore.appendChild(document.createTextNode("Show more"));
    card.appendChild(readMore);

    readMore.addEventListener("click", function () {
        if (readMore.textContent === "Show more") {
            description.appendChild(document.createTextNode(article.body + article.body));
            readMore.textContent = "Show less";
        } else {
            description.appendChild(document.createTextNode(article.body));
            readMore.textContent = "Show more";
        }
    });

    return card;
}

function createCards(news) {
    const fragment = document.createDocumentFragment();

    news.forEach(function (article) {
        const card = createCard(article);
        fragment.appendChild(card);
    });

    container.appendChild(fragment);
}

fetch(endpointUrl)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        const news = data.Data;
        createCards(news);
    })
    .catch(function (error) {
        console.error(error);
    });
