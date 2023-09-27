// webpack.config.js
const path = require('path');

module.exports = {
  entry: {
    app: './client.js',
  },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'public'),
  },
};