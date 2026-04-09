const chalk = require('chalk');

const logger = {
  info: (message) => {
    console.log(`${chalk.blue('[INFO]')} ${getTimestamp()} - ${message}`);
  },
  success: (message) => {
    console.log(`${chalk.green('[SUCCESS]')} ${getTimestamp()} - ${message}`);
  },
  warn: (message) => {
    console.log(`${chalk.yellow('[WARN]')} ${getTimestamp()} - ${message}`);
  },
  error: (message) => {
    console.error(`${chalk.red('[ERROR]')} ${getTimestamp()} - ${message}`);
  }
};

const getTimestamp = () => {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
};

module.exports = logger;