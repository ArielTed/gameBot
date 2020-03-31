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

const getGameData = async (game) => {
  try {
    const { data } = await axios({
      method: 'post',
      url: `https://api-v3.igdb.com/games?search=${game}&fields=name,genres.name,platforms.name,first_release_date,cover.url,summary`,
      headers: {
        'Accept': 'application/json',
        'user-key': process.env.IGDB
      }
    });
    return data;
  }
  catch (err) {
    console.log(err);
    return null;
  }
}

module.exports = {
  extractEntity,
  getGameData
}
