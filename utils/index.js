const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

const games = [
  'Fortnite', 'GTA V', 'PUBG', 'Animal Crossing', 'Assassin\'s Creed', 'Halo', 'Apex Legends', 'Doom', 'Destiny', 'Overwatch',
  'League of Legends', 'FIFA', 'Zelda', 'Final Fantasy', 'Just Dance', 'Battlefield', 'Call of Duty', 'Hitman', 'Dofus',
  'World of Warcraft', 'Mario', 'Counter Strike', ''
];

const greetings = [
  'Hello, nice to meet you.', 'Hi! Pleased to meet you.', 'Greetings my friend.', 'Welcome!'
];

const thanks = [
  'You\'re welcome.'
];

const bye = [
  'Bye, see you soon!', 'Goodbye', 'See you!', 'Farewell my friend.'
];

const error = [
  'Sorry, I didn\'t understand.', 'I am sorry but I did not understand.'
];

module.exports = {
  getRandomInt,
  games,
  greetings,
  thanks,
  bye,
  error
}
