import { useRef, useState } from "react";
import InventoryElement from "./inventory";

function generateRandomString() {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

export default function TaggableInput({inventoryData, submitFunction}: {inventoryData: {title: string, type: string, lore: string, usage: string, rarity: string}[], submitFunction: (input: string) => void}) {
    const [itemLinks, setItemLinks] = useState([] as [string, string][])
    const [inputValue, setInputValue] = useState("")
    const inputRef = useRef<HTMLTextAreaElement>(null)

    function itemOnclick(itemData: {userContent: string, serverContent: string}) {
        inputRef.current?.focus()
        let itemNameAlreadyExists = false
        let itemDataAlreadyExists = false
        for (const link of itemLinks) {
            if (link[1] == itemData.serverContent) {
                itemDataAlreadyExists = true
                setInputValue(inputValue + link[0])
            }
            else if (link[0] == itemData.userContent) {
                itemNameAlreadyExists = true
            }
        }
        if (!itemDataAlreadyExists) {
            if (itemNameAlreadyExists) {
                const wordUniqueId = generateRandomString()
                setItemLinks([...itemLinks, [`[${itemData.userContent}-[${wordUniqueId}]]`, itemData.serverContent]])
                setInputValue(inputValue + `[${itemData.userContent}-[${wordUniqueId}]]`)
            }
            else {
                setItemLinks([...itemLinks, [`[${itemData.userContent}]`, itemData.serverContent]])
                setInputValue(inputValue + `[${itemData.userContent}]`)
            }
        }
    }
    
    function formatText() {
        let temptText = inputValue
        for (const link of itemLinks) {
            temptText = temptText.replace(link[0], link[1])
        }
        return temptText
    }
    const formattedText = formatText()

    const devData = false

    return (
        <div className="flex flex-col gap-4 w-full">
            {
                devData && (
                    <>
                        <div>
                            {JSON.stringify(itemLinks)}
                        </div>
                        <div>
                            {formattedText}
                        </div>
                    </>
                )
            }
            <textarea ref={inputRef} value={inputValue} placeholder="Press enter to submit..." onChange={(e) => {setInputValue(e.target.value)}} rows={3} className="flex bg-transparent resize-none hover:resize-y opacity-50 hover:opacity-100 focus:opacity-100 rounded-md border transition-all p-2" onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    submitFunction(formattedText)
                    setInputValue("")
                }
            }}></textarea>
            <InventoryElement {...{inventoryData, itemOnclick}} />
        </div>
    )
}