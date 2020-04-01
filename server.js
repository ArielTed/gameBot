const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const FBeamer = require('./fbeamer');

const PORT = process.env.PORT || 9292;

const app = express();

app.use(express.json());
app.set('json spaces', 2);
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/', (req, res) => FBeamer.registerHook(req, res));
app.post('/', express.json({ verify: FBeamer.verifySignature.call(FBeamer) }), (req, res, data) => {
  return FBeamer.incoming(req, res, async (data) => {
    try {
      if (data.message.text.toLowerCase() === 'info' || data.message.text.toLowerCase() === 'infos' || data.message.text.toLowerCase() === 'information' || data.message.text.toLowerCase() === 'informations') {
        await FBeamer.txt(data.sender.id, 'Game Bot is a video game chatbot.\nYou can ask informations about specific video games, or you can ask for a random game if you don\'t know what to play tonight !\nExample commands: \'What is Fortnite ?\', \'Tell me about PUBG.\', \'What can I play tonight ?\', \'Suggest me a game.\'\nMore infos: https://github.com/ArielTed/gameBot');
      }
      else {
        const { userData, responseData } = await FBeamer.messageHandler(data);
        await FBeamer.response(userData, responseData);
      }
    }
    catch (error) {
      console.log(error);
    }
  });
});

app.listen(PORT, () => console.log(`📡 Running on port ${PORT}`));
