# Chatbot openAI
## A simple openAI implementation complete with html/css gui.

This bot currently handles 3 custom  functions. getTime(), getLocation and getWeather. Good  things to test. I typically run a chat similar to :

```
user: Hello

user: What time is it

user: where am I?

user: what is the temp here

user: what is the temp in Edmonton

user: what is the temp in van

user: good bye
```

Each question get sequntially harder and calls more functions, this is typically where it can break on ocassion (although increasingly rare) and needs to be improved. The openAI system itself can fail even when the functions succedd, some of which is likely due to the fact the components used are beta and the network is not always stable.

### Instalation instrunctions

Begin by installing the local dependencies:
```
npm install
```

Then run a local instance of the node.js backend:
```
npm run dev
```

There is currently a name and img set for both the bot and the user on the top of ./public/index.js to overide the names and images used it the html chat window. The bot will address the user by this name.


### Troubleshooting

Sometimes things happen, and the bot can get stuck on a thred (please tell me about this and record any errors). To revoer from a stuck thred, locate the run_id and thread_id files in ./session/run_id and ./session/thread_id. Deleted the id's in each file and save. Restart the app and it should start fresh again.
