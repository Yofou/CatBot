const Discord = require('discord.js');
const { weaponsRatio, elemSharpRatio } = require('../util.js');

module.exports = {
  name: 'elemental',
  args: true,
  calc: true,
  usage: 'elemental [damage] [sharpness] [monster part multiplier]',
  description: 'Calculate for elemental',
  error(message) {
    const data = [];
    data.push('damage: base damage value');
    data.push('sharpness (elemental): none, red, orange, yellow, green, blue, white, purple');
    data.push('monsterpartmultiplier: multiplier value');

    const usageEmbed = new Discord.RichEmbed()
      .setColor('#8fde5d')
      .addField('Usage', this.usage)
      .addField('Parameters Help', data.join('\n'))
      .setTimestamp();
    
    return message.channel.send(usageEmbed);
  },
  run(client, message, args) {
    const sharpMult = (args[0] / 10) * elemSharpRatio.get(args[1]);

    let calculate = sharpMult * args[2];
    let rounded = Math.round(calculate);

    if(Number.isNaN(rounded) || !args[0] || !args[1] || !args[2]) {
      this.error(message);
    } else {
      message.channel.send("Your elemental damage is " + "**" + rounded + "**" + " meowster!");
    }
  },
};