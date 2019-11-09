const Discord = require('discord.js');
const menu = require('../api/djs-pages');

module.exports = {
  name: 'find',
  args: false,
  usage: 'find',
  description: 'Shows all the current sessions posted via CatBot',
  secret: false,
  error(message) {
    const usageEmbed = new Discord.RichEmbed()
      .setColor('#8fde5d')
      .addField('Usage', this.usage)
      .setTimestamp();

    return message.channel.send(usageEmbed);
  },
  Chunk(arr, len) {
    const chunks = [];

    let i = 0;
    while (i < arr.length) {
      chunks.push(arr.slice(i, i += len));
    }

    return chunks;
  },
  async run(client, message, args) {
    const lfg = require('../databases/lfg/lfg.json');

    if (Object.keys(lfg).length == 0) {
      return message.reply('Sorry meowster but there are no sessions posted right now!');
    }

    const posts = [];

    for (const sessionID in lfg) {
      const post = {};
      post[sessionID] = lfg[sessionID];
      posts.push(post);
    }

    const tChunks = this.Chunk(posts, 5);
    const embeds = [];
    let tEmbed;

    for (const outer of tChunks) {
      tEmbed = new Discord.RichEmbed();

      tEmbed
        .setTitle('Session List')
        .setDescription('Find other players to hunt with!');

      for (const inner of outer) {
        const sessionID = Object.keys(inner)[0];
        let desc;
        if (!inner[sessionID]['description']) {
          desc = 'No description provided.';
        }

        desc = inner[sessionID]['description'];

        tEmbed.addField(
          '\u200B',
          '```\n'
          + `🔖 Session ID: ${sessionID}\n`
          + `🕹️ Platform: ${inner[sessionID]['platform']}\n`
          + `📝 Description: ${desc}\n`
          + '```',
        );
        
        tEmbed.setColor('#8fde5d');
      }

      embeds.push(tEmbed);
    }

    let reactions = {};
    new menu(message.channel, message.author.id, embeds, 120000, reactions = { first: '⏪', back: '◀', next: '▶', last: '⏩', stop: '⏹'} );
    
    /*
    new Embeds()
      .setArray(embeds)
      .setTimeout(30 * 1000)
      .setNavigationEmojis({
        back: '◀',
        jump: '↗',
        forward: '▶',
        delete: '🗑',
      })
      .setPageIndicator(true)
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel)
      .setColor('#8fde5d')
      .build();*/
  },
};