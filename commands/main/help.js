const Command = require('../../bot/command.js');
const DisableCmdHandler = require('../../bot/disableCmdHandler.js');

const color = '#8fde5d';
const mainSyntax =
  '_:bulb: Using a command w/o parameters gets extended help_\n[parameter] - Mandatory parameter\n(parameter) - Optional paramater';
const mainLinks = `[Vote](${client.config['bot']['vote_link']}) [Support](${client.config['bot']['support_server']}) [Invite](${client.config['bot']['invite']})`;

class Help extends Command {
  constructor() {
    super('help', 'help', 'List all commands and their information', {
      args: false
    });
  }

  async run(client, message, args) {
    const prefix = await client.prefix(message);
    const rico = await client.users
      .fetch(client.config.users.rico_id)
      .catch(_ => client.config.users.rico_tag);
    const handler = new DisableCmdHandler(client.apiClient);

    await handler.initDb().catch(async err => {
      logger.error(err);
      return message.channel.send(await this.serverErrorEmbed());
    });

    const categorys = [
      [client.commands.get('mhw'), client.mhw],
      [client.commands.get('mhgu'), client.mhgu],
      [client.commands.get('cat'), client.cat],
      [client.commands.get('calc'), client.math]
    ].filter(commands => {
      const guild = handler.db[message.guild.id];
      if (!guild) return true;
      const tree = guild[commands[0].subTree];
      if (!tree || message.member.hasPermission('ADMINISTRATOR')) return true;
      return commands[1].size != tree.length;
    });

    // build all the category commands
    // we can't use category.usageEmbed because it doesn't do permission checks
    const embeds = categorys.map(commands => {
      const params = commands[1]
        .filter(command => {
          if (message.member.hasPermission('ADMINISTRATOR')) return true;
          return !handler.isCommandDisabled(
            message.guild.id,
            commands[0].subTree,
            command.name
          );
        })
        .map(
          command =>
            `**${prefix}${commands[0].name} ${command.usage}** - ${command.description}`
        );

      const embed = this.MessageEmbed()
        .setColor(color)
        .addField(commands[0].description, `**${commands[0].usage}**`)
        .addField('Parameters Help', params.join('\n\n'));

      return embed;
    });

    const mainList = categorys
      .map(
        commands =>
          `**${prefix}${commands[0].name}** - ${commands[0].description}`
      )
      .join('\n');
    const mainGeneral = client.commands
      .filter(
        command =>
          !command.category &&
          !command.secret &&
          !(command.admin && !message.member.hasPermission('ADMINISTRATOR')) &&
          !handler.isCommandDisabled(message.guild.id, 'main', command.name)
      )
      .map(command => `**${prefix}${command.name}** - ${command.description}`)
      .join('\n');
    const mainIssues = `\`\`\`Contact ${rico.tag} | Use ${prefix}support\`\`\``;

    const main = this.MessageEmbed().setColor(color);

    if (mainList.length) main.addField('Main', mainList);
    if (mainGeneral.length) main.addField('General', mainGeneral);

    main
      .addField('Syntax', mainSyntax)
      .addField('\u200b', '\u200b')
      .addField('Experiencing Issues?', mainIssues)
      .addField('Links', mainLinks);

    const reactions = {
      first: '⏪',
      back: '◀',
      next: '▶',
      last: '⏩',
      stop: '⏹'
    };
    this.menu(message, [main, ...embeds], 120000, reactions);
  }
}

module.exports = Help;
