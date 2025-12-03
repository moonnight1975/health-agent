'use client'

import { useState } from 'react'
import { Check, Clock, Pill } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface Medication {
    id: string
    name: string
    dose: string
    schedule_time: string
    active: boolean
}

interface MedicationsListProps {
    medications: Medication[]
}

export default function MedicationsList({ medications: initialMedications }: MedicationsListProps) {
    const [medications, setMedications] = useState(initialMedications)
    const router = useRouter()

    const toggleMedication = async (id: string, currentStatus: boolean) => {
        setMedications(prev => prev.map(m =>
            m.id === id ? { ...m, active: !currentStatus } : m
        ))

        try {
            const response = await fetch('/api/medications/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, active: !currentStatus })
            })

            if (!response.ok) throw new Error('Failed to toggle')
            router.refresh()
        } catch (error) {
            setMedications(prev => prev.map(m =>
                m.id === id ? { ...m, active: currentStatus } : m
            ))
            console.error(error)
        }
    }

    // Helper to assign colors based on index or name hash
    const getPillColor = (index: number) => {
        const colors = ['pill-blue', 'pill-amber', 'pill-green']
        return colors[index % colors.length]
    }

    return (
        <div className="space-y-3">
            {medications.map((med, i) => (
                <motion.div
                    key={med.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 rounded-xl panel-glass border-soft hover:shadow-md transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "h-12 w-12 rounded-full flex items-center justify-center transition-colors",
                            med.active ? "bg-gray-100 text-gray-400 dark:bg-gray-800" : getPillColor(i)
                        )}>
                            <Pill className="h-6 w-6" />
                        </div>
                        <div>
                            <p className={cn("font-semibold", med.active && "text-muted-foreground line-through")}>
                                {med.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">{med.dose} • {med.schedule_time}</p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        className={cn(
                            "gap-2 rounded-full transition-all border",
                            !med.active
                                ? "bg-white hover:bg-green-50 text-green-600 border-green-200 shadow-sm"
                                : "bg-transparent text-muted-foreground border-transparent"
                        )}
                        onClick={() => toggleMedication(med.id, med.active)}
                    >
                        {med.active ? (
                            <>
                                <Clock className="h-4 w-4" />
                                <span className="text-xs">Reset</span>
                            </>
                        ) : (
                            <>
                                <Check className="h-4 w-4" />
                                <span className="text-xs font-bold">Mark Done</span>
                            </>
                        )}
                    </Button>
                </motion.div>
            ))}
            {medications.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    No medications scheduled
                </div>
            )}
        </div>
    )
}
