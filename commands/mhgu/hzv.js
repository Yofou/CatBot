const { MessageAttachment } = require('discord.js');
const Command = require('../../bot/command.js');
const logger = require('../../bot/log.js');
const Utils = require('../../bot/utils');

const imageJSON = require('../../source_files/MonsterDataImages/mhgu_monster_map.json');
const imageMap = Utils.getDataAsMap(imageJSON);

const iconJSON = require('../../source_files/MonsterDataImages/mhgu_monster_icon_map.json');
const iconMap = Utils.getDataAsMap(iconJSON);

class Hzv extends Command {
  constructor() {
    super('hzv', 'hzv [monster name]', 'Get hzv info for a specific monster');
  }

  monsterEmbed(message, name, rawEmbed = this.MessageEmbed, menu = this.menu) {
    const image = imageMap.get(name);
    const icon = iconMap.get(name);

    logger.debug('hzv log', { type: 'hzvRead', name: name });

    const thumbnail = new MessageAttachment(
      icon.imagePath,
      icon.fileName.replace(/[',\s,-]/g, '')
    );
    const embedImage = new MessageAttachment(
      image.imagePath,
      image.fileName.replace(/[',\s,-]/g, '')
    );

    const attachUrl = name => `attachment://${name}`;

    const embed = rawEmbed()
      .setColor('#8fde5d')
      .setTitle(`__**${image.title}**__`)
      .attachFiles([embedImage, thumbnail])
      .setThumbnail(attachUrl(thumbnail.name))
      .setImage(attachUrl(embedImage.name))
      .setTimestamp()
      .setFooter(image.title);

    return embed;
  }

  async run(client, message, args) {
    let input = args.join('').toLowerCase();

    if (imageMap == null) {
      return message.channel.send(await this.serverErrorEmbed());
    }

    if (!imageMap.has(input)) {
      let msg = "That monster doesn't seem to exist!";

      const options = {
        input: input,
        threshold: 0.8,
        innerKey: 'title',
        includeScore: true
      };

      let similarItems = this.findAllMatching(imageMap, options);

      if (similarItems.length) {
        return this.reactions(message, similarItems, this.monsterEmbed);
      }

      message.channel.send(msg);
    } else if (imageMap.has(input)) {
      const embed = this.monsterEmbed(message, input);
      message.channel.send(embed);
    }
  }
}

module.exports = Hzv;
