'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import ChatPanel from './ChatPanel'

interface FabChatProps {
    userId: string
}

export default function FabChat({ userId }: FabChatProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-16 w-16 rounded-full fab-gradient flex items-center justify-center z-40 transition-all hover:shadow-brand-500/50"
            >
                <MessageCircle className="h-8 w-8" />
            </motion.button>

            <ChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} userId={userId} />
        </>
    )
}
