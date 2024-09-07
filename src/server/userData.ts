"use server"

import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { userData } from "./db/schema";
import { eq } from "drizzle-orm";

export async function createUserData() {
    const user = auth()
    if (user?.userId) {
        await db.insert(userData).values({
            userId: user.userId,
            journeyIdArray: []
        })
    }
}

export async function getUserData(passedUserId?: string) {
    const user = auth()
    const userId = passedUserId ?? user?.userId
    if (userId) {
        return (await db.select().from(userData).where(eq(userData.userId, userId)))[0]
    }
}