# Chatbot openAI
## A simple openAI implementation complete with html/css gui.

This bot currently handles 3 custom  functions. getTime(), getLocation() and getWeather(). Good things to test! I typically run a chat similar to :

```
user: Hello

user: What time is it

user: where am I?

user: what is the temp here

user: what is the temp in Edmonton

user: what is the temp in van

user: good bye
```

Each question get sequntially harder and calls more functions, this is typically where it can break on ocassion (although increasingly rare) and needs to be improved. The openAI system itself can fail even when the functions succeed, some of which is likely due to the fact the components used are beta and the network is not always stable.

### Instalation instructions

Begin by installing the local dependencies:
```
npm install
```

API keys are currently comming from my account so you'll need to get me to pass them too you. You must create a .env file in the root folder and add values for the following:
```
API_KEY=ask_kirk
PORT=3500
ASSISTANT_ID=ask_kirk
```

There is currently a name and img set for both the bot and the user on the top of ./public/index.js to overide the names and images used it the html chat window. The bot will address the user by this name.
```
const BOT_IMG = "https://img.icons8.com/?size=77&id=AiI2Vzcqt9Op&format=png";
const PERSON_IMG = "https://img.icons8.com/?size=77&id=iBnwfeZ6ioYp&format=png";
const BOT_NAME = "QuakerBot";
const PERSON_NAME = "Kirk";
```

With the .env created, run a local instance of the node.js backend:
```
npm run dev
```

This starts a local http server you can open at: http://localhost:3500/. Additionally you can chat on the same thread in the terminal window without opening a browser window.

### Troubleshooting

Sometimes things happen, and the bot can get stuck on a thread (please tell me about this and record any errors). To revoer from a stuck thred, locate the run_id and thread_id files in ./session/run_id and ./session/thread_id. Deleted the id's in each file and save. Restart the app and it should start fresh again.
