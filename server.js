const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const FBeamer = require('./fbeamer');

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}
const PORT = process.env.PORT || 9292;

const app = express();

app.use(express.json());
app.set('json spaces', 2);
app.use(cors());
app.use(helmet());

app.options('*', cors());

const FB = new FBeamer({
  pageAccessToken: process.env.PAGE_ACCESS_TOKEN,
  verifyToken: process.env.VERIFY_TOKEN,
  appSecret: process.env.APP_SECRET
});

app.get('/', (req, res) => FB.registerHook(req, res));
app.post('/', express.json({ verify: FB.verifySignature.call(FB) }));
app.post('/', (req, res, data) => {
  return FB.incoming(req, res, async (data) => {
    try {
      const { userData, responseData } = await FB.messageHandler(data);
      await FB.response(userData, responseData);
    }
    catch (error) {
      console.log(error);
    }
  });
});

app.listen(PORT, () => console.log(`📡 Running on port ${PORT}`));
