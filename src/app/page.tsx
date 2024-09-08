"use client"

import { useEffect, useState } from "react"
import { getCharacterData } from "~/server/characterCreation"
import Link from "next/link"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import InventoryElement from "./components/inventory"
import { getUsersJourneys } from "~/server/journeyCreation"
import { LuInfo } from "react-icons/lu"
import { journeyData } from "~/server/db/schema"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()

  const [characterData, setCharacterData] = useState(null as null|"none"|{name: string, race: string, stats: {level: number, health: number, maxHealth: number, mana: number, maxMana: number}, inventory: {title: string, type: string, lore: string, usage: string, rarity: string}[], details: string})
  useEffect(() => {
    getCharacterData()
      .then((response) => setCharacterData(response))
      .catch((error) => console.log(error))
  }, [])

  const [usersJourneys, setUsersJourneys] = useState([] as {
    id: number;
    createdAt: Date;
    updatedAt: Date | null;
    journeyData: {role: string, parts: {text: string}[]}[];
    journeyId: string | null;
    journeyTitle: string | null;
  }[])
  useEffect(() => {
    getUsersJourneys()
     .then((response) => setUsersJourneys(response))
     .catch((error) => console.log(error))
  }, [])

  const [selectedInfoJourney, setSelectedInfoJourney] = useState({} as {
    id: number;
    createdAt: Date;
    updatedAt: Date | null;
    journeyData: {role: string, parts: {text: string}[]}[];
    journeyId: string | null;
    journeyTitle: string | null;
  })

  return (
    <div className="w-screen h-screen text-white md:p-12 p-4 bg-bgMain overflow-y-auto">
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
      {
          characterData == "none" &&
          <Link href={"/character-creation"} className="border p-2 rounded-md px-4 hover:shadow-md transition-all">
          Character Creation
          </Link>
      }
      {
          (characterData && characterData != "none") && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-row items-center gap-6">
                <UserButton></UserButton>
                <div className="flex flex-grow flex-col">
                  <div className="text-3xl font-bold">{characterData.name}</div>
                  <div className="text-xl font-thin">lvl.{characterData.stats.level} {characterData.race}</div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex flex-col gap-2 flex-grow md:w-1/3 md:p-12 p-4 border rounded-md">
                  <div className="text-2xl">Character Stats</div>
                  <div className="flex flex-col gap-0">
                    <div className="flex flex-row justify-between gap-6">
                      <div>Health</div>
                      <div>{characterData.stats.health} / {characterData.stats.maxHealth}</div>
                    </div>
                    <progress value={characterData.stats.health/characterData.stats.maxHealth} />
                  </div>
                  <div className="flex flex-col gap-0">
                    <div className="flex flex-row justify-between gap-6">
                      <div>Mana</div>
                      <div>{characterData.stats.mana} / {characterData.stats.maxMana}</div>
                    </div>
                    <progress value={characterData.stats.mana/characterData.stats.maxMana} />
                  </div>
                </div>
                <div className="flex flex-col w-fit md:p-12 p-4 gap-2 border rounded-md">
                  <div className="text-2xl w-fit">Character Details</div>
                  <div className="font-thin max-w-2xl">
                    {characterData.details}
                  </div>
                </div>
              </div>
              <InventoryElement inventoryData={characterData.inventory} />
              <div className="flex flex-col gap-6 border rounded-md md:p-12 p-4">
                <div className="flex flex-row justify-between gap-4 items-end">
                  <div className="text-2xl">Journeys</div>
                  <Link className="p-2 px-4 border rounded-md opacity-50 hover:opacity-100 transition-all" href={"/journey-creation"}>Create a Journey</Link>
                </div>
                {
                  (selectedInfoJourney?.journeyData?.[1]?.parts[0]?.text) && (
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row gap-2 items-center">
                        <div className="text-2xl">{selectedInfoJourney?.journeyTitle}</div>
                        <div className="text-sm font-thin opacity-50">( {selectedInfoJourney?.createdAt.toLocaleString()} )</div>
                        <div className="text-sm font-thin opacity-50">( {selectedInfoJourney?.journeyId} )</div>
                      </div>
                      <div className="font-thin">{selectedInfoJourney.journeyData.find((journeyChatHistory) => journeyChatHistory.role == "model")?.parts[0]?.text}</div>
                    </div>
                  )
                }
                <div className="flex flex-wrap gap-4">
                  {
                    usersJourneys.map((journey) => (
                      <button className="p-2 border rounded-md opacity-50 hover:opacity-100 flex-grow justify-between flex flex-row transition-all" onClick={() => {
                        router.push("/journey?journeyId=" + journey.journeyId)
                      }} key={journey.journeyId}>
                        <button className="opacity-50 hover:opacity-100 transition-all" onClick={(e) => {
                          e.stopPropagation()
                          setSelectedInfoJourney(journey)
                        }}><LuInfo /></button>
                        <div className="flex flex-grow justify-center">
                          {journey.journeyTitle}
                        </div>
                      </button>
                    ))
                  }
                </div>
              </div>
            </div>
          )
      }
      </SignedIn>
    </div>
  )
}