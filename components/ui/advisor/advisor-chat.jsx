"use client"
import { useState } from "react"
import AdvisorList from "./advisor-list"
import ChatWindow from "./chat-window"
import { AGENTS } from "@/app/Constants/agent-role"
import AdvisorCard from "./advisor-card"
import { motion } from "motion/react"
import { useChatContext } from "@/app/context/ChatContext"

export default function AdvisorChat() {
    const { activeAdvisor, setActiveAdvisor, isLoaded } = useChatContext()

    if (!isLoaded) return null // Or a loading spinner

    if (!activeAdvisor) {
        return (
            <div className="p-8 flex flex-col items-center mx-auto w-full">
                <h1 className="text-Title text-zinc-800 font-medium">Tech Advisor</h1>
                <p className="text-zinc-600">Pick an Advisor to get started on your tech journey</p>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {AGENTS.map((agent) => (
                        <motion.div
                            className="rounded-xl cursor-pointer"
                            key={agent.id}
                            whileHover={{ border: '2px solid #663bf5', scale: 1.05, transition: { duration: 0.3 } }}
                            onClick={() => setActiveAdvisor(agent)}
                        >
                            <AdvisorCard
                                agent={agent.role}
                                description={agent.description}
                                topic={agent.domain}
                                imageUrl={agent.imageUrl}
                                level={agent.level}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-white">
            <AdvisorList
                agents={AGENTS}
                activeAdvisor={activeAdvisor}
                onSelectAdvisor={setActiveAdvisor}
            />
            <ChatWindow key={activeAdvisor.id} advisor={activeAdvisor} />
        </div>
    )
}
