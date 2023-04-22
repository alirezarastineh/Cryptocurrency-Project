// Defines the API endpoint URL to retrieve cryptocurrency news articles and identifies the HTML element container for displaying articles
const endpointUrl = "https://min-api.cryptocompare.com/data/v2/news/?lang=EN";
const container = document.getElementById("cards-container");

// Creates card element for each article passed as an argument
function createCard(article) {

    // Creates a div element with class name "card"
    const card = document.createElement("div");
    card.className = "card";

    // Creates a h2 element for article title, adds article title text node, and appends it to card element
    const title = document.createElement("h2");
    title.appendChild(document.createTextNode(article.title));
    card.appendChild(title);

    // Creates a p element for the article body/description, adds article body text node, and appends it to card element
    const description = document.createElement("p");
    description.appendChild(document.createTextNode(article.body));
    card.appendChild(description);

    // Creates a span element for read more link, adds "Show More" text node, and appends it to card element
    const readMore = document.createElement("span");
    readMore.className = "read-more";
    readMore.appendChild(document.createTextNode("Show more"));
    card.appendChild(readMore);



    // Adds a click event listener to the "Show more" link element created in previous function
    readMore.addEventListener("click", function () {

        // If the "Show more" text content is present, add article body twice and change readMore text to "Show less"
        if (readMore.textContent === "Show more") {
            description.appendChild(document.createTextNode(article.body + article.body));
            readMore.textContent = "Show less";

            // If "Show less" text content is present, revert back to showing only one instance of article body and change readMore text back to "Show more"
        } else {
            description.appendChild(document.createTextNode(article.body));
            readMore.textContent = "Show more";
        }
    });

    // Returns completed card element with title, body/description and a "Show more/Show less" link
    return card;
}


// Defines a function called "createCards" which takes in an argument of "news"
function createCards(news) {

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


// Uses the fetch() method to make a request to the API specified in "endpointUrl" and returns a promise object 
fetch(endpointUrl)
    // Once the promise object has resolved (i.e. HTTP response is received), calls a function that parses the response body as JSON data and returns it
    .then(function (response) {
        return response.json();
    })
    // Once the JSON data has been retrieved, calls a function that extracts the actual news articles from the returned JSON data using "data.Data". It then passes this news data to createCards() function to create individual cards for each article.
    .then(function (data) {
        const news = data.Data;
        createCards(news);
    })
    // If any errors occur within the promise object during fetch(), catch() will be executed with the error object passed to it as a parameter. The error can be logged to console using console.error()
    .catch(function (error) {
        console.error(error);
    });