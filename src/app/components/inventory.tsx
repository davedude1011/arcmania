import { Tooltip } from 'react-tooltip'
import Switch from "react-switch";
import { useState } from 'react';
import { LuInfo } from 'react-icons/lu';

export default function InventoryElement({inventoryData, itemOnclick}: {inventoryData: {title: string, type: string, lore: string, usage: string, rarity: string}[], itemOnclick?: (itemData: {userContent: string, serverContent: string}) => void}) {
    const [isTooltips, setIsTooltips] = useState(false)
    const [selectedInfoItem, setSelectedInfoItem] = useState(null as null|{title: string, type: string, lore: string, usage: string, rarity: string})

    function getFormatedItemExportData(itemData: {title: string, type: string, lore: string, usage: string, rarity: string}) {
        return {
            userContent: itemData.title,
            serverContent: `[item: ${itemData.title}, rarity: ${itemData.rarity}, usage: ${itemData.usage}, type: ${itemData.type}]`
        }
    }

    return (
        <div className="flex flex-col p-8 rounded-md border gap-8">
            <div className='flex flex-row justify-between items-center gap-8'>
                <div className="text-2xl font-thin">Inventory:</div>
                <div className='flex flex-row gap-2 items-center font-thin'>
                    Tooltips
                    <Switch
                        onChange={(checked) => setIsTooltips(checked)}
                        checked={isTooltips}
                        offColor="#111111"
                        onColor="#cccccc"
                        checkedIcon={false}
                        uncheckedIcon={false}
                        
                    ></Switch>
                </div>
            </div>
            {
                selectedInfoItem && (
                    <div className='flex flex-col gap-2 w-2/3'>
                        <div className='flex flex-row gap-2 items-center'>
                            <div className='text-xl'>{selectedInfoItem.title}</div>
                            <div className='font-thin opacity-50'>({selectedInfoItem.type})</div>
                            <div className='font-thin opacity-50'>({selectedInfoItem.rarity})</div>
                        </div>
                        <div className='font-thin'>{selectedInfoItem.lore}</div>
                        <div>{selectedInfoItem.usage}</div>
                    </div>
                )
            }
            <div className="flex flex-wrap gap-2">
                <Tooltip id='item-usage' style={{ maxWidth: "36rem", display: (isTooltips ? "block" : "none") }}></Tooltip>
                {
                    inventoryData.map((itemData, index) => (
                        <button onClick={() => {
                            if (itemOnclick) itemOnclick(getFormatedItemExportData(itemData))
                            else setSelectedInfoItem(itemData)
                        }} data-tooltip-id="item-usage" data-tooltip-variant='info' data-tooltip-content={itemData.usage} key={index} className={`p-2 flex flex-grow border rounded-md justify-center ${selectedInfoItem == itemData ? "opacity-100" : "opacity-50"} hover:opacity-100 transition-all `}>
                            <button className={`${selectedInfoItem == itemData ? "opacity-100" : "opacity-50"} hover:opacity-100 transition-all`} onClick={(e) => {
                                e.stopPropagation()
                                setSelectedInfoItem(itemData)
                            }}><LuInfo /></button>
                            <div className={`flex flex-grow justify-center ${itemData.rarity == "legendary" ? "text-yellow-500" : itemData.rarity == "mythical" ? "text-purple-500" : itemData.rarity == "godly" && "text-red-700"}`}>{itemData.title}</div>
                        </button>
                    ))
                }
            </div>
        </div>
    )
}