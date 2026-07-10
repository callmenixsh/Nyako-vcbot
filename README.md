# <img align="right" src="https://github.com/callmenixsh/Nyako-vcbot/blob/main/assets/Nyako-avatar.gif" width="120"  /> Nyako
A Discord bot built for voice related timed actions, and fun command-based features.\
It supports both **prefix commands** and **slash commands**
 <br clear="right" /> 


## Features

- Voice moderation for one user or the whole voice channel.
- Timed actions with cancel buttons.
- AFK keepalive mode.
- Minigames - `hotpotato`, `roulette`, `court`
- Many more `fun` commands
- Clean `help` menu

## Command Categories
>Fun Commands\
`iq`, `judge`, `sacrifice`, `sus`, `sleep`
>
>Voice Commands\
`vc user`, `vc all`, `vc afk`
>
>Minigame Commands\
`roulette`, `hotpotato`, `court`
>
>Utility Commands\
`timer`, `remind`, `clip`\
<sub>run `/help` for more...</sub>

<!--
## Highlighted Feature
### 1 `/vc user` & `/vc all`
Affect one user or everyone in voice.\
Options:
- `action`: `disconnect`, `deafen`, `undeafen`, `mute`, `unmute`
- `target`(if user): the user to affect
- `time`: optional delay like `30s`, `2m`, `1m30s`
### 2 `/vc afk`
Options:
- `mode`: `On` or `Off`
-->

# Installation & Requirements
- Node.js 18+
- Discord bot token
- Message content intent if using prefix commands
- Voice permissions in the server

## Setup

```bash
git clone https://github.com/callmenixsh/nyako.git
cd nyako
npm install
```

Create a `.env` file:

```env
DISCORD_TOKEN=your_token_here
OWNER_ID=your_id_here
CLIENT_ID=your_client_id_here
```

Start the bot:

```bash
node .
```

>[!NOTE]
>- Timed actions use buttons so they can be cancelled before execution.
>- Keepalive mode is intended to keep the bot in VC.
>- Some features depend on the correct Discord permissions being enabled.
