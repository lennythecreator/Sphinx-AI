"use client"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default function AdvisorList({ agents, activeAdvisor, onSelectAdvisor }) {
    return (
        <div className="w-80 border-r border-zinc-200 bg-stone-50 flex flex-col h-full">
            <div className="p-4 border-b border-zinc-200">
                <h2 className="font-semibold text-zinc-800">Advisors</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {agents.map((agent) => (
                    <button
                        key={agent.id}
                        onClick={() => onSelectAdvisor(agent)}
                        className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                            activeAdvisor?.id === agent.id
                                ? "bg-white shadow-sm border border-zinc-200"
                                : "hover:bg-zinc-100"
                        )}
                    >
                        <div className="relative h-10 w-10 flex-shrink-0">
                            <Image
                                src={agent.imageUrl}
                                alt={agent.role}
                                fill
                                className="rounded-full object-cover border border-zinc-200"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-zinc-900 truncate">
                                {agent.role}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">
                                {agent.domain}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
