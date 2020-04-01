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

const randomGameData = async () => {
  const games = [
    'Fortnite', 'GTA V', 'PUBG', 'Animal Crossing', 'Assassin\'s Creed', 'Halo', 'Apex Legends', 'Doom', 'Destiny', 'Overwatch',
    'League of Legends', 'FIFA', 'Zelda', 'Final Fantasy', 'Just Dance', 'Battlefield', 'Call of Duty', 'Hitman', 'Dofus',
    'World of Warcraft', 'Mario', 'Counter Strike', ''
  ];
  try {
    const { data } = await axios({
      method: 'post',
      url: `https://api-v3.igdb.com/games?search=${games[utils.getRandomInt(0, games.length)]}&fields=name,genres.name,platforms.name,first_release_date,cover.url,summary`,
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
  getGameData,
  randomGameData
}
