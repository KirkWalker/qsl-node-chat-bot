import { OpenAI }  from "openai";
import { config } from "dotenv";
import helper from './helper.js';
import { readFile } from 'fs/promises';
config();
import {LocalStorage} from 'node-localstorage' 
var localStorage = new LocalStorage('./session'); 

//const PERSON_NAME = "BloodBag";

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

const assistant = await openai.beta.assistants.retrieve(process.env.ASSISTANT_ID);
//console.log(assistant);

async function getThread(){
    if(!localStorage.getItem('thread_id')){
        const thread = await openai.beta.threads.create();
        localStorage.setItem('thread_id', thread.id)
        //console.log("thread created",thread.id);
    } else {
        const thread = await openai.beta.threads.retrieve(localStorage.getItem('thread_id'));
        //console.log(thread);
        console.log("thread loaded",thread.id);
    }
}

async function newRun(userName){
    return await openai.beta.threads.runs.create(localStorage.getItem('thread_id'),
    {
        assistant_id: process.env.ASSISTANT_ID,
        instructions: "Please address the user as " + userName
    });
}


async function agent(userInput,userName) {

    await getThread();

    if(!localStorage.getItem('run_id')){
        const message = await openai.beta.threads.messages.create( localStorage.getItem('thread_id'), 
        {
                role:"user",
                content:userInput
        });
    
        const run = await newRun(userName);
    
        localStorage.setItem('run_id', run.id);
        console.log("run created", run);
    }

    let tool_outputs = []
    let loading = true;
    try{
        let run_status = await openai.beta.threads.runs.retrieve(localStorage.getItem('thread_id'),localStorage.getItem('run_id'))
    } catch(err){
        //run might have failed, start a new one
        const newrun = await newRun(userName);
    
        localStorage.setItem('run_id', newrun.id);
        console.log("run created", newrun.id);
    }
    

    while(loading) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const run_status = await openai.beta.threads.runs.retrieve(localStorage.getItem('thread_id'),localStorage.getItem('run_id'));
        if(run_status.status === "completed"){
            console.log("run loaded", run_status.id);
            const mes = await openai.beta.threads.messages.list(localStorage.getItem('thread_id'))
            localStorage.setItem('run_id', "");
            return mes.body.data[0].content;
            loading = false;
        } else if(run_status.status === "requires_action"){
    
            console.log("Function Calling: ",run_status.status);
            const toolCalls = run_status.required_action.submit_tool_outputs.tool_calls;


            let fetching = true
            let i =0;
            while(fetching) {
                const toolCall = toolCalls[i];
                const id = toolCall.id;
                const functionArgs = JSON.parse(toolCall.function.arguments);
                const functionArgsArr = Object.values(functionArgs);
                // console.log("toolCalls:",run_status.required_action.submit_tool_outputs.tool_calls)
                console.log("toolCall:",toolCall)
                console.log("id:",id)

                await eval(`${toolCall.function.name}(${functionArgsArr})`)
                .then(async (res) => {
                    console.log("Function result: ",res);
                    const value = JSON.stringify(res)
                    
                    tool_outputs = [{ tool_call_id: id, output: value }];
                    const submit_tool_outputs = await openai.beta.threads.runs.submitToolOutputs(localStorage.getItem('thread_id'), localStorage.getItem('run_id'), {
                        tool_outputs,
                    });
                    console.log("submit_tool_outputs:",submit_tool_outputs.status) 
                    if(i === toolCalls.length-1) {
                        fetching = false;
                    } else {
                        i++
                    }
                });
            }

    
            //console.log("tool_outputs final:",tool_outputs)
            
            
            //const toolCall = run_status.required_action.submit_tool_outputs.tool_calls[0];  

    
        } else if(run_status.status === "expired" || run_status.status === "failed"){
            console.log("run stopped: ",run_status.status);
            localStorage.setItem('run_id', "");
            return [{text:{value:"Something has gone wrong, can you please ask your question again"}}]
            loading = false;
        } else {
            console.log("Waiting for the Assistant to process...",run_status.status);
        }
    
    }
    
}


const getMessages = async function() {
    const mes = await openai.beta.threads.messages.list(localStorage.getItem('thread_id'))
    return mes
}
export default { agent, getMessages }