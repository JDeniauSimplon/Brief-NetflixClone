import { API_KEY } from "./apikey";

const BASE_URL = "https://api.themoviedb.org/3";
const greyContainer = document.querySelector<HTMLElement>(".greyContainer");
const boutonAccueil = document.querySelector('.logo');
let trendingMovieData;

function getPosterUrl(posterPath, size = "original") {
  return `https://image.tmdb.org/t/p/${size}/${posterPath}`;
}

function createMovieElement(movie) {
  const movieElement = document.createElement("div");
  movieElement.className = "movie";

  const posterUrl = getPosterUrl(movie.poster_path, "original");

  movieElement.innerHTML = `
    <img src="${posterUrl}" alt="${movie.title}">
  `;

  movieElement.addEventListener("click", () => {
    displayMoviePopup(movie);
  });

  return movieElement;
}

// fonction pour créer la pop up associée au film (image+titre+description+boutonRetour)
function displayMoviePopup(movie) {
  const popup = document.createElement("div");
  popup.className = "movie-popup";

  let description = movie.overview;
  if (!description) {
    description = "Aucune description disponible pour ce film.";
  }

  popup.innerHTML = `
    <div class="popup-inner">
      <img src="https://image.tmdb.org/t/p/original${movie.backdrop_path}" alt="${movie.title}">
      <h2>${movie.title}</h2>
      <p>${description}</p>
      <button class="close-popup"></button>
    </div>
  `;

  document.body.appendChild(popup);

  const closePopupButton = popup.querySelector(".close-popup");
  closePopupButton?.addEventListener("click", () => {
    document.body.removeChild(popup);
  });
}


// fonction async pour récupérer l'API et récupérer les images pour les listes par genre
async function fetchMovies(genre, containerClass, page = 1) {
  const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genre}&language=fr&page=${page}`);
  const data = await response.json();
  const totalPages = data.total_pages;

  const moviesWrapper = document.querySelector(`.${containerClass} .slider-wrapper`);
  const posterPromises = data.results.map(movie => {
    const movieElement = createMovieElement(movie);
    moviesWrapper?.appendChild(movieElement);
  });
  await Promise.all(posterPromises);

  return totalPages;
}

// fonction pour récupérer l'image du film du moment pour l'heroBanner
async function fetchTrendingMovie() {
  const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=fr`);
  const data = await response.json();

  trendingMovieData = data.results[0];

  const movieTitle = trendingMovieData.title;
  const movieBackground = `https://image.tmdb.org/t/p/w1280${trendingMovieData.backdrop_path}`;

  const trendMovie = document.querySelector(".trendMovie") as HTMLElement;
  if (trendMovie) {
    trendMovie.innerHTML = `
    <h1>${movieTitle}</h1>
  `;
  }

  const darkGreyContainer = document.querySelector(".darkGreyContainer") as HTMLElement;
  darkGreyContainer.style.backgroundImage = `url(${movieBackground})`;
}

// Paramètre Carrou
const sliderContainers = document.querySelectorAll(".slider-container");
sliderContainers.forEach(sliderContainer => {
  const sliderWrapper = sliderContainer.querySelector(".slider-wrapper");
  const sliderPrev = sliderContainer.querySelector(".slider-prev");
  const sliderNext = sliderContainer.querySelector(".slider-next");
  const percentageToScroll = 50; // Pourcentage de la largeur du carrousel à défiler à chaque clic

  if (sliderWrapper) {
    sliderPrev?.addEventListener("click", () => {
      const amountToScroll = sliderWrapper.clientWidth * (percentageToScroll / 100);
      sliderWrapper.scrollBy({
        left: -amountToScroll,
        behavior: "smooth"
      });
    });

    sliderNext?.addEventListener("click", () => {
      const amountToScroll = sliderWrapper.clientWidth * (percentageToScroll / 100);
      sliderWrapper.scrollBy({
        left: amountToScroll,
        behavior: "smooth"
      });
    });
  }
});

// Eventlistener sur le bouton + d'info 
const boutonInfo = document.querySelector(".boutonInfo");

if (boutonInfo) {
  boutonInfo.addEventListener("click", () => {
    displayMoviePopup(trendingMovieData);
  });
}

fetchTrendingMovie();
fetchMovies(28, "moviesListAction");
fetchMovies(878, "moviesListSf");

async function searchMovies(query, page = 1) {
  const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&language=fr&page=${page}`);
  const data = await response.json();
  return {
    results: data.results,
    totalPages: data.total_pages
  };
}

async function displaySearchResults(query, page = 1) {
  const { results, totalPages } = await searchMovies(query, page);



  if (greyContainer) {
    greyContainer.innerHTML = `
      <div class="searchResults">
        <div id="searchResults" class="search-results-wrapper"></div>
        <div class="pagination-wrapper"></div>
      </div>
    `;

    const moviesWrapper = greyContainer.querySelector("#searchResults");

    if (moviesWrapper) {
      moviesWrapper.innerHTML = "";

      for (const movie of results) {
        const movieElement = document.createElement("div");
        movieElement.className = "movie";
        movieElement.innerHTML = `
          <img src="https://image.tmdb.org/t/p/original${movie.poster_path}" alt="${movie.title}">
        `;
        moviesWrapper.appendChild(movieElement);
        movieElement.addEventListener("click", () => {
          displayMoviePopup(movie);
        });
      }
    }

    const paginationWrapper = greyContainer.querySelector(".pagination-wrapper");
    for (let i = 1; i <= totalPages; i++) {
      const paginationButton = document.createElement("button");
      paginationButton.innerText = i.toString();
      paginationButton.addEventListener("click", () => {
        displaySearchResults(query, i);
      });

      paginationWrapper?.appendChild(paginationButton);
    }
    createPagination(page, totalPages, query);
  }

}


// fonction pour gérer la recherche
const searchForm = document.querySelector(".searchNav");
const searchInput : any = document.querySelector(".searchSite");
const searchButton = document.querySelector(".searchButton");

if (searchForm && searchInput && searchButton) {
  searchForm.addEventListener("submit", handleSearchSubmit);
}

async function handleSearchSubmit(event) {
  event.preventDefault();
  const query = searchInput?.value;

  if (query.trim()) {
    displaySearchResults(query);
    const movieList = document.querySelector<HTMLElement>('.movieList');
    if (movieList && greyContainer) {
      movieList.style.display = 'none';
      greyContainer.style.height = 'auto';
    }
  }
}

if (boutonAccueil) {
  boutonAccueil.addEventListener("click", () => {
    const movieList : any = document.querySelector(".movieList");
    const searchResults : any = document.querySelector(".searchResults");

    if (movieList) {
      movieList.style.display = "flex";
    }

    if (searchResults) {
      searchResults.style.display = "none";
    }

    window.location.reload(); // ajout du rafraîchissement de la page
  });
}

// fonction pour creée la pagination

function createPagination(currentPage, totalPages, query) {
  const paginationWrapper = document.querySelector(".pagination-wrapper");
  if (paginationWrapper) {
    paginationWrapper.innerHTML = '';
  }


  const maxButtonsToShow = 5;
  const buttonsWrapper = document.createElement("div");
  buttonsWrapper.className = "pagination-buttons-wrapper";

  const startButton = Math.max(currentPage - Math.floor(maxButtonsToShow / 2), 1);
  const endButton = Math.min(startButton + maxButtonsToShow - 1, totalPages);

  const firstButton = document.createElement("button");
  firstButton.innerText = "Première page";
  firstButton.className = currentPage === 1 ? "active" : "";
  firstButton.disabled = currentPage === 1;
  firstButton.addEventListener("click", () => {
    displaySearchResults(query, 1);
  });

  const prevButton = document.createElement("button");
  prevButton.innerText = "<";
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener("click", () => {
    displaySearchResults(query, currentPage - 1);
  });

  buttonsWrapper.appendChild(firstButton);
  buttonsWrapper.appendChild(prevButton);

  for (let i = startButton; i <= endButton; i++) {
    const paginationButton = document.createElement("button");
    paginationButton.innerText = i.toString();
    paginationButton.className = i === currentPage ? "active" : "";
    paginationButton.addEventListener("click", () => {
      displaySearchResults(query, i);
    });

    buttonsWrapper.appendChild(paginationButton);
  }

  const nextButton = document.createElement("button");
  nextButton.innerText = ">";
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener("click", () => {
    displaySearchResults(query, currentPage + 1);
  });

  const lastButton = document.createElement("button");
  lastButton.innerText = "Dernière page";
  lastButton.className = currentPage === totalPages ? "active" : "";
  lastButton.disabled = currentPage === totalPages;
  lastButton.addEventListener("click", () => {
    displaySearchResults(query, totalPages);
  });

  buttonsWrapper.appendChild(nextButton);
  buttonsWrapper.appendChild(lastButton);

  const pageCounter = document.createElement("span");
  pageCounter.className = "pagination-page-counter";
  pageCounter.innerText = `Page ${currentPage} sur ${totalPages}`;

  if (paginationWrapper) {

    paginationWrapper.appendChild(buttonsWrapper);
    paginationWrapper.appendChild(pageCounter);
  }
}