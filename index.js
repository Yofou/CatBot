const { ShardingManager } = require('discord.js');
const { TOKEN } = require('./utils/config.json');

const manager = new ShardingManager('./utils/main.js', { token: TOKEN });

manager.spawn();
manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));
