const Command = require('../../utils/baseCommand.js');
const logger = require('../../utils/log.js');

const { Canvas } = require('canvas-constructor');
const { loadImage } = require('canvas');
const { MessageAttachment } = require('discord.js'); // This is to send the image via discord.
const hzvDB = require('../../utils/databases/mhw/hzv.json');

// Canvas parameters
const CANVAS_PADDING_Y = 90;
const CANVAS_TEXT_FONT = '30px Tahoma';
const CANVAS_PART_HEIGHT = 30; // pixels
const COLUMN_COUNT = 16; // columns
const COLUMN_GAP = 20;
const COLUMN_WIDTH = 64; // Max value for a column (in terms of width) is '1000' == 4 chars, which is 64 px
const MULITIPLIED_COLUMN_WIDTH = 95; // Max value for a column (in terms of width) is '1000' == 4 chars, which is 64 px

const HEX_WHITE = '#FFFFFF';
const HEX_RED = '#FF3232';
const HEX_ORANGE = '#ffa500';
const HEX_GREEN = '#78AB46';

const ICON_SIZE_PX = 50;

const HZV_FILENAME = 'hzv.png';

class Hzv extends Command {
  constructor(prefix) {
    super('hzv', 'hzv [monster name]', 'Get hzv info for a specific monster');
  }

  async monsterEmbed(client, name, rawEmbed = this.MessageEmbed()) {
    async function hzvImageGen(monsterName) {
      // get the monster hzv info from the db
      const monsterHzvInfo = hzvDB[monsterName.toLowerCase().replace(' ', '')];

      // store the monster parts in an array for canvas height calculation
      const parts = Object.keys(monsterHzvInfo);

      // remove the first element because its the name of the monster
      parts.shift();

      const canvasHeight = parts.length * (CANVAS_PART_HEIGHT + 5);

      // Figure out space needed (in pixels) for monster part names
      // by creating dummy canvas for each part and checking the width
      let maxPartWidth = 0;
      for (let key in monsterHzvInfo) {
        new Canvas()
          .setTextFont(CANVAS_TEXT_FONT)
          .measureText(key, (size, inst) => {
            if (size.width > maxPartWidth) {
              maxPartWidth = size.width;
            }
          });
      }

      // Compute total canvas width
      const canvasWidth =
        maxPartWidth +
        ((COLUMN_COUNT - 8) * COLUMN_WIDTH + 8 * MULITIPLIED_COLUMN_WIDTH) +
        COLUMN_COUNT * COLUMN_GAP;

      let hzvImage = new Canvas(canvasWidth, CANVAS_PADDING_Y + canvasHeight)
        .setColor(HEX_WHITE)
        .setTextFont(CANVAS_TEXT_FONT)
        .setTextAlign('center')
        .addResponsiveText(
          'Hitzone Values - (tenderized values in brackets) ',
          canvasWidth / 2,
          22.5
        ) // center title, 22.5 == y offset
        .setTextAlign('start');

      // Set base y downwards by 100px (height for table title + header/icons) and then another 20px for a gap
      // Set base x right to whatever the max monster part text size was.
      let y = 120;
      let x = maxPartWidth;

      // places the hit zone icons horizontally
      for (let iconName of [
        'ke',
        'slash',
        'blunt',
        'ranged',
        'fire',
        'water',
        'thunder',
        'ice',
        'dragon',
        'stun',
        'flinch',
        'trip',
        'timer',
        'wound',
        'sever',
        'notes'
      ]) {
        try {
          let pic = await loadImage(
            `${__dirname.replace(
              'commands',
              'utils/databases'
            )}/element/${iconName.toLowerCase()}.png`
          );
          hzvImage.addImage(pic, x + 15, 33, ICON_SIZE_PX, ICON_SIZE_PX);

          // advance x to next icon position
          if (
            [
              'slash',
              'blunt',
              'ranged',
              'fire',
              'water',
              'thunder',
              'ice',
              'dragon'
            ].includes(iconName)
          ) {
            x += MULITIPLIED_COLUMN_WIDTH + 12;
          } else {
            x += COLUMN_WIDTH + 12;
          }
        } catch (err) {
          logger.error(err, { where: 'hzv.js 104' });
        }
      }

      // Places all the monster parts vertically
      for (let key in monsterHzvInfo) {
        if (key == 'name') continue;
        hzvImage.addResponsiveText(key, 0, y);

        y += CANVAS_PART_HEIGHT + 5; // 5 for gap
      }

      y = 120;
      // Sets The Hitzone Values in a grid like format
      for (let key in monsterHzvInfo) {
        if (key == 'name') continue;
        let value = monsterHzvInfo[key];

        x = maxPartWidth;
        for (let hitzone in value) {
          let hzv = value[hitzone];

          if (hitzone == 'ke') {
            if (hzv == 1) {
              hzvImage.setColor(HEX_RED);
            } else if (hzv == 3) {
              hzvImage.setColor(HEX_ORANGE);
            } else if (hzv == 4) {
              hzvImage.setColor(HEX_GREEN);
            }
          }

          if (
            [
              'slash',
              'blunt',
              'ranged',
              'fire',
              'water',
              'thunder',
              'ice',
              'dragon'
            ].includes(hitzone)
          ) {
            hzv = `${hzv} (${Math.round(hzv * 0.75 + 25)})`;
            hzvImage.addResponsiveText(hzv, x + 20, y).setColor(HEX_WHITE);
            x += MULITIPLIED_COLUMN_WIDTH + 12;
          } else {
            hzvImage.addResponsiveText(hzv, x + 20, y).setColor(HEX_WHITE);
            x += COLUMN_WIDTH + 12;
          }
        }

        // next part y position
        y += CANVAS_PART_HEIGHT + 5; // 5 for gap
      }

      // Creates a discord attachment object and place the image content inside
      return new MessageAttachment(hzvImage.toBuffer(), HZV_FILENAME);
    }

    const monster = client.monsters.get(name);
    const embed = rawEmbed.setColor('#8fde5d').setTitle(monster.title);

    logger.debug('hzv log', { type: 'monsterRead', name: name });

    embed
      .setDescription(`${monster.description}\n\n${monster.info}`)
      .setThumbnail(monster.thumbnail)
      .attachFiles(
        await hzvImageGen(name).catch(err =>
          logger.error(
            `Failed to load ${monster.title} hitzone value image`,
            err
          )
        )
      )
      .setImage(`attachment://${HZV_FILENAME}`)
      .setTimestamp()
      .setFooter('Hitzone Values');

    return embed;
  }

  async run(client, message, args) {
    let input = args.join('').toLowerCase();

    for (let [name, monster] of client.monsters.entries()) {
      if (
        monster.aliases &&
        monster.aliases.includes(input) &&
        input.length > 0
      ) {
        input = name;
        break;
      }
    }

    if (!client.monsters.has(input)) {
      let msg = `That monster doesn't seem to exist! Check out \`${this.prefix}mhw list\` for the full list.`;

      const options = {
        input: input,
        threshold: 0.8,
        innerKey: 'title',
        includeScore: true,
        reloop: true
      };

      let similarItems = this.findAllMatching(client.monsters, options);

      if (similarItems.length) {
        return this.reactions(message, similarItems, this.monsterEmbed);
      }

      message.channel.send(msg);
    } else if (client.monsters.has(input)) {
      const embed = await this.monsterEmbed(client, input);
      message.channel.send(embed);
    }
  }
}

module.exports = Hzv;
