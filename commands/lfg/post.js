const Command = require('../../utils/baseCommand.js');

class Post extends Command {
  constructor(prefix) {
    super(
      'post',
      'post [platform] [session id] (description)',
      'Posts an active session to CatBots LFG command'
    );
  }

  usageEmbed(error = '') {
    const data = [];
    data.push('platform: PC, PS4, or XBOX\n');
    data.push(
      'session id: Must be between 11 and 13 characters long for PC; and between 14 and 16 characters long for console (including spaces)\n'
    );
    data.push('description: Describe what you plan to do in the session\n');
    const embed = this.RichEmbed().setColor('#8fde5d');

    if (error) {
      embed.addField('An error has occurred!', error);
    }

    embed
      .addField('Usage', this.usage)
      .addField('Parameters Help', data.join('\n'))
      .addField(
        'Examples',
        'PC: +lfg post pc u7Mpp4F8Z$Wh This is a test description\nConsole: +lfg post xbox 4ZjN zKwZ TCdX This is a test description'
      )
      .setTimestamp();

    return embed;
  }

  sendSub(client, sessionID, content) {
    const sub = require('../../utils/databases/lfg/subscribe.json');

    let desc;
    if (!content['description']) {
      desc = 'No description provided.';
    } else {
      desc = content['description'];
    }

    let tEmbed = this.RichEmbed();

    tEmbed
      .setTitle('Session List')
      .setDescription('Find other players to hunt with!')
      .setColor('#8fde5d');

    tEmbed.addField(
      '\u200B',
      '```\n' +
        `🔖 Session ID: ${sessionID}\n` +
        `🕹️ Platform: ${content['platform']}\n` +
        `📝 Description: ${desc}\n` +
        '```'
    );

    //const post = tEmbed._apiTransform();

    let removableChannels = [];
    for (const channelID of sub['subscribe']) {
      let channel = client.channels.get(channelID);

      if (channel != null) {
        channel.send(tEmbed).catch(e => console.log(`ERROR: ${e}`));
      } else {
        removableChannels.push(channelID);
      }
      /*client.rest.makeRequest(
        'post',
        client.Constants.Endpoints.Channel(channelID).messages,
        true,
        {
          content: '',
          embed: post
        }
      );*/
    }

    // You need to assign sub['subscribe] to a variable otherwise it doesn't work
    const updatedSubscriptions = sub['subscribe'].filter(function(e) {
      return !removableChannels.includes(e);
    });

    sub['subscribe'] = updatedSubscriptions;

    const jsonObj = JSON.stringify(sub, null, 4);
    this.saveJsonFile(`./utils/databases/lfg/subscribe.json`, jsonObj);
  }

  updatePostsDb(json) {
    this.saveJsonFile(`./utils/databases/lfg/lfg.json`, json);
  }

  async run(client, message, args) {
    if (args.length == 1)
      return message.channel.send(this.usageEmbed('Session ID is required'));

    // load in the current posts from the json db
    const posts = require('../../utils/databases/lfg/lfg.json');

    const response = this.RichEmbed();

    // Validate the arguments
    let sessionID;
    const platform = args[0].toLowerCase();

    if (['ps4', 'xbox'].includes(platform)) {
      // for console the format is 'xxxx xxxx xxxx'(need to join args)

      if (args.length >= 4) {
        let tempArr = [];
        for (var i = 1; i < args.length; i++) {
          if (args[i].length <= 4) {
            tempArr.push(args[i]);
            args.slice(i);
          }
        }

        if (tempArr.length >= 1) {
          sessionID = tempArr.join(' ');
        } else {
          return message.channel.send(
            this.usageEmbed(`Can not find the session id`)
          );
        }
      } else if (args.length >= 2) {
        sessionID = args[1];
      } else {
        return message.channel.send(
          this.usageEmbed(`Can not find the session id`)
        );
      }
      if (
        sessionID.length == 0 ||
        sessionID.length < 14 ||
        sessionID.length > 16
      ) {
        return message.channel.send(
          this.usageEmbed(
            `XBOX/PS4 session ids need to be between 14 and 16 characters long \`${sessionID}\` is only ${sessionID.length} characters long.`
          )
        );
      }

      if (sessionID.split(' ').length != 3 && sessionID.split(' ').length != 1)
        return message.channel.send(
          this.usageEmbed(
            `XBOX/PS4 session ids needs to be in the format of xxxx xxxx xxxx or xxxx-xxxx-xxxx`
          )
        );
    } else if (platform == 'pc') {
      sessionID = args[1];

      if (
        sessionID == undefined ||
        sessionID.length < 11 ||
        sessionID.length > 13
      ) {
        return message.channel.send(
          this.usageEmbed(
            `PC session ids need to be between 11 and 13 characters long \`${sessionID}\` is only ${sessionID.length} characters long.`
          )
        );
      }
    } else {
      return message.channel.send(
        this.usageEmbed(`${platform} is not valid platform.`)
      );
    }

    // Checks if the sessionID has already been posted
    if (
      Object.keys(posts).includes(sessionID) &&
      posts[sessionID]['userID'] != message.author.id
    ) {
      return message.channel.send(
        'Sorry meowster but someone else has posted that session already!'
      );
    }

    // Create the new post
    const newPost = {
      description: '' // make default empty string
    };

    if (args.length > 2) {
      if (['ps4', 'xbox'].includes(platform)) {
        newPost['description'] = args.slice(4, args.length).join(' ');
      } else {
        newPost['description'] = args.slice(2, args.length).join(' ');
      }

      if (newPost['description'].length > 256)
        return message.channel.send(
          this.usageEmbed('Description is larger than 256 characters.')
        );
    }

    // Checks if the user has already posted or not
    let repost = false;
    for (let post in posts) {
      if (posts[post]['userID'] == message.author.id) {
        repost = post;
        break;
      }
    }

    if (repost) {
      delete posts[repost];

      const jsonObj = JSON.stringify(posts, null, 4);
      this.updatePostsDb(jsonObj);

      message.channel.send(`Meowster, the session \`${repost}\` was replaced!`);
    }

    newPost['userID'] = message.author.id;
    newPost['platform'] = platform;
    newPost['time'] = Date.now();

    if (newPost['description'].length == 0)
      newPost['description'] = 'No description provided.';

    // Create embed for SUCCESSFUL requests
    response
      .setColor('#8fde5d')
      .setTitle(`${platform.toUpperCase()} REQUEST SUCCESSFUL`)
      .addField(`**${sessionID}**`, `*${newPost['description']}*`);

    // Finishes up object and pushes it back into the lfg db
    posts[sessionID] = newPost;
    const jsonObj = JSON.stringify(posts, null, 4);

    this.updatePostsDb(jsonObj);
    message.channel.send(response);

    // Sends to all channel that are set to sub board
    this.sendSub(client, sessionID, newPost);
  }
}

module.exports = Post
