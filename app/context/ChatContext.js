"use client"
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const ChatContext = createContext()

export function ChatProvider({ children }) {
    const [activeAdvisor, setActiveAdvisor] = useState(null)
    const [chatHistory, setChatHistory] = useState({})
    const [isLoaded, setIsLoaded] = useState(false)

    // Load from localStorage
    useEffect(() => {
        const savedAdvisor = localStorage.getItem('activeAdvisor')
        const savedHistory = localStorage.getItem('chatHistory')

        if (savedAdvisor) {
            try {
                setActiveAdvisor(JSON.parse(savedAdvisor))
            } catch (e) {
                console.error("Failed to parse saved advisor", e)
            }
        }
        if (savedHistory) {
            try {
                setChatHistory(JSON.parse(savedHistory))
            } catch (e) {
                console.error("Failed to parse saved history", e)
            }
        }
        setIsLoaded(true)
    }, [])

    // Save activeAdvisor
    useEffect(() => {
        if (isLoaded && activeAdvisor) {
            localStorage.setItem('activeAdvisor', JSON.stringify(activeAdvisor))
        }
    }, [activeAdvisor, isLoaded])

    // Save chatHistory
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory))
        }
    }, [chatHistory, isLoaded])

    const saveMessages = useCallback((advisorId, messages) => {
        setChatHistory(prev => ({
            ...prev,
            [advisorId]: messages
        }))
    }, [])

    const contextValue = useMemo(() => ({
        activeAdvisor,
        setActiveAdvisor,
        chatHistory,
        saveMessages,
        isLoaded
    }), [activeAdvisor, chatHistory, saveMessages, isLoaded, setActiveAdvisor])

    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    )
}

export const useChatContext = () => useContext(ChatContext)
