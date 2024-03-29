const Bot = require('./bot.js');
const pjson = require('../package.json');
const config = require('../config.json');
const ApiClient = require('./api.js');
const logger = require('./log.js');

client = new Bot(config['bot']['defaultPrefix']);
client.apiClient = new ApiClient(config['api']);
client.version = pjson.version;
client.config = config;

// load commands
client.buildCommands(__dirname.replace('bot', 'commands'), {
  main: 'commands'
});

function fetchDatabase() {
  /**
   * Build up data collections by fetching everything from the API
   */

  client.apiClient
    .getCatFacts()
    .then(factsList => (client.catfacts = factsList))
    .catch(err => (client.catfacts = null));

  /** MHW Data - Armors, Decos, Items, Monsters, Skills, Weapons */
  client.apiClient
    .getMhwArmors()
    .then(armors => {
      client.mhwArmors = client.buildCollection();

      for (const i of Object.keys(armors)) {
        client.mhwArmors.set(i, armors[i]);
      }
    })
    .catch(err => (client.mhwArmors = null));

  client.apiClient
    .getMhwDecorations()
    .then(decos => {
      client.mhwDecorations = client.buildCollection();

      for (const i of Object.keys(decos)) {
        client.mhwDecorations.set(i, decos[i]);
      }
    })
    .catch(err => (client.mhwDecorations = null));

  client.apiClient
    .getMhwItems()
    .then(map => {
      client.mhwItems = client.buildCollection();

      for (const [k, v] of map) {
        client.mhwItems.set(k, v);
      }
    })
    .catch(err => (client.mhwItems = null));

  client.apiClient
    .getMhwMonsters()
    .then(map => {
      client.mhwMonsters = client.buildCollection();

      for (const [k, v] of map) {
        client.mhwMonsters.set(v.name, v.details);
      }
    })
    .catch(err => (client.mhwMonsters = null));

  client.apiClient
    .getMhwSkills()
    .then(skills => {
      client.mhwSkills = client.buildCollection();

      for (const i of Object.keys(skills)) {
        client.mhwSkills.set(i, skills[i]);
      }
    })
    .catch(err => (client.mhwSkills = null));

  client.apiClient
    .getMhwWeapons()
    .then(weapons => {
      client.mhwWeapons = client.buildCollection();

      for (const i of Object.keys(weapons)) {
        client.mhwWeapons.set(i, weapons[i]);
      }
    })
    .catch(err => (client.mhwWeapons = null));
}

fetchDatabase();

client
  .login(client.config['bot']['token'])
  .catch(err =>
    logger.error(
      `Client can't login - maybe check the bot token (config.json)\n${err}`
    )
  );

// Refresh database every 10 minutes
setInterval(function() {
  fetchDatabase();
}, 600000);
