"use server"

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "./db";
import { characterData } from "./db/schema";
import { eq } from "drizzle-orm";
import parseItemData from "./itemCreation";
import { createUserData } from "./userData";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY??"");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function parseCharacterData(unparsedCharacterData: {question: string, answer: string}[]) {
    let parsedText = "You are an AI designed to take in Q/A data from a character creation from a game. you should respond with a stringified valid json in the format given, your job is to make sure all the blanks get filled in the data, its your job to balance check everything, the users answers are only recomendations for your choices, use your intuition, if there is something you need to fill that you dont have enough info for make a best educated guess. for a reference on balancing the stats a common human would have maxHealth of 100, and details is just like a description of the character, try and personalise it to the users answers, for the inventory you can put their unique items, clothing, spells etc, and put all characters to level one unless you have a good reason not to it is VERY IMPORTANT you keep to this structure: {name: string, race: string, stats: {level: number, health: number, maxHealth: number, mana: number, maxMana: number}, inventory: {title: string, lore: string}[], details: string} and generate valid stringified json for it to be later parsed, do not add any text or formatting other than the stringified JSON. Here is the Q/A data for you to use for your response: "
    for (const question of unparsedCharacterData) {
        parsedText += `(${question.question} -> ${question.answer})`
    }

    const geminiResponse = await model.generateContent(parsedText)
    const stringifiedData = geminiResponse.response.text();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(stringifiedData)
}

export async function createCharacterData(unparsedCharacterData: {question: string, answer: string}[]) {
    const user = auth()
    if (user?.userId) {
        const usersCharacterData = await parseCharacterData(unparsedCharacterData) as {name: string, race: string, stats: {level: number, health: number, maxHealth: number, mana: number, maxMana: number}, inventory: {title: string, lore: string}[], details: string}

        const characterInventory = []
        for (const inventoryItemData of usersCharacterData.inventory) {
            const parsedInventoryItemData = await parseItemData(inventoryItemData) as {title: string, type: string, lore: string, usage: string, rarity: string}

            characterInventory.push(parsedInventoryItemData)
        }

        usersCharacterData.inventory = characterInventory

        await db.insert(characterData).values({
            userId: user.userId,
            characterData: usersCharacterData,
        })

        await createUserData()

        return "finished"
    }
}

export async function getCharacterData() {
    const user = auth()
    if (user?.userId) {
        const userCharacterData = await db.select().from(characterData).where(eq(characterData.userId, user.userId))
        if (userCharacterData[0]) {
            return userCharacterData[0].characterData as {
                name: string;
                race: string;
                stats: {
                    level: number;
                    health: number;
                    maxHealth: number;
                    mana: number;
                    maxMana: number;
                };
                inventory: {
                    title: string, 
                    type: string,
                    lore: string,
                    usage: string,
                    rarity: string
                }[];
                details: string;
            }
        }
        return "none"
    }
    return "none"
}