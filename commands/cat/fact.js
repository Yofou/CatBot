const Command = require('../../bot/command.js');

class Facts extends Command {
  constructor() {
    super('fact', 'fact', 'Shows random cat facts', {
      args: false,
      alias: ['facts'],
      cooldown: 2000
    });
  }

  async run(client, message, args) {
    if (!client.catfacts)
      return message.channel.send(await this.serverErrorEmbed());

    const randomIndex = Math.floor(Math.random() * client.catfacts.length);
    message.channel.send(client.catfacts[randomIndex]);
  }
}

module.exports = Facts;
