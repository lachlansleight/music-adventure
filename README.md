# Music Adventure

A GPT-4 powered music recommendation and exploration engine. This is a temporary readme to get you up and running.

## Installation

-  `git clone https://github.com/lachlansleight/music-adventure` to clone the repo
-  `touch .env` to create a .env file
-  `npm i` to install dependencies
-  `npm run dev` to run the dev server at `https://localhost:3000`

The .env file should look like this:

```
OPENAI_KEY = "your-open-ai-key"
DISCOGS_KEY = "your-discogs-key"
DISCOGS_SECRET = "your-discogs-secret"
```

Note that you'll need to create a discogs account and create an app to get the key and secret. These are used to get album art.
