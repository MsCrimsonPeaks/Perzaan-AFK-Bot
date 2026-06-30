const mineflayer = require('mineflayer');
const express = require('express');
const config = require('./settings.json');

// Express server to keep hosting (like Render) alive
const app = express();
app.get('/', (req, res) => res.send('Bot is Online'));
app.listen(process.env.PORT || 5000, () => console.log('Web server running.'));

let bot;

function createBot() {
  console.log('Connecting to server...');
  
  bot = mineflayer.createBot({
    host: config.server.ip,
    port: config.server.port,
    username: config['bot-account'].username,
    version: config.server.version
  });

  bot.once('spawn', () => {
    console.log('Bot successfully spawned.');
    
    // Minimal Anti-AFK: Jump and look around every 30 seconds
    setInterval(() => {
      if (bot && bot.entity) {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 300);
        bot.look(Math.random() * Math.PI * 2, 0); 
      }
    }, 30000);
  });

  bot.on('kicked', (reason) => console.log(`Kicked: ${reason}`));
  bot.on('error', (err) => console.log(`Error: ${err.message}`));
  
  // Clean 10-second reconnect loop
  bot.on('end', () => {
    console.log('Disconnected. Reconnecting in 10 seconds...');
    setTimeout(createBot, 10000);
  });
}

createBot();
