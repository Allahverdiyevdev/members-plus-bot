require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { connectDB } = require('./db');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel, Partials.GuildMember]
});

client.commands = new Collection();

// dynamic command loader (reads src/commands/*.js)
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
    const cmd = require(path.join(commandsPath, file));
    if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
  }
}

// simple event loader
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'))) {
    const ev = require(path.join(eventsPath, file));
    if (ev.once) client.once(ev.name, (...a) => ev.execute(...a, client));
    else client.on(ev.name, (...a) => ev.execute(...a, client));
  }
}

async function main() {
  await connectDB(process.env.MONGODB_URI);
  await client.login(process.env.DISCORD_TOKEN);
  console.log('Discord client logged in');
}
main().catch(err => { console.error(err); process.exit(1); });
