"use server"

import { auth } from "@clerk/nextjs/server";
import { getUserData } from "./userData";
import { db } from "./db";
import { journeyData, userData } from "./db/schema";
import { eq, inArray } from "drizzle-orm";
import { type Content, GoogleGenerativeAI } from "@google/generative-ai";
import { getCharacterData } from "./characterCreation";

function generateRandomString() {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 20; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

export async function createJourney(unparsedJourneyData: {question: string, answer: string}[], title: string) {
    const user = auth()
    if (user?.userId) {
        const journeyChatHistory = await createJourneyOpeningChatHistory(unparsedJourneyData)
            
        const journeyId = generateRandomString()

        await db.insert(journeyData).values({
            journeyId,
            journeyTitle: title,
            journeyData: journeyChatHistory
        })

        const userJourneyIdArray = (await db.select().from(userData).where(eq(userData.userId, user.userId)))[0]?.journeyIdArray as string[] ?? [] as string[]

        await db.update(userData).set({journeyIdArray: [...userJourneyIdArray, journeyId]}).where(eq(userData.userId, user.userId))

        return "success"
    }
}

export async function getJourney(journeyId: string) {
    const journey = await db.select().from(journeyData).where(eq(journeyData.journeyId, journeyId))
    return journey[0]
}

export async function getUsersJourneys() {
    const user = auth()
    if (user?.userId) {
        const userData = await getUserData()
        const journeyIds = userData?.journeyIdArray as string[]
        if (journeyIds) {
            const journeys = await db.select().from(journeyData).where(inArray(journeyData.journeyId, journeyIds))
            return journeys as {
                id: number;
                createdAt: Date;
                updatedAt: Date | null;
                journeyData: {role: string, parts: {text: string}[]}[];
                journeyId: string | null;
                journeyTitle: string | null;
              }[]
        }
    }
    return []
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY??"");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function createJourneyOpeningChatHistory(unparsedJourneyData: {question: string, answer: string}[], characterDescription?: string) {
    if (!characterDescription) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const characterData = await getCharacterData()
        if (characterData && characterData != "none") {
            characterDescription = characterData.details
        }
    }

    let parsedText = `You are an ai designed to to take in Q/A data based around a 'Journey' setting for an rpg game, and your job is to respond with an indepth description of this new land in a story way, ONLY RESPOND WITH THE DESCRIPTION, you will also be given the description of the player you can use this to personalize the ending of your opening to start off the session, CHARACTER DESCRIPTION: ${characterDescription} Q/A DATA: `
    for (const question of unparsedJourneyData) {
        parsedText += `(${question.question} -> ${question.answer})`
    }

    const response = await model.generateContent(parsedText)
    return [
        {
            role: "user",
            parts: [{text: parsedText}]
        },
        {
            role: "model",
            parts: [{text: response.response.text()}]
        }
    ]
}

export async function updateJourneyData(journeyId: string, newJourneyData: Content[]) {
    return await db.update(journeyData).set({ journeyData: newJourneyData }).where(eq(journeyData.journeyId, journeyId))
}