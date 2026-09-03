import 'dotenv/config'
import { createServer } from 'node:http'
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js'

const token = process.env.DISCORD_BOT_TOKEN
const guildId = process.env.DISCORD_GUILD_ID
const clientId = process.env.DISCORD_CLIENT_ID
const apiPort = Number(process.env.DISCORD_API_PORT || 3001)
const configuredTeamRoleId = process.env.DISCORD_TEAM_ROLE_ID

if (!token || !guildId || !clientId) {
  throw new Error('Missing DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, or DISCORD_CLIENT_ID in .env')
}

const commands = [
  new SlashCommandBuilder().setName('team').setDescription('Manage Team Solana Discord sync')
    .addSubcommandGroup(group => group.setName('member').setDescription('Manage team members')
      .addSubcommand(command => command.setName('scan').setDescription('Scan a Discord role for team members')
        .addRoleOption(option => option.setName('role').setDescription('The team role to scan').setRequired(true))))
    .addSubcommandGroup(group => group.setName('ally').setDescription('Manage allied members')
      .addSubcommand(command => command.setName('member').setDescription('Scan an ally Discord role')
        .addRoleOption(option => option.setName('role').setDescription('The ally role to scan').setRequired(true))))
    .addSubcommand(command => command.setName('server-scan').setDescription('Show Discord server member activity')),
].map(command => command.toJSON())

const rest = new REST({ version: '10' }).setToken(token)
await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences],
})

const syncState = { teamMembers: 0, teamOnline: 0, allyMembers: 0, serverMembers: 0, serverOnline: 0, roleName: '', teamRoleId: configuredTeamRoleId || '', lastScan: null, botOnline: false, members: [] }
const apiServer = createServer((request, response) => {
  if (request.url !== '/api/discord/stats') {
    response.writeHead(404)
    response.end('Not found')
    return
  }
  response.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  response.end(JSON.stringify(syncState))
})
apiServer.listen(apiPort, () => console.log(`Discord sync API listening on http://localhost:${apiPort}`))

const syncTeamRole = async (guild, roleId, refreshMembers = false) => {
  const role = guild.roles.cache.get(roleId)
  if (!role) throw new Error(`Team role ${roleId} was not found`)
  const members = refreshMembers ? await guild.members.fetch() : guild.members.cache
  const matchingMembers = members.filter(member => member.roles.cache.has(role.id))
  const onlineMembers = matchingMembers.filter(member => member.presence?.status && member.presence.status !== 'offline')
  syncState.teamMembers = matchingMembers.size
  syncState.teamOnline = onlineMembers.size
  syncState.roleName = role.name
  syncState.lastScan = new Date().toISOString()
  syncState.members = matchingMembers.map(member => ({ id: member.id, username: member.user.username, displayName: member.displayName, online: Boolean(member.presence?.status && member.presence.status !== 'offline') }))
}

const scanRole = async (interaction, label, syncTeam = true) => {
  const role = interaction.options.getRole('role', true)
  const guild = interaction.guild
  const members = await guild.members.fetch()
  const matchingMembers = members.filter(member => member.roles.cache.has(role.id))
  const onlineMembers = matchingMembers.filter(member => member.presence?.status && member.presence.status !== 'offline')
  if (syncTeam) {
    syncState.teamRoleId = role.id
    syncState.teamMembers = matchingMembers.size
    syncState.teamOnline = onlineMembers.size
    syncState.roleName = role.name
    syncState.lastScan = new Date().toISOString()
    syncState.members = matchingMembers.map(member => ({ id: member.id, username: member.user.username, displayName: member.displayName, online: Boolean(member.presence?.status && member.presence.status !== 'offline') }))
  }

  await interaction.reply({
    content: `${label}\nRole: **${role.name}**\nMembers: **${matchingMembers.size}**\nOnline: **${onlineMembers.size}**`,
    ephemeral: false,
  })
}

client.once('ready', () => {
  syncState.botOnline = true
  console.log(`Discord bot online as ${client.user.tag}`)
  let firstScan = true
  const autoScan = async () => {
    if (!syncState.teamRoleId) {
      console.log('Automatic team scan is waiting for DISCORD_TEAM_ROLE_ID or /team member scan.')
      return
    }
    try {
      const refreshMembers = firstScan
      firstScan = false
      await syncTeamRole(client.guilds.cache.get(guildId), syncState.teamRoleId, refreshMembers)
      console.log(`Automatic team scan: ${syncState.teamMembers} members in ${syncState.roleName}`)
    } catch (error) {
      console.error(`Automatic team scan failed: ${error.message}`)
    }
  }
  autoScan()
  setInterval(autoScan, 5000)
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return

  try {
    if (interaction.commandName === 'team' && interaction.options.getSubcommandGroup() === 'member' && interaction.options.getSubcommand() === 'scan') {
      await scanRole(interaction, 'Team member scan complete.')
    } else if (interaction.commandName === 'team' && interaction.options.getSubcommandGroup() === 'ally') {
      await scanRole(interaction, 'Ally member scan complete.', false)
      const role = interaction.options.getRole('role', true)
      const members = await interaction.guild.members.fetch()
      syncState.allyMembers = members.filter(member => member.roles.cache.has(role.id)).size
    } else if (interaction.commandName === 'team' && interaction.options.getSubcommand() === 'server-scan') {
      const members = await interaction.guild.members.fetch()
      const onlineMembers = members.filter(member => member.presence?.status && member.presence.status !== 'offline')
      syncState.serverMembers = members.size
      syncState.serverOnline = onlineMembers.size
      syncState.lastScan = new Date().toISOString()
      await interaction.reply(`Server scan complete. Total members: **${members.size}**. Online now: **${onlineMembers.size}**.`)
    }
  } catch (error) {
    console.error(error)
    const detail = error instanceof Error ? error.message : String(error)
    const message = `The scan failed: ${detail}. Check the bot role permissions and Server Members/Presence intents.`
    if (interaction.replied || interaction.deferred) await interaction.followUp({ content: message, ephemeral: true })
    else await interaction.reply({ content: message, ephemeral: true })
  }
})

await client.login(token)
