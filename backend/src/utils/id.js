const { v4: uuid } = require('uuid');

function shortCode() {
  return uuid().split('-')[0].toUpperCase();
}

module.exports = { shortCode };
