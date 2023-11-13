import axios from 'axios';

const apiKey = '40631901-ff7c1609fa7e5ab5e54020e9b';
const perPage = 40;

export async function searchImages(query, page) {
  const url = `https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;
  const response = await axios.get(url);
  return response.data;
}
