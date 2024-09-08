"use client"

import type { Content } from "@google/generative-ai"
import { useEffect, useState } from "react"
import { getResponse } from "~/server/journey";
import { getJourney } from "~/server/journeyCreation"
import TaggableInput from "../components/taggableInput";
import { getCharacterData } from "~/server/characterCreation";
import parseItemData, { addItemToCharacterInventory } from "~/server/itemCreation";

export default function Page() {
    const params = new URLSearchParams(window.location.search);
    const journeyId = params.get('journeyId') ?? ""

    const [localHistory, setLocalHistory] = useState([] as Content[])
    const [journeyTitle, setJourneyTitle] = useState("")
    useEffect(() => {
        getJourney(journeyId)
            .then((response) => {
                setLocalHistory(response?.journeyData as Content[])
                setJourneyTitle(response?.journeyTitle ?? "")
            })
            .catch((error) => console.log(error))
    }, [])

    const [characterData, setCharacterData] = useState(null as null|{name: string, race: string, stats: {level: number, health: number, maxHealth: number, mana: number, maxMana: number}, inventory: {title: string, type: string, lore: string, usage: string, rarity: string}[], details: string})
    function updateCharacterData() {
        getCharacterData()
          .then((response) => {
              if (response && response != "none") {
                  setCharacterData(response)
              }
          })
          .catch((error) => console.log(error))
    }
    useEffect(() => {
        updateCharacterData()
    }, [])
    return (
        <div className="w-screen h-screen text-white p-12 bg-bgMain flex flex-col">
            <div className="flex flex-col gap-12 flex-grow overflow-y-auto">
                <div className="text-4xl font-bold">{journeyTitle}</div>
                {
                    localHistory?.filter((_, index) => index != 0).map((chatComponent, index) => (
                        <div key={index} className={`flex ${chatComponent.role == "user" ? "justify-end text-end" : "justify-start text-start"} font-thin`}>
                            <div>{chatComponent.parts[0]?.text}</div>
                        </div>
                    ))
                }
            </div>
            <div className="flex flex-row">
                <TaggableInput inventoryData={characterData?.inventory ?? []} submitFunction={(input: string) => {
                    getResponse(input, journeyId, localHistory)
                    .then((response) => {
                        if (response) {
                            setLocalHistory(response.history)
                            response.functions.createItemData.forEach((itemData, itemIndex) => {
                                for (let i = 0; i < itemData.amount; i++) {
                                    parseItemData(itemData)
                                        .then((itemDataResponse) => {
                                            addItemToCharacterInventory(itemDataResponse)
                                                .then((_) => {
                                                    updateCharacterData()
                                                })
                                                .catch((error) => console.log(error))
                                        })
                                        .catch((error) => console.log(error))
                                }
                            })
                        }
                    })
                    .catch((error) => console.log(error))
                }} />
            </div>
        </div>
    )
}