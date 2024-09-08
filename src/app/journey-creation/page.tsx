"use client"

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { useRouter } from "next/navigation";
import { useState } from "react"
import { createJourney } from "~/server/journeyCreation";

export default function Page() {
    const router = useRouter();

    const [journeyCreationData, setJourneyCreationData] = useState([
        {
          "question": "What is the general setting or theme of the world? (e.g., fantasy, futuristic, post-apocalyptic)",
          "answer": ""
        },
        {
          "question": "Describe the primary environment or geography of the world. (e.g., sprawling deserts, dense jungles, high-tech urban centers)",
          "answer": ""
        },
        {
          "question": "What is the level of technology or magic in this world? (e.g., advanced technology, ancient magic, a blend of both)",
          "answer": ""
        },
        {
          "question": "Are there any major factions or political entities in this world? (e.g., empires, guilds, tribes)",
          "answer": ""
        },
        {
          "question": "What is the name of this new world?",
          "answer": ""
        },
        {
          "question": "Add any additional details or unique aspects of this world that might be relevant. (e.g., special customs, hidden threats, unusual resources)",
          "answer": ""
        }
      ])
    const [questionIndex, setQuestionIndex] = useState(0)
    
    function setAnswer(answer: string) {
        const tempCharacterCreationData = [...journeyCreationData]
        if (tempCharacterCreationData[questionIndex]) {
            tempCharacterCreationData[questionIndex].answer = answer
            setJourneyCreationData(tempCharacterCreationData)
        }
    }

    const [isLoading, setIsLoading] = useState(false)

    return (
        <div className="bg-bgMain w-screen h-screen text-white flex items-center justify-center">
            <div className="flex flex-col border rounded-lg p-8 gap-8 flex-shrink min-w-[50%]">
                <SignedIn>
                    <div className="text-4xl font-bold text-center">World Building</div>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row justify-between gap-8 items-center">
                            <div className="text-xl font-thin">{journeyCreationData[questionIndex]?.question}</div>
                            <div className="text-sm">{questionIndex+1} of {journeyCreationData.length}</div>
                        </div>
                        <textarea disabled={isLoading} value={journeyCreationData[questionIndex]?.answer} onChange={(e) => {setAnswer(e.target.value)}} rows={5} className="resize-none hover:resize-y rounded-md border p-2 bg-transparent opacity-50 hover:opacity-100 focus:opacity-100 transition-all font-thin" placeholder="Type your answer."></textarea>
                    </div>
                    <div className="flex flex-row gap-8">
                        {
                            questionIndex > 0 && questionIndex < journeyCreationData.length && (
                                <button disabled={isLoading} className="flex flex-grow border rounded-md opacity-50 hover:opacity-100 py-2 justify-center transition-all hover:rounded-[50px]" onClick={() => {
                                    setQuestionIndex(questionIndex - 1)
                                }}>Back</button>
                            )
                        }
                        {
                            questionIndex < journeyCreationData.length - 1 && (
                                <button disabled={isLoading} className="flex flex-grow border rounded-md opacity-50 hover:opacity-100 py-2 justify-center transition-all hover:rounded-[50px]" onClick={() => {
                                    setQuestionIndex(questionIndex + 1)
                                }}>Next</button>
                            )
                        }
                        {
                            questionIndex == journeyCreationData.length - 1 && (
                                <button disabled={isLoading} className="flex flex-grow border rounded-md opacity-50 hover:opacity-100 py-2 justify-center transition-all hover:rounded-[50px]" onClick={() => {
                                    setIsLoading(true)
                                    createJourney(journeyCreationData, journeyCreationData.find((data) => data.question == "What is the name of this new world?")?.answer??"new world")
                                        .then((_) => {
                                            router.push("/")
                                        })
                                        .catch((error) => console.log(error))
                                }}>Build World</button>
                            )
                        }
                    </div>
                </SignedIn>
                <SignedOut>
                    <div className="flex flex-col items-center gap-8">
                        <div className="text-2xl font-bold">You need an account to create a character.</div>
                        <SignInButton></SignInButton>
                    </div>
                </SignedOut>
            </div>
        </div>
    )
}