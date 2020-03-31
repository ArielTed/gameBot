const crypto = require('crypto');
const axios = require('axios');
const tmdb = require('../tmdb');

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
            throw 'Error verifying x hub signature';
        }
        catch (error) {
          console.log(error);
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
    const entities = tmdb.extractEntity(obj.message.nlp.entities, 'intent');
    if (entities !== null) {
      switch (entities[0]) {
        case 'movieinfo':
          const movies = tmdb.extractEntity(obj.message.nlp.entities, 'movie');
          if (movies !== null) {
            const movieData = await tmdb.getMovieData(movies[0]);
            responseData = {
              type: 'movie',
              text: movieData
            };
          }
          else {
            responseData = {
              type: 'error',
              text: 'Sorry, I did not understand.'
            }
          }
          break;
        default:
          responseData = {
            type: 'error',
            text: 'Sorry, I did not understand.'
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
            text: 'Hello, nice to meet you.'
          }
          break;
        case 'bye':
          responseData = {
            type: 'bye',
            text: 'Bye, see you soon!'
          }
          break;
        case 'thanks':
          responseData = {
            type: 'thanks',
            text: 'You\'re welcome.'
          }
          break;
        default:
          responseData = {
            type: 'error',
            text: 'Sorry, I did not understand.'
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

  async response(data, userData, responseData) {
    switch (responseData.type) {
      case 'movie':
        const { userData: { sender }, responseData: { text: { title, overview, release_date, poster_path } } } = await this.messageHandler(data);
        const response = `Title: ${title}\nRelease date: ${release_date}\nSummary: ${overview}`;
        await this.img(sender, poster_path);
        await this.txt(sender, response);
        break;
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
        await this.txt(userData.sender, 'Sorry, I did not understand.');
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

module.exports = FBeamer;
