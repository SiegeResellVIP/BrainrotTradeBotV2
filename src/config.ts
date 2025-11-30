export const config = {
  token: process.env.DISCORD_TOKEN ?? "",
  clientId: process.env.DISCORD_CLIENT_ID ?? "",
  guildId: process.env.DISCORD_GUILD_ID ?? "",
  tradeChannelId: process.env.TRADE_CHANNEL_ID ?? "",
  port: Number(process.env.PORT ?? 3000)
};

export function assertConfig() {
  const missing: string[] = [];
  if (!config.token) missing.push("DISCORD_TOKEN");
  if (!config.clientId) missing.push("DISCORD_CLIENT_ID");
  if (!config.guildId) missing.push("DISCORD_GUILD_ID");
  if (!config.tradeChannelId) missing.push("TRADE_CHANNEL_ID");
  if (missing.length) {
    throw new Error(
      "Missing required env vars: " + missing.join(", ")
    );
  }
}
