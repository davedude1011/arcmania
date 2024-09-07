"use client"

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { useRouter } from "next/navigation";
import { useState } from "react"
import { createCharacterData } from "~/server/characterCreation"

export default function Page() {
    const router = useRouter();

    const [characterCreationData, setCharacterCreationData] = useState([
        {
            question: "What is your character’s preferred combat style, if any?",
            answer: ""
        },
        {
            question: "What race or species is your character?",
            answer: ""
        },
        {
            question: "What general age range does your character fall into?",
            answer: ""
        },
        {
            question: "Does your character have any notable physical characteristics?",
            answer: ""
        },
        {
            question: "What are your character’s primary skills or abilities?",
            answer: ""
        },
        {
            question: "Does your character have any natural talents or affinities?",
            answer: ""
        },
        {
            question: "What kind of equipment does your character typically carry?",
            answer: ""
        },
        {
            question: "Does your character have any weaknesses or limitations (physical or magical)?",
            answer: ""
        },
        {
            question: "What is your characters name?",
            answer: ""
        },
        {
            question: "Is there any other detail about your character that you think is important?",
            answer: ""
        },
    ])
    const [questionIndex, setQuestionIndex] = useState(0)
    
    function setAnswer(answer: string) {
        const tempCharacterCreationData = [...characterCreationData]
        if (tempCharacterCreationData[questionIndex]) {
            tempCharacterCreationData[questionIndex].answer = answer
            setCharacterCreationData(tempCharacterCreationData)
        }
    }

    const [isLoading, setIsLoading] = useState(false)

    return (
        <div className="bg-bgMain w-screen h-screen text-white flex items-center justify-center">
            <div className="flex flex-col border rounded-lg p-8 gap-8 flex-shrink min-w-[50%]">
                <SignedIn>
                    <div className="text-4xl font-bold text-center">Character Creation</div>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row justify-between gap-8 items-center">
                            <div className="text-xl font-thin">{characterCreationData[questionIndex]?.question}</div>
                            <div className="text-sm">{questionIndex+1} of {characterCreationData.length}</div>
                        </div>
                        <textarea disabled={isLoading} value={characterCreationData[questionIndex]?.answer} onChange={(e) => {setAnswer(e.target.value)}} rows={5} className="resize-none hover:resize-y rounded-md border p-2 bg-transparent opacity-50 hover:opacity-100 focus:opacity-100 transition-all font-thin" placeholder="Type your answer."></textarea>
                    </div>
                    <div className="flex flex-row gap-8">
                        {
                            questionIndex > 0 && questionIndex < characterCreationData.length && (
                                <button disabled={isLoading} className="flex flex-grow border rounded-md opacity-50 hover:opacity-100 py-2 justify-center transition-all hover:rounded-[50px]" onClick={() => {
                                    setQuestionIndex(questionIndex - 1)
                                }}>Back</button>
                            )
                        }
                        {
                            questionIndex < characterCreationData.length - 1 && (
                                <button disabled={isLoading} className="flex flex-grow border rounded-md opacity-50 hover:opacity-100 py-2 justify-center transition-all hover:rounded-[50px]" onClick={() => {
                                    setQuestionIndex(questionIndex + 1)
                                }}>Next</button>
                            )
                        }
                        {
                            questionIndex == characterCreationData.length - 1 && (
                                <button disabled={isLoading} className="flex flex-grow border rounded-md opacity-50 hover:opacity-100 py-2 justify-center transition-all hover:rounded-[50px]" onClick={() => {
                                    setIsLoading(true)
                                    createCharacterData(characterCreationData)
                                        .then((_) => {
                                            router.push("/")
                                        })
                                        .catch((error) => console.log(error))
                                }}>Build Character</button>
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