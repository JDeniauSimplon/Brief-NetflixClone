// Import de la clé API

import { API_KEY } from "./apikey";

// Définition des constantes globales

const BASE_URL = "https://api.themoviedb.org/3";
const greyContainer : HTMLElement | null = document.querySelector<HTMLElement>(".greyContainer");
const boutonAccueil : HTMLInputElement | null = document.querySelector('.logo');
const infoButton : HTMLInputElement | null = document.querySelector(".infoButton");
let trendingMovieData;

// Définition des fonctions principales

async function fetchMovies(genre, containerClass, page = 1) {
  const response  = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genre}&language=fr&page=${page}`);
  const data = await response.json();


  const moviesWrapper : HTMLElement | null = document.querySelector(`.${containerClass} .sliderWrapper`);
  const posterPromises : any = data.results.map(movie => {
    const movieElement : HTMLDivElement | null = createMovieElement(movie);
    moviesWrapper?.appendChild(movieElement);
  });
  await Promise.all(posterPromises);

}

//////////

async function fetchTrendingMovie() {
  const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=fr`);
  const data = await response.json();

  trendingMovieData = data.results[0];

  const movieTitle = trendingMovieData.title;
  const movieBackground : string = `https://image.tmdb.org/t/p/w1280${trendingMovieData.backdrop_path}`;

  const trendMovie = document.querySelector(".trendMovie") as HTMLElement;
  if (trendMovie) {
    trendMovie.innerHTML = `
    <h1>${movieTitle}</h1>
  `;
  }

  const darkGreyContainer = document.querySelector(".darkGreyContainer") as HTMLElement;
  darkGreyContainer.style.backgroundImage = `url(${movieBackground})`;
}

//////////

function createMovieElement(movie) {
  const movieElement : HTMLDivElement | null = document.createElement("div");
  movieElement.className = "movie";

  const posterUrl : string = movie.poster_path ? `https://image.tmdb.org/t/p/original/${movie.poster_path}` : '';

  movieElement.innerHTML = `
    <img src="${posterUrl}" alt="${movie.title}">
  `;

  movieElement.addEventListener("click", () => {
    displayMoviePopup(movie);
  });

  return movieElement;
}

//////////

function displayMoviePopup(movie) {
  const popup : HTMLDivElement | null = document.createElement("div");
  popup.className = "moviePopup";

  let description = movie.overview;
  if (!description) {
    description = "Aucune description disponible pour ce film.";
  }

  let backdropUrl = "";
  if (movie.backdrop_path !== null) {
    backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
  }

  popup.innerHTML = `
    <div class="popupInner">
      <img src="${backdropUrl}" alt="${movie.title}">
      <h2>${movie.title}</h2>
      <p>${description}</p>
      <button class="closePopup"></button>
    </div>
  `;

  document.body.appendChild(popup);

  const closePopupButton : Element | null = popup.querySelector(".closePopup");
  closePopupButton?.addEventListener("click", () => {
    document.body.removeChild(popup);
  });
}

//////////

async function searchMovies(query, page = 1) {
  const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&language=fr&page=${page}`);
  const data = await response.json();
  return {
    results: data.results,
    totalPages: data.total_pages
  };
}

//////////

async function displaySearchResults(query, page = 1) {
  const { results, totalPages } = await searchMovies(query, page);

  if (greyContainer) {
    greyContainer.innerHTML = `
      <div class="searchResults">
        <div id="searchResults" class="searchResultsWrapper"></div>
        <div class="paginationWrapper"></div>
      </div>
    `;

    const moviesWrapper : Element | null = greyContainer.querySelector("#searchResults");

    if (moviesWrapper) {
      moviesWrapper.innerHTML = "";
    
      for (const movie of results) {
        if (movie.poster_path !== null) {
          const movieElement = document.createElement("div");
          movieElement.className = "movie";
          movieElement.innerHTML = `
            <img src="https://image.tmdb.org/t/p/original${movie.poster_path}" alt="${movie.title}">
          `;
          moviesWrapper?.appendChild(movieElement);
          movieElement.addEventListener("click", () => {
            displayMoviePopup(movie);
          });
        }
      }
    }

    const paginationWrapper : Element | null = greyContainer.querySelector(".paginationWrapper");
    for (let i = 1; i <= totalPages; i++) {
      const paginationButton : HTMLButtonElement | null = document.createElement("button");
      paginationButton.innerText = i.toString();
      paginationButton.addEventListener("click", () => {
        displaySearchResults(query, i);
      });

      paginationWrapper?.appendChild(paginationButton);
    }
    createPagination(page, totalPages, query);
  }

}

//////////

function createPagination(currentPage, totalPages, query) {
  const paginationWrapper : HTMLElement | null = document.querySelector(".paginationWrapper");
  if (paginationWrapper) { paginationWrapper.innerHTML = ''; }
  const maxButtonsToShow : number = 5;
  const buttonsWrapper : HTMLElement | null = document.createElement("div");
  buttonsWrapper.className = "paginationButtonsWrapper";
  const startButton : number = Math.max(currentPage - Math.floor(maxButtonsToShow / 2), 1);
  const endButton : number = Math.min(startButton + maxButtonsToShow - 1, totalPages);
  const firstButton : HTMLButtonElement | null = document.createElement("button");

  firstButton.innerText = "Première page";
  firstButton.className = currentPage === 1 ? "active" : "";
  firstButton.disabled = currentPage === 1;
  firstButton.addEventListener("click", () => {
    displaySearchResults(query, 1);
  });

  const prevButton : HTMLButtonElement | null  = document.createElement("button");
  prevButton.innerText = "<";
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener("click", () => {
    displaySearchResults(query, currentPage - 1);
  });

  buttonsWrapper.appendChild(firstButton);
  buttonsWrapper.appendChild(prevButton);

  for (let i = startButton; i <= endButton; i++) {
    const paginationButton : HTMLElement | null = document.createElement("button");
    paginationButton.innerText = i.toString();
    paginationButton.className = i === currentPage ? "active" : "";
    paginationButton.addEventListener("click", () => {
      displaySearchResults(query, i);
    });

    buttonsWrapper.appendChild(paginationButton);
  }

  const nextButton : HTMLButtonElement | null  = document.createElement("button");
  nextButton.innerText = ">";
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener("click", () => {
    displaySearchResults(query, currentPage + 1);
  });

  const lastButton : HTMLButtonElement | null  = document.createElement("button");
  lastButton.innerText = "Dernière page";
  lastButton.className = currentPage === totalPages ? "active" : "";
  lastButton.disabled = currentPage === totalPages;
  lastButton.addEventListener("click", () => {
    displaySearchResults(query, totalPages);
  });

  buttonsWrapper.appendChild(nextButton);
  buttonsWrapper.appendChild(lastButton);

  const pageCounter : HTMLSpanElement | null = document.createElement("span");
  pageCounter.className = "paginationPageCounter";
  pageCounter.innerText = `Page ${currentPage} sur ${totalPages}`;

  if (paginationWrapper) {
    paginationWrapper.appendChild(buttonsWrapper);
    paginationWrapper.appendChild(pageCounter);
  }
}

// Définition des gestionnaires d'événements

async function handleSearchSubmit(event) {
  event.preventDefault();
  const query : any = searchInput?.value;

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

// Carrousel

const sliderContainers = document.querySelectorAll(".sliderContainer");
sliderContainers.forEach(sliderContainer => {
  const sliderWrapper : HTMLElement | null = sliderContainer.querySelector(".sliderWrapper");
  const sliderPrev : HTMLElement | null = sliderContainer.querySelector(".sliderPrev");
  const sliderNext : HTMLElement | null = sliderContainer.querySelector(".sliderNext");
  const percentageToScroll : number = 50; // Pourcentage de la largeur du carrousel à défiler à chaque clic

  if (sliderWrapper) {
    sliderPrev?.addEventListener("click", () => {
      const amountToScroll : number = sliderWrapper.clientWidth * (percentageToScroll / 100);
      sliderWrapper.scrollBy({
        left: -amountToScroll,
        behavior: "smooth"
      });
    });

    sliderNext?.addEventListener("click", () => {
      const amountToScroll : number = sliderWrapper.clientWidth * (percentageToScroll / 100);
      sliderWrapper.scrollBy({
        left: amountToScroll,
        behavior: "smooth"
      });
    });
  }
});

// Appel des fonctions principales

fetchTrendingMovie();
fetchMovies(28, "moviesListAction");
fetchMovies(878, "moviesListSf");

// Ajout des gestionnaires d'événements

const searchForm : HTMLElement | null = document.querySelector(".searchNav");
const searchInput : HTMLInputElement | null = document.querySelector(".searchSite");
const searchButton : HTMLElement | null = document.querySelector(".searchButton");

if (searchForm && searchInput && searchButton) {
  searchForm.addEventListener("submit", handleSearchSubmit);
}

if (infoButton) {
  infoButton.addEventListener("click", () => {
    displayMoviePopup(trendingMovieData);
  });
}

////////////////////////////////////////////////////////////




