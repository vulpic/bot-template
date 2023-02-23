import { Client, ClientEvents, Collection, REST, Routes } from "discord.js"

import fs from 'node:fs'
import path from 'node:path'
import { client } from "."
import { BotEvent, Command } from "./types/declarations"
import logger from "./util/logger"

export default async (client: Client) => {
  const token = process.env.TOKEN
  const appId = process.env.APP
  if (!token || !appId) {
    throw new Error("Missing token or app id in your .env file.")
  }

  buildEvents()
  client.commands = await buildCommands(token, appId)
}

function buildEvents() {
  const eventsPath = path.join(__dirname, 'events');
  const files = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts' || '.js'))

  for (const file of files) {
    const filePath = path.join(eventsPath, file)
    const event = require(filePath).default

    // Register the events to run.
    if (event.once) client.once(event.type, (...args) => event.run(...args))
    else client.on(event.type, (...args) => event.run(...args))
    logger.info(`Loaded event ${event.type} from ${file}.`)
  }
}

const buildCommands = async (token: string, appId: string) => {
  const commands: Collection<string, Command> = new Collection()
  const commandsJSON: any[] = []

  const commandsPath = path.join(__dirname, 'commands');
  const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts' || '.js'))

  for (const file of files) {
    const filePath = path.join(commandsPath, file)
    const command: Command = require(filePath).default

    commands.set(command.name, command)
    commandsJSON.push(command.builder.toJSON())
    logger.info(`Loaded command ${command.name} from ${file}.`)
  }

  const rest = new REST({ version: '10' }).setToken(token)
  await rest.put(
    Routes.applicationCommands(appId),
    { body: commandsJSON }
  ).then(() => {
    logger.info(`Successfully deployed commands.`)
  })
  return commands
}