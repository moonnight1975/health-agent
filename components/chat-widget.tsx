'use client'

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { MessageCircle } from "lucide-react"
import { ChatInterface } from "@/components/chat-interface"
import { useState } from "react"

export function ChatWidget({ userId }: { userId: string }) {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white p-0 z-50"
                    size="icon"
                >
                    <MessageCircle className="h-8 w-8" />
                    <span className="sr-only">Open Chat</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 flex flex-col gap-0 border-l-0">
                <div className="sr-only">
                    <SheetTitle>Health Assistant Chat</SheetTitle>
                    <SheetDescription>Chat with your AI health assistant</SheetDescription>
                </div>
                <div className="flex-1 h-full overflow-hidden">
                    <ChatInterface userId={userId} />
                </div>
            </SheetContent>
        </Sheet>
    )
}
