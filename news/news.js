async function fetchData() {
  try {
    const response = await fetch(
      "https://min-api.cryptocompare.com/data/v2/news/?lang=EN"
    );
    const data = await response.json();
    createCards(data.Data);
  } catch (error) {
    console.error("error", error);
  }
}

function createCard(article) {
  const card = document.createElement("div");
  card.classList.add("card");

  const title = document.createElement("h2");
  title.innerText = article.title;
  card.appendChild(title);

  const image = document.createElement("img");
  image.src = article.imageurl;
  card.appendChild(image);

  const description = document.createElement("p");
  description.innerText = `${article.body.slice(0, 200)}...`;
  card.appendChild(description);

  const readMore = document.createElement("span");
  readMore.innerText = "Show more";
  card.appendChild(readMore);

  function toggleText() {
    if (readMore.innerText === "Show more") {
      description.innerText = article.body;
      readMore.innerText = "Show less";
    } else {
      description.innerText = `${article.body.slice(0, 200)}...`;
      readMore.innerText = "Show more";
    }
  }

  readMore.addEventListener("click", toggleText);

  return card;
}

function createCards(news) {
  const container = document.querySelector("#cards-container");

  const fragment = document.createDocumentFragment();

  news.forEach((article) => {
    fragment.appendChild(createCard(article));
  });

  container.appendChild(fragment);
}

fetchData();
