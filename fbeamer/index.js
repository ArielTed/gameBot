const crypto = require('crypto');
const axios = require('axios');
const igdb = require('../igdb');
const utils = require('../utils');
require('dotenv').config();

class FBeamer {
  constructor({ pageAccessToken, verifyToken, appSecret }) {
    try {
      if (pageAccessToken && verifyToken && appSecret) {
        this.pageAccessToken = pageAccessToken;
        this.verifyToken = verifyToken;
        this.appSecret = appSecret;
      }
      else {
        throw "One or more tokens/credentials are missing!";
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  registerHook(req, res) {
    const params = req.query;
    const mode = params['hub.mode'], token = params['hub.verify_token'], challenge = params['hub.challenge'];
    try {
      if ((mode && this.verifyToken) && mode === 'subscribe' && token === this.verifyToken) {
        console.log("Webhook registered!");
        return res.send(challenge);
      }
      else {
        console.log("Could not register webhook!");
        return res.sendStatus(400);
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  verifySignature(req, res, buffer) {
    return (req, res, buffer) => {
      if (req.method === 'POST') {
        try {
          const signature = req.headers['x-hub-signature'].substr(5);
          const hash = crypto.createHmac('sha1', this.appSecret).update(buffer, 'utf-8').digest('hex');
          if (signature !== hash)
            throw 'Error verifying x-hub-signature';
        }
        catch (error) {
          console.log(error);
          res.status(401).json('Acces Denied.');
        }
      }
    }
  }

  incoming(req, res, cb) {
    res.sendStatus(200);
    if (req.body.object === 'page' && req.body.entry) {
      const data = req.body;
      const messageObj = data.entry;
      if (!messageObj[0].messaging)
        console.log("Error message");
      else return cb(messageObj[0].messaging[0]);
    }
  }

  async messageHandler(obj) {
    const sender = obj.sender.id;
    const message = obj.message.text;

    let responseData;
    const entities = igdb.extractEntity(obj.message.nlp.entities, 'intent');
    if (entities !== null) {
      switch (entities[0]) {
        case 'gameinfo':
          const games = igdb.extractEntity(obj.message.nlp.entities, 'game');
          if (games !== null) {
            const gameData = await igdb.getGameData(games[0]);
            responseData = {
              type: 'game',
              text: gameData[0]
            };
          }
          else {
            responseData = {
              type: 'error',
              text: utils.error[utils.getRandomInt(0, utils.error.length)]
            }
          }
          break;
        case 'gamesearch':
          const gameData = await igdb.randomGameData();
          responseData = {
            type: 'randomgame',
            text: gameData[utils.getRandomInt(0, gameData.length)]
          };
          break;
        default:
          responseData = {
            type: 'error',
            text: utils.error[utils.getRandomInt(0, utils.error.length)]
          }
      }
    }
    else {
      let confidence = 0;
      let intent = '';
      for (let prop in obj.message.nlp.entities) {
        if (Object.prototype.hasOwnProperty.call(obj.message.nlp.entities, prop)) {
          if (obj.message.nlp.entities[`${prop}`][0].confidence > confidence) {
            confidence = obj.message.nlp.entities[`${prop}`][0].confidence;
            intent = prop;
          }
        }
      }
      switch (intent) {
        case 'greetings':
          responseData = {
            type: 'greetings',
            text: utils.greetings[utils.getRandomInt(0, utils.greetings.length)]
          }
          break;
        case 'bye':
          responseData = {
            type: 'bye',
            text: utils.bye[utils.getRandomInt(0, utils.bye.length)]
          }
          break;
        case 'thanks':
          responseData = {
            type: 'thanks',
            text: utils.thanks[utils.getRandomInt(0, utils.thanks.length)]
          }
          break;
        default:
          responseData = {
            type: 'error',
            text: utils.error[utils.getRandomInt(0, utils.error.length)]
          }
      }
    }

    const obj2 = {
      sender,
      type: 'text',
      content: message
    }
    return { userData: obj2, responseData };
  }

  async response(userData, responseData) {
    switch (responseData.type) {
      case 'game': {
        const { text: { first_release_date, genres, name, platforms, summary } } = responseData;
        let response = `Name: ${name}\n`;
        if (first_release_date !== undefined) {
          const releaseDate = new Date(first_release_date * 1000).toUTCString().slice(0, -13).slice(5);
          response += `Release date: ${releaseDate}\n`;
        }
        if (summary !== undefined) {
          response += `Summary: ${summary}\n`;
        }
        if (genres !== undefined) {
          let genresString = '';
          for (let genre of genres) {
            genresString += `${genre.name}, `;
          }
          genresString = genresString.slice(0, -2);
          response += `Genres: ${genresString}\n`;
        }
        if (platforms !== undefined) {
          let platformsString = '';
          for (let platform of platforms) {
            platformsString += `${platform.name}, `;
          }
          platformsString = platformsString.slice(0, -2);
          response += `Platforms: ${platformsString}`;
        }
        if (responseData.text.cover !== undefined) {
          await this.img(userData.sender, `https:${responseData.text.cover.url}`);
        }
        await this.txt(userData.sender, response);
        break;
      }
      case 'randomgame': {
        const { text: { first_release_date, genres, name, platforms, summary } } = responseData;
        let response = `Name: ${name}\n`;
        if (first_release_date !== undefined) {
          const releaseDate = new Date(first_release_date * 1000).toUTCString().slice(0, -13).slice(5);
          response += `Release date: ${releaseDate}\n`;
        }
        if (summary !== undefined) {
          response += `Summary: ${summary}\n`;
        }
        if (genres !== undefined) {
          let genresString = '';
          for (let genre of genres) {
            genresString += `${genre.name}, `;
          }
          genresString = genresString.slice(0, -2);
          response += `Genres: ${genresString}\n`;
        }
        if (platforms !== undefined) {
          let platformsString = '';
          for (let platform of platforms) {
            platformsString += `${platform.name}, `;
          }
          platformsString = platformsString.slice(0, -2);
          response += `Platforms: ${platformsString}`;
        }
        if (responseData.text.cover !== undefined) {
          await this.img(userData.sender, `https:${responseData.text.cover.url}`);
        }
        await this.txt(userData.sender, response);
        break;
      }
      case 'greetings':
        await this.txt(userData.sender, responseData.text);
        break;
      case 'bye':
        await this.txt(userData.sender, responseData.text);
        break;
      case 'thanks':
        await this.txt(userData.sender, responseData.text);
        break;
      case 'error':
        await this.txt(userData.sender, responseData.text);
        break;
      default:
        await this.txt(userData.sender, utils.error[utils.getRandomInt(0, utils.error.length)]);
    }
  }

  async sendMessage(payload) {
    try {
      await axios({
        method: 'post',
        url: `https://graph.facebook.com/v6.0/me/messages?access_token=${this.pageAccessToken}`,
        headers: { 'Content-Type': 'application/json' },
        data: payload
      });
    }
    catch (err) {
      console.log(err);
    }
  }

  async txt(id, text, messaging_type = 'RESPONSE') {
    const payload = {
      messaging_type,
      recipient: {
        id
      },
      message: {
        text
      }
    };
    await this.sendMessage(payload);
  }

  async img(id, imgURL) {
    const payload = {
      recipient: {
        id
      },
      message: {
        attachment: {
          type: "image",
          payload: {
            url: imgURL
          }
        }
      }
    };
    await this.sendMessage(payload);
  }
}

module.exports = new FBeamer({
  pageAccessToken: process.env.PAGE_ACCESS_TOKEN,
  verifyToken: process.env.VERIFY_TOKEN,
  appSecret: process.env.APP_SECRET
});
