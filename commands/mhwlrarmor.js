const Discord = require('discord.js');

exports.run = (client, message, args) => {
  const listEmbed = new Discord.RichEmbed()
  .setColor('#8fde5d')
  .addField('Low Rank Armor List', "Alloy Armor Set\n Anja Armor Set\n Baan Armor Set\n Barroth Armor Set\n Blossom Armor Set\n Bone Armor Set\n Butterfly Armor Set\n Chainmail Armor Set\n Death Stench Armor Set\n Diablos Armor Set\n Diver Armor Set\n Gala Suit Armor Set\n Gajau Armor Set\n Girros Armor Set\n Guardian Armor Set\n High Metal Armor Set\n Harvest Armor Set\n Hornetaur Armor Set\n Hunter's Armor Set\n Ingot Armor Set\n Jagras Armor Set\n Jyura Armor Set\n Kadachi Armor Set\n Kestodon Armor Set\n King Beetle Armor Set\n Kirin Armor Set\n Kulu Armor Set\n Leather Armor Set\n Legiana Armor Set\n Lumu Armor Set\n Odogaron Armor Set\n Origin Armor Set\n Pukei Armor Set\n Rathalos Armor Set\n Rathian Armor Set\n Ryu's Armor Set\n Shamos Armor Set\n Tzitzi Armor Set\n Vespoid Armor Set")
  .setTimestamp()
  .setFooter('List Menu');

  message.channel.send(listEmbed);
}