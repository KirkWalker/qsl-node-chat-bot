import { OpenAI }  from "openai";
import { config } from "dotenv";
import helper from './helper.js';
config();
import {LocalStorage} from 'node-localstorage' 
var localStorage = new LocalStorage('./session'); 

const debug_level = 1

const openai = new OpenAI({
    apiKey: process.env.API_KEY,
});


const getTime = helper.getTime
const getLocation = helper.getLocation
const getCurrentWeather = helper.getCurrentWeather

const availableTools = {
    getLocation,
    getCurrentWeather,
    getTime,
};

//I dont' think this is needed
//const assistant = await openai.beta.assistants.retrieve(process.env.ASSISTANT_ID);
//if(debug_level < 1) console.log(assistant);

async function getThread(){
    if(!localStorage.getItem('thread_id')){
        const thread = await openai.beta.threads.create();
        localStorage.setItem('thread_id', thread.id)
        if(debug_level < 2) console.log("thread created",thread.id);
        return thread.id
    } else {
        const thread = await openai.beta.threads.retrieve(localStorage.getItem('thread_id'));
        if(debug_level < 2) console.log("thread loaded",thread.id);
        return thread.id
    }
}

async function newRun(userName,threadID){
    return await openai.beta.threads.runs.create(threadID,
    {
        assistant_id: process.env.ASSISTANT_ID,
        instructions: "Please address the user as " + userName
    });
}


async function agent(userInput,userName) {

    const threadID = await getThread();
    let runID = localStorage.getItem('run_id');//temp until db added

    if(!runID){
        const message = await openai.beta.threads.messages.create(threadID, 
        {
                role:"user",
                content:userInput
        });
    
        const run = await newRun(userName,threadID);
        runID = run.id;
        localStorage.setItem('run_id', runID);
        if(debug_level < 2) console.log("run created", runID);
    }

    let tool_outputs = []
    let loading = true;
    try{
        let run_status = await openai.beta.threads.runs.retrieve(threadID,runID)
    } catch(err){
        //run might have failed, start a new one
        const newrun = await newRun(userName,threadID);
        runID = newrun.id;
        localStorage.setItem('run_id', runID);//temp until db added
        if(debug_level < 2) console.log("newrun created", runID);
    }
    

    while(loading) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const run_status = await openai.beta.threads.runs.retrieve(threadID,runID);
        if(run_status.status === "completed"){
            if(debug_level > 2) console.log("run loaded", run_status.id);
            const mes = await openai.beta.threads.messages.list(threadID)
            localStorage.setItem('run_id', ""); //temp until db added
            return mes.body.data[0].content;
            loading = false;
        } else if(run_status.status === "requires_action"){
    
            if(debug_level < 1) console.log("Function Calling: ",run_status.status);
            const toolCalls = run_status.required_action.submit_tool_outputs.tool_calls;

            let fetching = true
            let i =0;
            while(fetching) {
                const toolCall = toolCalls[i];
                const id = toolCall.id;
                const functionArgs = JSON.parse(toolCall.function.arguments);
                const functionArgsArr = Object.values(functionArgs);
                if(debug_level < 1) console.log("toolCall:",toolCall)
                if(debug_level < 1) console.log("id:",id)

                await eval(`${toolCall.function.name}(${functionArgsArr})`)
                .then(async (res) => {
                    if(debug_level < 2) console.log("Function result: ",res);
                    const value = `${JSON.stringify(res)}`;
                    
                    const tool_outputs_temp = [{ tool_call_id: id, output: value }]; //pass single output
                    tool_outputs.push({ tool_call_id: id, output: value })

                    //this fails sometimes. It ocasionally chains 2 outputs together, other times it processes the sequentially.
                    //add a try catch, if the first one fails run the batch attempt
                    try {
                        const submit_tool_outputs = await openai.beta.threads.runs.submitToolOutputs(threadID, runID, {
                            tool_outputs_temp,
                        });
                        if(debug_level < 2) console.log(tool_outputs_temp);
                        if(debug_level < 3) console.log('\x1b[33m%s\x1b[0m',"submit_tool_outputs_temp: "+submit_tool_outputs.status) 
                    } catch (err) {
                        if(debug_level < 2) console.error(tool_outputs);

                        //if this breaks we need to kill the run and get the user to ask again
                        try{
                            const submit_tool_outputs = await openai.beta.threads.runs.submitToolOutputs(threadID, runID, 
                                {tool_outputs},
                            );
                            if(debug_level < 3) console.log('\x1b[33m%s\x1b[0m',"submit_tool_outputs: "+submit_tool_outputs.status) 
                        } catch(err) {
                            console.error('\x1b[31m%s\x1b[0m',"Missmatched tool calls, dropping run");
                            console.error('\x1b[31m%s\x1b[0m',err)
                            await openai.beta.threads.runs.cancel(threadID, runID);
                            fetching = false;
                        }
                        
                    }
                    
                    if(i === toolCalls.length-1) {
                        fetching = false;
                    } else {
                        i++
                    }
                });
            }

        } else if(run_status.status === "expired" || run_status.status === "failed" || run_status.status === "cancelled"){
            console.error("run stopped: ",run_status.status);
            localStorage.setItem('run_id', ""); //temp until db added
            return [{text:{value:"Something has gone wrong, can you please ask your question again"}}]
        } else {
            console.log('\x1b[33m%s\x1b[0m',"Waiting for the Assistant to process... "+run_status.status);
        }
    
    }
    
}


const getMessages = async function() {
    const threadID = await getThread();
    const mes = await openai.beta.threads.messages.list(threadID)
    return mes
}
export default { agent, getMessages }