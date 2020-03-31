require('dotenv').config();
const axios = require('axios');

const extractEntity = (nlp, entity) => {
  if (Object.prototype.hasOwnProperty.call(nlp, entity)) {
    let entities = [];
    for (val of nlp[`${entity}`]) {
      if (val.confidence >= 0.7)
        entities.push(val.value);
    }
    return entities;
  }
  return null;
}

const getMovieData = async (movie, releaseYear = null) => {
  try {
    const { data } = await axios(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMBD}&query=${movie.replace(' ', '+')}`);
    const { id, title, overview, release_date, poster_path } = data.results[0];
    return { id, title, overview, release_date, poster_path: `https://image.tmdb.org/t/p/w300_and_h450_bestv2${poster_path}` };
  }
  catch (err) {
    console.log(err);
    return null;
  }
}

module.exports = {
  extractEntity,
  getMovieData
}
