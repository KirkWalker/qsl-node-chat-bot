import { OpenAI }  from "openai";
import { config } from "dotenv";
import readline from "readline";
config();

const openai = new OpenAI({
    apiKey: process.env.API_KEY,
});

const userInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

async function getLocation() {
    const response = await fetch("https://ipapi.co/json/");
    const locationData = await response.json();
    return locationData;
}

async function getCurrentWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=apparent_temperature`;
  const response = await fetch(url);
  const weatherData = await response.json();
  return weatherData;
}

const tools = [
  {
    type: "function",
    function: {
      name: "getCurrentWeather",
      description: "Get the current weather in a given location",
      parameters: {
        type: "object",
        properties: {
          latitude: {
            type: "string",
          },
          longitude: {
            type: "string",
          },
        },
        required: ["longitude", "latitude"],
      },
    }
  },
  {
    type: "function",
    function: {
      name: "getLocation",
      description: "Get the user's location based on their IP address",
      parameters: {
        type: "object",
        properties: {},
      },
    }
  },
];


const availableTools = {
  getLocation,
  getCurrentWeather,
};


let messages = [
  {
    role: "system",
    content:
      "You are a helpful assistant. Only use the functions you have been provided with.",
  },
];


userInterface.prompt()
userInterface.on("line", async input => {

    const response = await agent(input);
    console.log(response);

    messages = [
      {
        role: "system",
        content:
          "You are a helpful assistant. Only use the functions you have been provided with.",
      },
    ];
    userInterface.prompt();
})


async function agent(userInput) {
    messages.push({
      role: "user",
      content: userInput,
    });


    for (let i = 0; i < 5; i++) {

        try {

          const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: messages,
          tools: tools,
          });

          const { finish_reason, message } = response.choices[0];
          if (finish_reason === "tool_calls" && message.tool_calls) {
              const functionName = message.tool_calls[0].function.name;
              const functionToCall = availableTools[functionName];
              const functionArgs = JSON.parse(message.tool_calls[0].function.arguments);
              const functionArgsArr = Object.values(functionArgs);
              const functionResponse = await functionToCall.apply(null, functionArgsArr);
              
              messages.push({
                  role: "function",
                  name: functionName,
                  content: `
                      The result of the last function was this: ${JSON.stringify(
                        functionResponse
                      )}
                      `,
              });

          } else if (finish_reason === "stop") {
              messages.push(message);
              return message.content;
          }
        } catch (err) {
          console.error(err)
        }

    }
    return "The maximum number of iterations has been met without a suitable answer. Please try again with a more specific input.";
}