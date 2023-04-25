
//  this code retrieves news data from the API endpoint and creates individual cards for each article on the webpage. If there are any errors, it will log them to the console.
// Uses the fetch() method to make a request to the API specified in "endpointUrl" and returns a promise object 
async function fetchData() {
    try {
        const response = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
        const data = await response.json();
        createCards(data.Data); // Passes the "Data" array from the JSON response to the createCards() function
    } catch (error) {
        console.error("error", error);
    }
}

fetchData();

// Creates card element for each article passed as an argument
function createCard(article) {

    // Creates a div element with class name "card"
    const card = document.createElement("div");
    card.className = "card";

    // Creates a h2 element for article title, adds article title text node, and appends it to card element
    const title = document.createElement("h2");
    title.appendChild(document.createTextNode(article.title));
    card.appendChild(title);

    const image = document.createElement("img");
    image.className = "article-image";
    image.src = article.imageurl;
    card.appendChild(image);

    // Creates a p element for the article body/description, adds article body text node, and appends it to card element
    const description = document.createElement("p");
    description.appendChild(document.createTextNode(article.body));
    card.appendChild(description);

    // Creates a span element for read more link, adds "Show More" text node, and appends it to card element
    const readMore = document.createElement("span");
    readMore.className = "read-more";
    readMore.appendChild(document.createTextNode("Show more"));
    card.appendChild(readMore);

    function toggleText() {
        if (readMore.textContent === "Show more") {
            // If the "Show more" link is clicked, show the full article body text
            description.innerText = article.body;
            readMore.textContent = "Show less";
        } else {
            // If the "Show less" link is clicked, hide the full article body text by removing the extra text added previously
            description.innerText = article.body.slice(0, 200) + "...";
            readMore.textContent = "Show more";
        }
    }

    // Set the initial text content for the description element to the first 200 characters of the article body
    description.innerText = article.body.slice(0, 200) + "...";

    // Add an event listener to the "Show more" link button to call the toggleText() function when clicked
    readMore.addEventListener("click", toggleText);

    // Remove previous event listener before adding a new one
    readMore.removeEventListener("click", toggleText);
    readMore.addEventListener("click", toggleText);

    // Returns completed card element with title, body/description and a "Show more/Show less" link
    return card;
}

// Defines a function called "createCards" which takes in an argument of "news"
function createCards(news) {
    const container = document.getElementById("cards-container");

    // Creates a new empty document fragment and assigns to constant variable "fragment"
    const fragment = document.createDocumentFragment();

    // Iterates through each article within the news array using forEach method
    news.forEach(function (article) {

        // Calls the createCard function and passes in individual article as argument, then assigns result to constant variable "card"
        const card = createCard(article);

        // Appends the card to the fragment 
        fragment.appendChild(card);
    });

    // Appends the entire fragment (now containing all cards created) to the container element on the HTML page 
    container.appendChild(fragment);
}