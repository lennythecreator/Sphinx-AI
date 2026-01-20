"use client"
import { useChat } from "ai/react"
import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Send, ExternalLink, BookOpen, Video } from "lucide-react"

import { useChatContext } from "@/app/context/ChatContext"

export default function ChatWindow({ advisor }) {
    const { chatHistory, saveMessages } = useChatContext()
    const initialMsgs = chatHistory[advisor.id] || []

    const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
        api: '/api/chat',
        body: {
            system: advisor.systemPrompt
        },
        initialMessages: initialMsgs
    })
    const messagesEndRef = useRef(null)

    useEffect(() => {
        if (messages.length === 0 && initialMsgs.length === 0) {
            setMessages([
                {
                    id: 'welcome',
                    role: 'assistant',
                    content: `Hello! I'm your ${advisor.role} advisor. How can I help you with ${advisor.domain} today?`
                }
            ])
        }
    }, [advisor, setMessages, initialMsgs.length, messages.length])

    useEffect(() => {
        if (messages.length > 0) {
            saveMessages(advisor.id, messages)
        }
    }, [messages, advisor.id, saveMessages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-white">
            {/* Header */}
            <div className="h-16 border-b border-zinc-200 flex items-center px-6 justify-between bg-white">
                <div className="flex items-center gap-3">
                    <div className="relative h-8 w-8">
                        <Image
                            src={advisor.imageUrl}
                            alt={advisor.role}
                            fill
                            className="rounded-full object-cover border border-zinc-200"
                        />
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-900">{advisor.role}</h3>
                        <p className="text-xs text-zinc-500">{advisor.domain}</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-50/30">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                                ? 'bg-zinc-900 text-white rounded-br-none'
                                : 'bg-white border border-zinc-200 text-zinc-800 rounded-bl-none shadow-sm'
                                }`}
                        >
                            {msg.content}

                            {/* Tool Invocations */}
                            {msg.toolInvocations?.map((toolInvocation) => {
                                const { toolName, toolCallId, state } = toolInvocation;

                                if (state === 'result') {
                                    const { result } = toolInvocation;

                                    if (toolName === 'searchJob') {
                                        return (
                                            <div key={toolCallId} className="mt-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                                                <div className="flex items-start gap-3">
                                                    {result.thumbnail && (
                                                        <img src={result.thumbnail} alt="Company Logo" className="w-10 h-10 object-contain rounded" />
                                                    )}
                                                    <div>
                                                        <h4 className="font-semibold text-zinc-900">{result.title}</h4>
                                                        <p className="text-zinc-600 text-xs">{result.company} • {result.location}</p>
                                                        <p className="text-zinc-700 mt-1 text-xs line-clamp-2">{result.jobDescription}</p>
                                                        {result.link && (
                                                            <a href={result.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center text-xs text-blue-600 hover:underline">
                                                                View Job <ExternalLink className="w-3 h-3 ml-1" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (toolName === 'findJobSalary') {
                                        return (
                                            <div key={toolCallId} className="mt-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                                                <h4 className="font-semibold text-zinc-900">Salary Estimate</h4>
                                                <p className="text-zinc-700 text-xs mt-1">{result.message}</p>
                                                <p className="text-zinc-400 text-[10px] mt-1">Source: {result.source}</p>
                                            </div>
                                        );
                                    }

                                    if (toolName === 'findVideo') {
                                        if (result.videoId) {
                                            return (
                                                <div key={toolCallId} className="mt-3">
                                                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                                                        <iframe
                                                            width="100%"
                                                            height="100%"
                                                            src={`https://www.youtube.com/embed/${result.videoId}`}
                                                            title={result.title}
                                                            frameBorder="0"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                        ></iframe>
                                                    </div>
                                                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                                                        <Video className="w-3 h-3" /> {result.title}
                                                    </p>
                                                </div>
                                            )
                                        }
                                        return <p key={toolCallId} className="text-xs text-zinc-500 italic mt-2">Video not found.</p>
                                    }

                                    if (toolName === 'findBook') {
                                        return (
                                            <div key={toolCallId} className="mt-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200 flex gap-3">
                                                {result.bookThumbnail && (
                                                    <img src={result.bookThumbnail} alt={result.bookTitle} className="w-12 h-16 object-cover rounded shadow-sm" />
                                                )}
                                                <div>
                                                    <h4 className="font-semibold text-zinc-900 text-sm">{result.bookTitle}</h4>
                                                    <p className="text-zinc-600 text-xs">{result.authors?.join(', ')}</p>
                                                    <p className="text-zinc-700 mt-1 text-xs line-clamp-2">{result.bookDescription}</p>
                                                    {result.bookLink && (
                                                        <a href={result.bookLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center text-xs text-blue-600 hover:underline">
                                                            View Book <BookOpen className="w-3 h-3 ml-1" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }
                                }
                                return null;
                            })}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-zinc-200 bg-white">
                <div className="flex gap-2 max-w-4xl mx-auto">
                    <input
                        className="flex-1 bg-zinc-100 border-0 rounded-full px-4 py-2 focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                        placeholder={`Ask the ${advisor.role}...`}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                    />
                    <Button
                        size="icon"
                        onClick={handleSubmit}
                        className="rounded-full h-10 w-10 bg-zinc-900 hover:bg-zinc-800"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
