import { SlashCommandBuilder } from "discord.js";
import { Command } from "../types/declarations";

const data: Command = {
  name: "ping",
  description: "Get the bots latency.",
  usage: "/ping",

  run: async (i) => {
    const ping = Date.now() - i.createdTimestamp;
    i.reply({
      content: `:ping_pong: Pong! \n Bot Latency: \`${ping}ms\``,
    });
  },
  builder: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Get the bots latency."),
};

export default data;
