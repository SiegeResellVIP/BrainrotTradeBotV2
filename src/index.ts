import "dotenv/config";
import express from "express";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  TextChannel
} from "discord.js";
import { config, assertConfig } from "./config.js";

assertConfig();

const app = express();
app.get("/", (_req, res) => res.send("BrainrotTradeBot OK"));
app.listen(config.port, () =>
  console.log(`Health on :${config.port}`)
);

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "trade") return;

  const item = interaction.options.getString("item", true);
  const price = interaction.options.getString("price", true);
  const condition =
    interaction.options.getString("condition") ?? "Unspecified";
  const notes = interaction.options.getString("notes") ?? "—";
  const imageUrl = interaction.options.getString("image_url") ?? undefined;
  const channelOverride =
    interaction.options.getChannel("channel") ?? null;

  // Find target channel
  const channel =
    (channelOverride &&
      channelOverride.type !== ChannelType.GuildText &&
      channelOverride.type !== ChannelType.GuildAnnouncement
      ? null
      : (channelOverride as TextChannel | null)) ??
    (await interaction.guild?.channels.fetch(config.tradeChannelId)) ??
    null;

  if (!channel || channel.type === ChannelType.GuildVoice) {
    await interaction.reply({
      content:
        "Could not find a valid trade channel. Check TRADE_CHANNEL_ID or the provided channel.",
      ephemeral: true
    });
    return;
  }

  const sellerTag = `${interaction.user.username}`;
  const sellerId = interaction.user.id;

  const embed = new EmbedBuilder()
    .setTitle("New Brainrot Trade Listing")
    .setColor(0x9b59b6)
    .addFields(
      { name: "Item", value: item, inline: true },
      { name: "Price", value: price, inline: true },
      { name: "Condition", value: condition, inline: true },
      { name: "Seller", value: `<@${sellerId}>`, inline: true },
      { name: "Notes", value: notes, inline: false }
    )
    .setTimestamp(new Date());

  if (imageUrl) embed.setImage(imageUrl);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("Contact Seller")
      .setStyle(ButtonStyle.Primary)
      .setCustomId(`contact:${sellerId}`)
  );

  const msg = await (channel as TextChannel).send({
    embeds: [embed],
    components: [row]
  });

  await interaction.reply({
    content: `Listing posted in <#${channel.id}>: ${msg.url}`,
    ephemeral: true
  });
});

// Button handler to open a DM with the seller
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  const [action, sellerId] = interaction.customId.split(":");
  if (action !== "contact") return;

  // Try to open a DM draft to seller by tagging both in a reply
  // Alternative: create a thread in the listing channel
  try {
    await interaction.reply({
      content: `Starting a chat: <@${interaction.user.id}> ➜ <@${sellerId}>`,
      ephemeral: true
    });

    // Create a thread under the listing message if possible
    const msg = await interaction.message.fetch();
    if (msg.channel.isTextBased() && msg.hasThread === false) {
      const thread = await msg.startThread({
        name: `Trade chat with ${interaction.user.username}`,
        autoArchiveDuration: 1440
      });
      await thread.send(
        `Introductions: <@${interaction.user.id}> ↔ <@${sellerId}>`
      );
    }
  } catch (e) {
    console.error(e);
  }
});

client.login(config.token);
