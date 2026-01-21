"use client"
import { useChat } from "ai/react"
import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Send, ExternalLink, BookOpen, Video, Paperclip, X, FileText, ChevronLeft, ChevronRight } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { useChatContext } from "@/app/context/ChatContext"
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist"

GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js"

function JobCarousel({ jobs, query }) {
    const itemRefs = useRef([])
    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
        itemRefs.current = itemRefs.current.slice(0, jobs.length)
        if (activeIndex > jobs.length - 1) {
            setActiveIndex(0)
        }
    }, [jobs.length, activeIndex])

    const scrollToIndex = (nextIndex) => {
        const clamped = Math.max(0, Math.min(nextIndex, jobs.length - 1))
        setActiveIndex(clamped)
        const node = itemRefs.current[clamped]
        if (node) {
            node.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
        }
    }

    const handlePrev = () => scrollToIndex(activeIndex - 1)
    const handleNext = () => scrollToIndex(activeIndex + 1)
    const title = query ? `Results for "${query}"` : "Job matches"

    return (
        <div className="mt-3 rounded-xl border border-zinc-200 bg-white/80 p-3">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold text-zinc-900">Job matches</p>
                    <p className="text-[11px] text-zinc-500">{title}</p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <span>{activeIndex + 1}/{jobs.length}</span>
                    <button
                        type="button"
                        onClick={handlePrev}
                        disabled={jobs.length < 2}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:border-zinc-400 disabled:opacity-50"
                        aria-label="Previous job"
                    >
                        <ChevronLeft className="h-3 w-3" />
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={jobs.length < 2}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:border-zinc-400 disabled:opacity-50"
                        aria-label="Next job"
                    >
                        <ChevronRight className="h-3 w-3" />
                    </button>
                </div>
            </div>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                {jobs.map((job, index) => (
                    <div
                        key={job.id || `${job.title}-${index}`}
                        ref={(node) => { itemRefs.current[index] = node }}
                        className="min-w-[230px] max-w-[260px] flex-shrink-0 snap-center rounded-xl border border-zinc-200 bg-white p-3 shadow-sm"
                    >
                        <div className="flex items-start gap-2">
                            {job.thumbnail ? (
                                <img
                                    src={job.thumbnail}
                                    alt={`${job.company || "Company"} logo`}
                                    className="h-10 w-10 rounded object-contain border border-zinc-200 bg-white"
                                />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded border border-zinc-200 bg-zinc-100 text-xs font-semibold text-zinc-600">
                                    {job.company ? job.company.slice(0, 2).toUpperCase() : "JB"}
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-semibold text-zinc-900">{job.title || "Role"}</p>
                                <p className="text-xs text-zinc-500">
                                    {[job.company, job.location].filter(Boolean).join(" - ") || "Details unavailable"}
                                </p>
                            </div>
                        </div>
                        {job.description && (
                            <p className="mt-2 text-xs text-zinc-600 line-clamp-3">{job.description}</p>
                        )}
                        {Array.isArray(job.qualifications) && job.qualifications.length > 0 && (
                            <ul className="mt-2 text-[11px] text-zinc-500 list-disc pl-4">
                                {job.qualifications.slice(0, 3).map((item, itemIndex) => (
                                    <li key={`${job.id || job.title}-qual-${itemIndex}`}>{item}</li>
                                ))}
                            </ul>
                        )}
                        {job.link && (
                            <a
                                href={job.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center text-xs text-blue-600 hover:underline"
                            >
                                Apply <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                        )}
                    </div>
                ))}
            </div>
            <p className="text-[11px] text-zinc-500">Swipe to browse</p>
        </div>
    )
}

export default function ChatWindow({ advisor }) {
    const { chatHistory, saveMessages } = useChatContext()
    const initialMsgs = chatHistory[advisor.id] || []

    const { messages, input, handleInputChange, handleSubmit, setMessages, setInput, isLoading, stop } = useChat({
        api: '/api/chat',
        body: {
            system: advisor.systemPrompt
        },
        initialMessages: initialMsgs
    })
    const messagesEndRef = useRef(null)
    const fileInputRef = useRef(null)
    const pendingAttachmentRef = useRef(null)
    const [attachments, setAttachments] = useState([])
    const [attachmentInfo, setAttachmentInfo] = useState(null)
    const [fileError, setFileError] = useState("")

    const markdownComponents = {
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 list-disc pl-5">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 list-decimal pl-5">{children}</ol>,
        li: ({ children }) => <li className="mb-1 last:mb-0">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ inline, children }) => (
            inline ? (
                <code className="rounded bg-zinc-100 px-1 py-0.5 text-[0.85em] text-zinc-900">
                    {children}
                </code>
            ) : (
                <code className="block rounded-lg bg-zinc-900 px-3 py-2 text-[0.85em] text-zinc-100 whitespace-pre-wrap">
                    {children}
                </code>
            )
        ),
        pre: ({ children }) => <pre className="mb-2 overflow-x-auto">{children}</pre>,
    }

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

    useEffect(() => {
        setAttachments([])
        setAttachmentInfo(null)
        setFileError("")
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }, [advisor.id])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (!pendingAttachmentRef.current) return

        setMessages(prev => {
            if (!pendingAttachmentRef.current) return prev

            const indexFromEnd = [...prev].reverse().findIndex(message => (
                message.role === "user" && !message.attachmentMeta
            ))

            if (indexFromEnd === -1) {
                return prev
            }

            const messageIndex = prev.length - 1 - indexFromEnd
            const updated = [...prev]
            updated[messageIndex] = {
                ...updated[messageIndex],
                attachmentMeta: pendingAttachmentRef.current,
            }
            pendingAttachmentRef.current = null
            return updated
        })
    }, [messages, setMessages])

    const handleDelete = (id) => {
        setMessages(prev => prev.filter(message => message.id !== id))
    }

    const handleFileChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (file.type !== "application/pdf") {
            setFileError("Please upload a valid PDF file.")
            setAttachments([])
            setAttachmentInfo(null)
            return
        }

        console.log(`PDF upload selected: ${file.name} (${file.size} bytes)`)
        setFileError("")
        setAttachments([])
        setAttachmentInfo({ name: file.name, size: file.size, pages: null, status: "processing" })

        const fileReader = new FileReader()
        fileReader.readAsArrayBuffer(file)

        fileReader.onload = async () => {
            try {
                const typedArray = new Uint8Array(fileReader.result)
                const pdf = await getDocument(typedArray).promise
                const newImages = []

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i)
                    const viewport = page.getViewport({ scale: 1 })
                    const canvas = document.createElement("canvas")
                    const context = canvas.getContext("2d")
                    canvas.height = viewport.height
                    canvas.width = viewport.width
                    await page.render({ canvasContext: context, viewport }).promise
                    newImages.push(canvas.toDataURL())
                }

                setAttachments(newImages)
                setAttachmentInfo({ name: file.name, size: file.size, pages: pdf.numPages, status: "ready" })
                setFileError("")
                console.log(`PDF processed: ${file.name} (${pdf.numPages} pages)`)
            } catch (error) {
                console.error("Error processing PDF:", error)
                setAttachmentInfo({ name: file.name, size: file.size, pages: null, status: "error" })
                setFileError("Unable to process that PDF.")
            }
        }

        fileReader.onerror = () => {
            console.error("Error reading file:", fileReader.error)
            setAttachmentInfo({ name: file.name, size: file.size, pages: null, status: "error" })
            setFileError("Unable to read that file.")
        }
    }

    const handleChatSubmit = (event) => {
        if (event?.preventDefault) {
            event.preventDefault()
        }

        const trimmedInput = input.trim()
        if (!trimmedInput && attachments.length === 0) {
            return
        }

        if (attachmentInfo?.status === "processing") {
            setFileError("Please wait until the PDF finishes processing.")
            return
        }

        const experimental_attachments = attachments.map((imageUrl, index) => ({
            url: imageUrl,
            contentType: "image/png",
            name: attachmentInfo?.name
                ? `${attachmentInfo.name} (page ${index + 1})`
                : `page-${index + 1}.png`,
        }))

        if (experimental_attachments.length > 0) {
            pendingAttachmentRef.current = {
                name: attachmentInfo?.name || "Attachment",
                pages: experimental_attachments.length,
            }
            console.log(`Sending attachment: ${pendingAttachmentRef.current.name} (${pendingAttachmentRef.current.pages} pages)`)
        }

        handleSubmit(event, {
            experimental_attachments,
            allowEmptySubmit: experimental_attachments.length > 0 && !trimmedInput,
        })

        setAttachments([])
        setAttachmentInfo(null)
        setFileError("")
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
        setInput("")
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleChatSubmit(e)
        }
    }

    const getAttachmentSummary = (message) => {
        if (!message) return null
        if (message.attachmentMeta?.name) {
            return {
                name: message.attachmentMeta.name,
                pages: message.attachmentMeta.pages || 0,
            }
        }

        const rawAttachments = message.experimental_attachments
        const attachments = Array.isArray(rawAttachments)
            ? rawAttachments
            : rawAttachments && typeof rawAttachments.length === "number"
                ? Array.from(rawAttachments)
                : []

        if (attachments.length === 0) return null

        const name = attachments[0]?.name || "Attachment"
        return { name: name.replace(/\s*\(page\s+\d+\)$/i, ""), pages: attachments.length }
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
                {messages.map((msg) => {
                    const attachmentSummary = getAttachmentSummary(msg)
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                        <div
                            className={`relative max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                                ? 'bg-zinc-900 text-white rounded-br-none'
                                : 'bg-white border border-zinc-200 text-zinc-800 rounded-bl-none shadow-sm'
                                }`}
                        >
                            <button
                                type="button"
                                onClick={() => handleDelete(msg.id)}
                                className="absolute -top-2 -right-2 rounded-full bg-white text-zinc-500 border border-zinc-200 hover:text-zinc-800 hover:border-zinc-300"
                                aria-label="Delete message"
                            >
                                <X className="h-3 w-3" />
                            </button>

                            {attachmentSummary && (
                                <div
                                    className={`mb-2 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${msg.role === "user"
                                        ? "border-white/20 bg-white/10 text-white"
                                        : "border-zinc-200 bg-zinc-50 text-zinc-700"
                                        }`}
                                >
                                    <FileText className="h-3 w-3" />
                                    <span className="font-medium">{attachmentSummary.name}</span>
                                    <span>{attachmentSummary.pages} pages</span>
                                </div>
                            )}

                            {msg.role === "assistant" ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                    {msg.content}
                                </ReactMarkdown>
                            ) : (
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            )}

                            {/* Tool Invocations */}
                            {msg.toolInvocations?.map((toolInvocation) => {
                                const { toolName, toolCallId, state } = toolInvocation;

                                if (state === 'result') {
                                    const { result } = toolInvocation;

                                    if (toolName === 'searchJob') {
                                        const fallbackQualifications = Array.isArray(result.qualifications)
                                            ? result.qualifications
                                            : result.qualifications
                                                ? [result.qualifications]
                                                : []
                                        const fallbackJob = result.job ? {
                                            id: result.job_id || `${result.company || 'company'}-${result.job}-${result.location || 'location'}`,
                                            title: result.job,
                                            description: result.jobDescription,
                                            company: result.company,
                                            location: result.location,
                                            qualifications: fallbackQualifications,
                                            link: result.link,
                                            thumbnail: result.thumbnail,
                                        } : null
                                        const jobs = Array.isArray(result.jobs)
                                            ? result.jobs
                                            : (fallbackJob ? [fallbackJob] : [])

                                        if (jobs.length === 0) {
                                            return (
                                                <div key={toolCallId} className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                                                    {result.message || "No jobs found."}
                                                </div>
                                            )
                                        }

                                        return (
                                            <JobCarousel
                                                key={toolCallId}
                                                jobs={jobs}
                                                query={result.query || result.job || ""}
                                            />
                                        )
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
                )})}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-zinc-200 bg-white">
                <form className="flex flex-col gap-2 max-w-4xl mx-auto" onSubmit={handleChatSubmit}>
                    <div className="flex items-center gap-2">
                        <label
                            htmlFor="pdf-upload"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                            title="Attach a PDF resume"
                        >
                            <Paperclip className="h-4 w-4" />
                        </label>
                        <input
                            id="pdf-upload"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="application/pdf"
                            className="hidden"
                        />
                        <input
                            className="flex-1 bg-zinc-100 border-0 rounded-full px-4 py-2 focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                            placeholder={`Ask the ${advisor.role}...`}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                        />
                        <Button
                            size="icon"
                            type="submit"
                            className="rounded-full h-10 w-10 bg-zinc-900 hover:bg-zinc-800"
                            disabled={isLoading}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                        {isLoading && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => stop()}
                                className="rounded-full h-10 px-4 text-xs"
                            >
                                Stop
                            </Button>
                        )}
                    </div>
                    {(attachmentInfo || fileError) && (
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                            <div className="flex flex-wrap items-center gap-2">
                                {attachmentInfo && (
                                    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-700">
                                        <Paperclip className="h-3 w-3" />
                                        <span className="font-medium text-zinc-800">{attachmentInfo.name}</span>
                                        {attachmentInfo.status === "processing" ? (
                                            <span>Processing...</span>
                                        ) : (
                                            <span>{attachmentInfo.pages} pages</span>
                                        )}
                                    </div>
                                )}
                                {fileError && <span>{fileError}</span>}
                            </div>
                            {(attachments.length > 0 || attachmentInfo) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAttachments([])
                                        setAttachmentInfo(null)
                                        setFileError("")
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = ""
                                        }
                                    }}
                                    className="text-zinc-500 hover:text-zinc-800"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
