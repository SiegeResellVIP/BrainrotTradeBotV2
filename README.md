BrainrotTradeBot

Setup
1) Create a Discord application + bot, add to server with bot + applications.commands scopes.
2) Copy .env.example to .env and fill:
   DISCORD_TOKEN=...
   DISCORD_CLIENT_ID=...
   DISCORD_GUILD_ID=...
   TRADE_CHANNEL_ID=...
3) Register commands:
   npm install
   npm run build
   npm run register
4) Run locally:
   npm run dev
5) Deploy to Koyeb with Docker.

Slash command
/trade item:"..." price:"..." condition:Good notes:"..." image_url:"..." channel:#trades
