"use client"
import { createContext, useContext, useState, useEffect } from 'react'

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

    const saveMessages = (advisorId, messages) => {
        setChatHistory(prev => ({
            ...prev,
            [advisorId]: messages
        }))
    }

    return (
        <ChatContext.Provider value={{
            activeAdvisor,
            setActiveAdvisor,
            chatHistory,
            saveMessages,
            isLoaded
        }}>
            {children}
        </ChatContext.Provider>
    )
}

export const useChatContext = () => useContext(ChatContext)
