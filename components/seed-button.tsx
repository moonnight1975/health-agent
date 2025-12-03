'use client'

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function SeedButton() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSeed = async () => {
        setLoading(true)
        try {
            await fetch('/api/seed', { method: 'POST' })
            router.refresh()
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button onClick={handleSeed} disabled={loading} variant="outline" size="sm">
            {loading ? 'Loading...' : 'Load Demo Data'}
        </Button>
    )
}
