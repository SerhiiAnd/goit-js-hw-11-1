import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { searchImages } from './api-services';

const form = document.getElementById('search-form');
const gallery = document.getElementById('gallery');
const loadMoreBtn = document.getElementById('load-more');
let page = 1;

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  try {
    const searchQuery = e.target.elements.searchQuery.value.trim();
    if (!searchQuery) return;

    page = 1;
    gallery.innerHTML = '';

    const response = await searchImages(searchQuery, page);
    handleResponse(response);
  } catch (error) {
    console.error('Error:', error);
    showErrorMessage('Something went wrong. Please try again.');
  }
});

loadMoreBtn.addEventListener('click', async function () {
  try {
    const searchQuery = form.elements.searchQuery.value.trim();
    if (searchQuery) {
      page++;
      const response = await searchImages(searchQuery, page);
      handleResponse(response);
    }
  } catch (error) {
    console.error('Error:', error);
    showErrorMessage('Something went wrong. Please try again.');
  }
});

gallery.addEventListener('click', function (e) {
  const clickedImage = e.target.closest('.photo-card img');
  if (clickedImage) {
    const largeImageUrl = clickedImage.dataset.largeurl;
    showLargeImage(largeImageUrl);
  }
});

function handleResponse(response) {
  const images = response.hits;
  const totalHits = response.totalHits;

  if (images.length === 0) {
    showErrorMessage(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  showTotalHitsMessage(totalHits);

  if (page === 1) {
    gallery.innerHTML = '';
  }

  images.forEach(image => {
    const card = createImageCard(image);
    gallery.appendChild(card);
  });

  if (page === 1) {
    loadMoreBtn.style.display = 'block';
  }

  if (images.length < 40) {
    loadMoreBtn.style.display = 'none';
    showErrorMessage(
      "We're sorry, but you've reached the end of search results."
    );
  }

  updateSimpleLightbox();
}

function showTotalHitsMessage(totalHits) {
  Notiflix.Notify.Success(`Hooray! We found ${totalHits} images.`);
}

function updateSimpleLightbox() {
  const lightbox = new SimpleLightbox('.photo-card a', {});
  lightbox.refresh();
}

function createImageCard(image) {
  const card = document.createElement('div');
  card.classList.add('photo-card');

  const img = createImageElement(image);
  const link = document.createElement('a');
  link.href = image.largeImageURL;
  link.appendChild(img);

  const info = createInfoElement(image);

  card.append(link, info);

  return card;
}

function createImageElement(image) {
  const img = document.createElement('img');
  img.src = image.webformatURL;
  img.alt = image.tags;
  img.loading = 'lazy';

  img.dataset.largeurl = image.largeImageURL;

  return img;
}

function createInfoElement(image) {
  const info = document.createElement('div');
  info.classList.add('info');

  const createInfoItem = (label, value) => {
    const item = document.createElement('p');
    item.classList.add('info-item');
    item.innerHTML = `<b>${label}:</b> ${value}`;
    return item;
  };

  const likes = createInfoItem('Likes', image.likes);
  const views = createInfoItem('Views', image.views);
  const comments = createInfoItem('Comments', image.comments);
  const downloads = createInfoItem('Downloads', image.downloads);

  info.append(likes, views, comments, downloads);

  return info;
}

function showErrorMessage(message) {
  Notiflix.Notify.Failure(message);
}

function showLargeImage(url) {
  const largeImage = document.createElement('img');
  largeImage.src = url;

  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.appendChild(largeImage);

  document.body.appendChild(modal);

  function closeModal() {
    document.body.removeChild(modal);
    document.removeEventListener('keydown', handleKeyPress);
  }

  function handleKeyPress(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  }

  modal.addEventListener('click', closeModal);
  document.addEventListener('keydown', handleKeyPress);
}
