'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Bot, Paperclip, Smile, MoreVertical, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import dayjs from 'dayjs'

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp?: string
}

export function ChatInterface({ userId }: { userId: string }) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    // Load initial messages
    useEffect(() => {
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('conversations')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: true })

            if (data) {
                setMessages(data.map(m => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                    timestamp: dayjs(m.created_at).format('h:mm A')
                })))
            }
        }
        fetchMessages()
    }, [userId, supabase])

    // Auto-scroll
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight
            }
        }
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage = input
        const timestamp = dayjs().format('h:mm A')
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp }])
        setIsLoading(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, userId }),
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error('Chat API Error:', errorText)
                throw new Error(`Failed to send message: ${errorText}`)
            }

            const reader = response.body?.getReader()
            if (!reader) return

            let assistantMessage = ''
            setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: dayjs().format('h:mm A') }])

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                const text = new TextDecoder().decode(value)
                assistantMessage += text
                setMessages(prev => {
                    const newMessages = [...prev]
                    newMessages[newMessages.length - 1].content = assistantMessage
                    return newMessages
                })
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex h-full w-full bg-white dark:bg-gray-950">
            {/* Sidebar (Hidden on mobile, visible on desktop) */}
            <div className="hidden w-80 border-r bg-gray-50/40 dark:bg-gray-900/40 p-4 md:block">
                <Button variant="secondary" className="w-full justify-start gap-2 mb-6">
                    <Bot className="h-4 w-4" />
                    New Chat
                </Button>
                <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground px-2 uppercase tracking-wider">Recent Conversations</div>
                    <Button variant="ghost" className="w-full justify-start text-sm font-normal h-auto py-3 px-2">
                        <div className="flex flex-col items-start gap-1">
                            <span className="font-medium">Daily check-in</span>
                            <span className="text-xs text-muted-foreground">Yesterday</span>
                        </div>
                    </Button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex flex-1 flex-col relative">
                {/* 3. Header */}
                <header className="flex items-center justify-between px-6 py-4 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-10 shadow-[0_4px_10px_-4px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm">
                                <AvatarFallback className="bg-blue-100 text-blue-600">HA</AvatarFallback>
                                <AvatarImage src="/bot-avatar.png" />
                            </Avatar>
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">Health Assistant</h3>
                            <p className="text-xs text-muted-foreground">Online</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </header>

                {/* 2. Conversation Area */}
                <ScrollArea ref={scrollAreaRef} className="flex-1 p-6 bg-gray-50/30 dark:bg-gray-900/20">
                    <div className="space-y-6 max-w-3xl mx-auto">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center space-y-4 text-center text-muted-foreground mt-20">
                                <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                                    <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground">Welcome to Health Assist!</h3>
                                <p className="max-w-xs mx-auto">I'm here to help you track your health and answer your questions.</p>
                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" size="sm" onClick={() => setInput("How are my steps today?")}>Check Steps</Button>
                                    <Button variant="outline" size="sm" onClick={() => setInput("Log water intake")}>Log Water</Button>
                                </div>
                            </div>
                        )}

                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex gap-3 max-w-[85%]",
                                    m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                )}
                            >
                                {/* Avatar only for assistant */}
                                {m.role === 'assistant' && (
                                    <Avatar className="h-8 w-8 mt-auto flex-shrink-0">
                                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">AI</AvatarFallback>
                                        <AvatarImage src="/bot-avatar.png" />
                                    </Avatar>
                                )}

                                <div className={cn(
                                    "flex flex-col gap-1 min-w-0",
                                    m.role === 'user' ? "items-end" : "items-start"
                                )}>
                                    {/* Message Bubble */}
                                    <div
                                        className={cn(
                                            "px-4 py-3 text-sm shadow-sm break-words",
                                            m.role === 'user'
                                                ? "bg-blue-600 text-white rounded-[20px] rounded-br-[4px]"
                                                : "bg-[#F0F0F0] dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-[20px] rounded-bl-[4px]"
                                        )}
                                    >
                                        {m.content}
                                    </div>

                                    {/* Timestamp */}
                                    {m.timestamp && (
                                        <span className="text-[10px] text-muted-foreground px-1">
                                            {m.timestamp}
                                        </span>
                                    )}

                                    {/* Quick Reply Chips (Mock for last assistant message) */}
                                    {m.role === 'assistant' && i === messages.length - 1 && !isLoading && (
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                            <button
                                                onClick={() => setInput("Tell me more")}
                                                className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                Tell me more
                                            </button>
                                            <button
                                                onClick={() => setInput("Thanks!")}
                                                className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                Thanks!
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isLoading && (
                            <div className="flex gap-3 max-w-[85%]">
                                <Avatar className="h-8 w-8 mt-auto flex-shrink-0">
                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">AI</AvatarFallback>
                                </Avatar>
                                <div className="bg-[#F0F0F0] dark:bg-gray-800 rounded-[20px] rounded-bl-[4px] px-4 py-4 flex items-center gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* 4. Input Area */}
                <div className="p-4 bg-white dark:bg-gray-950 border-t">
                    <div className="max-w-3xl mx-auto">
                        <form onSubmit={handleSubmit} className="flex items-end gap-2 bg-gray-50 dark:bg-gray-900 p-2 rounded-[24px] border focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30 transition-all">
                            <Button type="button" variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-blue-600 h-10 w-10 flex-shrink-0">
                                <Paperclip className="h-5 w-5" />
                            </Button>

                            <Input
                                placeholder="Type a message..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                disabled={isLoading}
                                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-3 h-auto max-h-32 min-h-[44px]"
                            />

                            <Button type="button" variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-yellow-500 h-10 w-10 flex-shrink-0">
                                <Smile className="h-5 w-5" />
                            </Button>

                            <Button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className={cn(
                                    "rounded-full h-10 w-10 p-0 flex-shrink-0 transition-all duration-200",
                                    input.trim() ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-400"
                                )}
                            >
                                <Send className="h-4 w-4 ml-0.5" />
                            </Button>
                        </form>
                        <div className="text-center mt-2">
                            <p className="text-[10px] text-muted-foreground">Health Assist AI can make mistakes. Consider checking important information.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
