const containerMovies = document.querySelector(".movies");
const btnNext = document.querySelector(".btn-next");
const btnPrev = document.querySelector(".btn-prev");

const inputSearch = document.querySelector(".input");

const coverMovieDay = document.querySelector('.highlight__video');
const titleMovieDay = document.querySelector('.highlight__title');
const ratingMovieDay = document.querySelector('.highlight__rating');
const genresMovieDay = document.querySelector('.highlight__genres');
const releaseMovieDay = document.querySelector('.highlight__launch');
const overviewMovieDay = document.querySelector('.highlight__description');
const linkMovieDay = document.querySelector('.highlight__video-link');

const modal = document.querySelector('.modal');
const btnCloseModal = document.querySelector('.modal__close');
const titleModal = document.querySelector('.modal__title');
const imgModal = document.querySelector('.modal__img');
const descriptionModal = document.querySelector('.modal__description');
const averageModal = document.querySelector('.modal__average');
const genresModal = document.querySelector('.modal__genres');

const btnTheme = document.querySelector('.btn-theme');
const root = document.querySelector(':root');
const logo = document.querySelector('.header__container-logo img');

const body = document.querySelector('body');

function showError(error) {
  body.innerHTML = '';
  const errorMessage = document.createElement('div');
  const textErrorMessage = document.createElement('p');
  const btnRefresh = document.createElement('button');

  errorMessage.style.backgroundColor = '#bbbbbb';
  errorMessage.style.marginTop = '40vh';
  errorMessage.style.display = 'flex';
  errorMessage.style.flexDirection = 'column';
  errorMessage.style.alignItems = 'center';
  errorMessage.style.gap = '25px';
  errorMessage.style.padding = '15px';

  textErrorMessage.textContent = `Erro: ${error}. Clique no botão para recarregar a página!`;

  btnRefresh.addEventListener('click', () => document.location.reload(true));
  btnRefresh.textContent = 'Recarregar';
  btnRefresh.style.backgroundColor = '#212121';
  btnRefresh.style.color = '#f1f2f3';
  btnRefresh.style.padding = '5px 10px';
  btnRefresh.style.borderRadius = '4px';
  btnRefresh.style.cursor = 'pointer';

  errorMessage.appendChild(textErrorMessage);
  errorMessage.appendChild(btnRefresh);
  body.appendChild(errorMessage);
}


let querySearch = '';

async function getAllMovies() {
  try {
    const response = await api.get('/discover/movie?language=pt-BR&include_adult=false');
    const { results } = response.data;
    const movies = results.slice(0, 18);
    fillCardMovie(movies);
  } catch (error) {
    showError(error);
  }
  inputSearch.focus();
}
getAllMovies();

async function getMovieDay() {
  try {
    const response = await api.get('/movie/436969?language=pt-BR');
    const result = response.data;
    let genres = '';
    for (const item of result.genres) {
      genres += `${item.name} `;
    }
    const resGenres = genres.trim().split(' ');
    coverMovieDay.style.backgroundImage = `url(${result.backdrop_path})`;
    coverMovieDay.style.backgroundSize = '100%';
    titleMovieDay.textContent = result.title;
    ratingMovieDay.textContent = result.vote_average;
    genresMovieDay.textContent = resGenres;
    releaseMovieDay.textContent = result.release_date;
    overviewMovieDay.textContent = result.overview;
  } catch (error) {
    showError(error);
  }
}
getMovieDay();

async function getVideoMovieDay() {
  try {
    const response = await api.get('/movie/436969/videos?language=pt-BR');
    const { key } = response.data.results[0];
    linkMovieDay.href = `https://www.youtube.com/watch?v=${key}`;
  } catch (error) {
    showError(error);
  }
}
getVideoMovieDay();

async function searchMovies(querySearch, current) {
  try {
    const response = await api.get(`/search/movie?language=pt-BR&include_adult=false&query=${querySearch}`);
    const { results } = response.data;
    const movies = results.slice(0, 18);

    if (movies.length === 0) {
      document.location.reload(true);
    };

    if (movies.length <= current) {
      current = 0;
    }

    showMovies(movies, current);
  } catch (error) {
    showError(error);
  }
}

function fillCardMovie(movies) {
  let current = 0;

  showMovies(movies, current);
  inputSearch.addEventListener('keypress', (event) => {
    if (event.key !== "Enter") {
      return;
    }
    querySearch = inputSearch.value;
    inputSearch.value = "";

    if (!querySearch) {
      showMovies(movies = getAllMovies(), current = 0);
    }

    searchMovies(querySearch, current = 0);

  })


  btnNext.addEventListener('click', () => {
    if (current === 12) {
      current = 0;
    } else {
      current += 6;
    }

    if (querySearch) {
      movies = showMovies(searchMovies(querySearch, current));
    }
    showMovies(movies, current);
  });

  btnPrev.addEventListener('click', () => {
    if (current === 0) {
      current = 12;
    } else {
      current -= 6;
    }

    if (querySearch) {
      movies = showMovies(searchMovies(querySearch, current));
    }
    showMovies(movies, current);
  });


};

function showMovies(movies, current) {
  while (containerMovies.firstChild) {
    containerMovies.removeChild(containerMovies.firstChild);
  }

  for (let i = current; i < current + 6 && i < movies.length; i++) {
    const card = document.createElement('div');
    card.classList.add('movie');
    card.style.backgroundImage = `url(${movies[i].poster_path})`;

    const movieInfo = document.createElement('div');
    movieInfo.classList.add('movie__info');

    const movieTitle = document.createElement('span');
    movieTitle.classList.add('movie__title');
    movieTitle.textContent = movies[i].title;

    const movieRating = document.createElement('span');
    movieRating.classList.add('movie__rating');
    movieRating.textContent = movies[i].vote_average;

    const iconStar = document.createElement('img');
    iconStar.src = '../assets/estrela.svg';
    iconStar.alt = 'Estrela';

    const movieId = document.createElement('input');
    movieId.setAttribute('type', 'hidden');
    movieId.setAttribute('name', 'id');
    movieId.setAttribute('value', movies[i].id);

    movieRating.appendChild(iconStar);

    movieInfo.appendChild(movieTitle);
    movieInfo.appendChild(movieRating);

    card.appendChild(movieId);
    card.appendChild(movieInfo);
    containerMovies.appendChild(card);
  }
  showModal();
}

function showModal() {
  const movies = document.querySelectorAll('.movie');
  if (!movies) return;
  for (const divMovie of movies) {
    divMovie.addEventListener('click', async (event) => {
      const id = event.target.children[0].value;
      modal.classList.remove('hidden');
      try {
        const response = await api.get(`/movie/${id}?language=pt-br`);
        const { title, backdrop_path, overview, vote_average, genres } = response.data;
        titleModal.textContent = title;
        imgModal.src = backdrop_path;
        descriptionModal.textContent = overview;
        averageModal.textContent = vote_average;
        while (genresModal.firstChild) {
          genresModal.removeChild(genresModal.firstChild);
        }
        for (const genre of genres) {
          const spanGenre = document.createElement('span');
          spanGenre.classList.add('highlight__description');
          spanGenre.textContent += genre.name;
          genresModal.appendChild(spanGenre);
        }
      } catch (error) {
        showError(error)
      }
    })
  }

  const closeModal = () => {
    modal.classList.add('hidden');
  }

  btnCloseModal.addEventListener('click', closeModal);
  modal.addEventListener('click', closeModal);
}

function checkIsTheme() {
  const currentTheme = localStorage.getItem('theme');

  if (currentTheme === 'dark') {
    btnTheme.src = "./assets/dark-mode.svg";
    root.style.setProperty('--background', '#1B2028');
    root.style.setProperty('--text-color', '#ffffff');
    root.style.setProperty('--bg-secondary', '#2D3440');
    root.style.setProperty('--bg-modal', '#2D3440');
    btnPrev.src = './assets/arrow-left-light.svg';
    btnNext.src = './assets/arrow-right-light.svg';
    logo.src = './assets/logo.svg';
    btnCloseModal.src = './assets/close.svg'
    localStorage.setItem('theme', 'dark');
  }
}

checkIsTheme();


function toggleTheme() {

  const currentTheme = localStorage.getItem('theme');

  if (!currentTheme || currentTheme === 'light') {
    btnTheme.src = "./assets/dark-mode.svg";
    root.style.setProperty('--background', '#1B2028');
    root.style.setProperty('--text-color', '#ffffff');
    root.style.setProperty('--bg-secondary', '#2D3440');
    root.style.setProperty('--bg-modal', '#2D3440');
    btnPrev.src = './assets/arrow-left-light.svg';
    btnNext.src = './assets/arrow-right-light.svg';
    logo.src = './assets/logo.svg';
    btnCloseModal.src = './assets/close.svg'
    localStorage.setItem('theme', 'dark');
    return;
  }

  btnTheme.src = "./assets/light-mode.svg";
  root.style.setProperty('--background', '#fff');
  root.style.setProperty('--text-color', '#1b2028');
  root.style.setProperty('--bg-secondary', '#ededed');
  root.style.setProperty('--bg-modal', '#ededed');
  btnPrev.src = './assets/arrow-left-dark.svg';
  btnNext.src = './assets/arrow-right-dark.svg';
  logo.src = './assets/logo-dark.png';
  btnCloseModal.src = './assets/close-dark.svg'
  localStorage.setItem('theme', 'light');

}

btnTheme.addEventListener('click', toggleTheme);
