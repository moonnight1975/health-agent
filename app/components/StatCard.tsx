'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
    title: string
    value: string | number
    sub?: string
    icon?: LucideIcon
    variant?: '1' | '2' | '3' | '4'
    className?: string
    children?: React.ReactNode
}

export default function StatCard({
    title,
    value,
    sub,
    icon: Icon,
    variant = '1',
    className,
    children
}: StatCardProps) {

    const variants = {
        '1': 'card-gradient-1',
        '2': 'card-gradient-2',
        '3': 'card-gradient-3',
        '4': 'card-gradient-4',
    }

    return (
        <motion.div
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "relative overflow-hidden rounded-xl2 p-6 shadow-xl transition-all",
                variants[variant],
                className
            )}
        >
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium opacity-90">{title}</p>
                        <h3 className="mt-2 text-3xl font-bold tracking-tight">{value}</h3>
                    </div>
                    {Icon && (
                        <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
                            <Icon className="h-5 w-5 text-white" />
                        </div>
                    )}
                </div>

                {sub && (
                    <p className="mt-4 text-xs font-medium opacity-80">
                        {sub}
                    </p>
                )}

                {children}
            </div>

            {/* Decorative circles */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-black/5 blur-2xl" />
        </motion.div>
    )
}
