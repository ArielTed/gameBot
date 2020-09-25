require('dotenv').config();
const axios = require('axios');
const utils = require('../utils');

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
    const authorization = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`);
    const { data } = await axios({
      method: 'post',
      url: `https://api-v3.igdb.com/games?search=${game}&fields=name,genres.name,platforms.name,first_release_date,cover.url,summary`,
      headers: {
        'Accept': 'application/json',
        'Client-ID': process.env.IGDB_CLIENT_ID,
        'Authorization': `Bearer ${authorization.data.text.access_token}`
      }
    });
    return data;
  }
  catch (err) {
    console.log(err);
    return null;
  }
}

const randomGameData = async () => {
  try {
    const authorization = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`);
    const { data } = await axios({
      method: 'post',
      url: `https://api-v3.igdb.com/games?search=${utils.games[utils.getRandomInt(0, utils.games.length)]}&fields=name,genres.name,platforms.name,first_release_date,cover.url,summary`,
      headers: {
        'Accept': 'application/json',
        'Client-ID': process.env.IGDB_CLIENT_ID,
        'Authorization': `Bearer ${authorization.data.text.access_token}`
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
  getGameData,
  randomGameData
}
