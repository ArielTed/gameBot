const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const messengerRoute = require('./routes');

const PORT = process.env.PORT || 9292;

const app = express();

app.use(express.json());
app.set('json spaces', 2);
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.use('/', messengerRoute);

app.listen(PORT, () => console.log(`📡 Running on port ${PORT}`));
