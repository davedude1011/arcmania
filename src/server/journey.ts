"use server"

import { auth } from "@clerk/nextjs/server";
import { type Content, GoogleGenerativeAI } from "@google/generative-ai";
import { getJourney, updateJourneyData } from "./journeyCreation";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY??"");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function getResponse(input: string, journeyId: string, history: Content[]) {
    const user = auth()
    if (user?.userId) {
        if (!history) {
            const journeyData = await getJourney(journeyId)
            history = journeyData?.journeyData as Content[]
        }

        input += '. EVERYTHING AFTER THIS IS AN AUTOMATED MESSAGE FROM THE SERVER NOT PART OF THE GAME: functions you can use: /create-item {title: string, lore: string, amount: number}[] example usage: /create-item [{title: "iron sword", lore: "a simple blad forged by shop owner", amount: 1}, {title: "gold", lore: "used as currency", amount: 90}] PUT ALL OBTAINED ITEMS INTO ONE /creat-item COMMAND ARRAY AND ONLY USE THIS COMMAND IF THE USER EXPLICITLY ASKS TO TAKE AN ITEM, OR IF THE USER LEARNS A NEW SKILL/MAGIC'
        
        const chat = model.startChat({ history })
        const result = await chat.sendMessage(input)

        const newHistory = await chat.getHistory()
        await updateJourneyData(journeyId, newHistory)

        return {
            history: newHistory,
            functions: extractTextualFunctions(result.response.text())
        }
    }
}

function convertToValidJson(input: string) {
    // Replace single quotes with double quotes
    let jsonString = input.replace(/'/g, '"');
    
    // Add double quotes around keys
    jsonString = jsonString.replace(/([{\[,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
    
    // Handle any remaining issues (e.g., trailing commas)
    jsonString = jsonString.replace(/,\s*([\]}])/g, '$1');
    
    return jsonString;
  }

function extractTextualFunctions(input: string) {
    let createItemData = [] as {title: string, lore: string, amount: number}[]
    const createItemRegex = /\/create-item\s*(\[.*?\])/
    const createItemMatch = createItemRegex.exec(input)

    if (createItemMatch) {
        console.log(createItemMatch[0].replace("/create-item ", ""))
        createItemData = JSON.parse(convertToValidJson(createItemMatch[0].replace("/create-item ", ""))) as {title: string, lore: string, amount: number}[]
    }

    return {
        createItemData
    }
}