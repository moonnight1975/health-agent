'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import dayjs from 'dayjs'

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp?: string
}

interface ChatPanelProps {
    isOpen: boolean
    onClose: () => void
    userId: string
}

export default function ChatPanel({ isOpen, onClose, userId }: ChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    useEffect(() => {
        if (isOpen) {
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
        }
    }, [isOpen, userId, supabase])

    useEffect(() => {
        if (scrollRef.current) {
            const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (viewport) viewport.scrollTop = viewport.scrollHeight
        }
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMsg = input
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: dayjs().format('h:mm A') }])
        setIsLoading(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, userId })
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error('Chat API Error:', errorText)
                throw new Error(`Failed to send: ${errorText}`)
            }

            const reader = response.body?.getReader()
            if (!reader) return

            let assistantMsg = ''
            setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: dayjs().format('h:mm A') }])

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                const text = new TextDecoder().decode(value)
                assistantMsg += text
                setMessages(prev => {
                    const newMessages = [...prev]
                    newMessages[newMessages.length - 1].content = assistantMsg
                    return newMessages
                })
            }
        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.', timestamp: dayjs().format('h:mm A') }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] panel-glass z-50 shadow-2xl flex flex-col border-l-0 sm:border-l"
                    >
                        {/* Header with Gradient */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-brand-500 to-greenish-400 text-white shadow-md">
                            <div className="flex items-center gap-3">
                                <Avatar className="border-2 border-white/30">
                                    <AvatarImage src="/bot-avatar.png" />
                                    <AvatarFallback className="bg-white/20 text-white">AI</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold text-lg">Health Assistant</h3>
                                    <p className="text-xs text-blue-50 flex items-center gap-1 opacity-90">
                                        <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                                        Online
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 rounded-full">
                                <X className="h-6 w-6" />
                            </Button>
                        </div>

                        <ScrollArea ref={scrollRef} className="flex-1 p-4 bg-white/50 dark:bg-black/20">
                            <div className="space-y-4">
                                {messages.length === 0 && (
                                    <div className="text-center text-muted-foreground mt-10">
                                        <div className="bg-brand-100 dark:bg-brand-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Bot className="h-8 w-8 text-brand-500" />
                                        </div>
                                        <p className="font-medium">How can I help you today?</p>
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
                                        {m.role === 'assistant' && (
                                            <Avatar className="h-8 w-8 mt-1 border border-white/50 shadow-sm">
                                                <AvatarFallback className="bg-brand-100 text-brand-600 text-xs">AI</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={cn(
                                            "flex flex-col gap-1 min-w-0",
                                            m.role === 'user' ? "items-end" : "items-start"
                                        )}>
                                            <div className={cn(
                                                "px-4 py-2 rounded-2xl text-sm shadow-sm",
                                                m.role === 'user'
                                                    ? "bg-brand-600 text-white rounded-br-sm"
                                                    : "bg-white dark:bg-gray-800 text-foreground rounded-bl-sm border border-gray-100 dark:border-gray-700"
                                            )}>
                                                {m.content}
                                            </div>
                                            {m.timestamp && (
                                                <span className="text-[10px] text-muted-foreground px-1">
                                                    {m.timestamp}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                                    <div className="flex gap-3 max-w-[85%]">
                                        <Avatar className="h-8 w-8 mt-1">
                                            <AvatarFallback className="bg-brand-100 text-brand-600 text-xs">AI</AvatarFallback>
                                        </Avatar>
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
                                            <div className="flex gap-1">
                                                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-brand-400 rounded-full" />
                                                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-brand-400 rounded-full" />
                                                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-brand-400 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t border-white/20 bg-white/60 dark:bg-black/40 backdrop-blur">
                            <form onSubmit={handleSubmit} className="flex gap-2 relative">
                                <Input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="rounded-full pl-4 pr-12 bg-white/80 dark:bg-black/50 border-transparent focus:border-brand-300 shadow-inner"
                                    disabled={isLoading}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="absolute right-1 top-1 h-8 w-8 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-md"
                                    disabled={isLoading || !input.trim()}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
