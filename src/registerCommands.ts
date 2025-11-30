import "dotenv/config";
import {
  REST,
  Routes,
  SlashCommandBuilder,
  ChannelType
} from "discord.js";
import { config, assertConfig } from "./config.js";

async function main() {
  assertConfig();

  const trade = new SlashCommandBuilder()
    .setName("trade")
    .setDescription("Create a BrainrotTradeBot listing")
    .addStringOption((opt) =>
      opt
        .setName("item")
        .setDescription("What brainrot are you trading?")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("price")
        .setDescription("Price or offer (e.g., 100 coins, Offer, Free)")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("condition")
        .setDescription("Condition")
        .addChoices(
          { name: "New", value: "New" },
          { name: "Good", value: "Good" },
          { name: "Used", value: "Used" },
          { name: "Mystery", value: "Mystery" }
        )
        .setRequired(false)
    )
    .addStringOption((opt) =>
      opt
        .setName("notes")
        .setDescription("Extra details")
        .setRequired(false)
    )
    .addStringOption((opt) =>
      opt
        .setName("image_url")
        .setDescription("Optional image URL")
        .setRequired(false)
    )
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription("Override default trade channel")
        .addChannelTypes(
          ChannelType.GuildText,
          ChannelType.GuildAnnouncement
        )
        .setRequired(false)
    );

  const commands = [trade.toJSON()];

  const rest = new REST({ version: "10" }).setToken(config.token);

  await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: commands }
  );

  console.log("Slash commands registered.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
