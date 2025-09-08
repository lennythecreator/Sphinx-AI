import { Button } from "../button"
import { Card } from "../card"
import Image from "next/image"
export default function AdvisorCard({agent,description,topic,imageUrl,level}){
    return(
        <div>
            <Card className='w-md h-80 p-4 bg-stone-100'>
                <div className="flex h-full flex-col gap-4">
                    <div className="flex items-center">
                        <Image 
                          src={`${imageUrl}`}
                          height={100} 
                          width={100} 
                          alt={agent}
                          className="rounded-full border border-zinc-200 p-1 mr-4"
                        />
                        <span className="flex flex-col">
                            <p className="text-Title font-medium text-zinc-900">{agent}</p>
                            <p className="text-muted-foreground">{topic}</p>
                        </span>
                        
                         
                    </div>
                    <div className="flex flex-col h-full">
                        <span>{level}</span>
                        <p className="text-neutral-700">{description}</p>
                        <Button size={'xl'}  className='w-full mt-auto rounded-full bg-gradient-to-r from-stone-900 to-stone-950 border-2 border-stone-700 shadow-inner'><p>Advise me</p></Button>
                    </div>
                    
                </div>
            </Card>
        </div>
    )
}