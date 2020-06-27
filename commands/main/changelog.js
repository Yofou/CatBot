const Command = require('../../utils/command.js');

class Changelog extends Command {
  constructor() {
    super('changelog', 'changelog', 'Shows latest update log', {
      args: false
    });
  }

  async run(client, message, args) {
    const prefix = await client.prefix(message);
    const changelogEmbed = this.MessageEmbed()
      .setColor('#8fde5d')
      .addField(
        `Changelog: v${client.version}`,
        `
        🔧 CatBot has had a few more upgrades on the technical side
        🔧 Changed database to API
        📖 Tinkered mhw weapons & armor embeds so they were not so **THICC**
        📖 Added safi jiiva weapon data
        📖 Added ${prefix}cat, Where we share our love of cats
        📖 Added ${prefix}prefix, Where you can set your own custom prefix
        `
      )
      .setTimestamp()
      .setFooter('Changelog Menu', client.user.avatarURL());

    message.channel.send(changelogEmbed);
  }
}

module.exports = Changelog;
