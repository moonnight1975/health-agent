'use client'

import { DashboardCard } from "@/components/dashboard-card"
import { SeedButton } from "@/components/seed-button"
import FabChat from "@/app/components/FabChat"
import MedicationsList from "@/app/components/MedicationsList"
import WeeklyChart from "@/app/components/WeeklyChart"
import SmallSparkline from "@/app/components/SmallSparkline"
import StatCard from "@/app/components/StatCard"
import MoodLottie from "@/app/components/MoodLottie"
import { Activity, Droplets, Moon, Smile } from "lucide-react"
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

// Mock Lottie animation (replace with real JSON)
const moodAnimation = {
    v: "5.5.7",
    fr: 60,
    ip: 0,
    op: 60,
    w: 100,
    h: 100,
    nm: "Mood",
    ddd: 0,
    assets: [],
    layers: []
}

export default function DashboardPage() {
    const { data: metrics, isLoading } = useDashboardMetrics()
    const [medications, setMedications] = useState<any[]>([])
    const [weeklyData, setWeeklyData] = useState<any[]>([])
    const [userId, setUserId] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)

                // Fetch medications
                const { data: meds } = await supabase
                    .from('medications')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('schedule_time')
                if (meds) setMedications(meds)

                // Fetch weekly data for chart
                const { data: history } = await supabase
                    .from('metrics')
                    .select('date, steps')
                    .eq('user_id', user.id)
                    .order('date', { ascending: true })
                    .limit(7)
                if (history) setWeeklyData(history)
            }
        }
        fetchData()
    }, [])

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 relative min-h-screen bg-background">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <SeedButton />
                </div>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
                <motion.div variants={item}>
                    <StatCard
                        title="Steps"
                        value={metrics?.steps?.toLocaleString() || "0"}
                        sub="Today's Goal: 10,000"
                        icon={Activity}
                        variant="1"
                    />
                </motion.div>
                <motion.div variants={item}>
                    <StatCard
                        title="Water Intake"
                        value={`${metrics?.water_ml?.toLocaleString() || "0"} ml`}
                        sub="Goal: 2000ml"
                        icon={Droplets}
                        variant="2"
                    />
                </motion.div>
                <motion.div variants={item}>
                    <StatCard
                        title="Sleep"
                        value={`${metrics?.sleep_hours?.toString() || "0"} hrs`}
                        sub="Last night"
                        icon={Moon}
                        variant="3"
                    />
                </motion.div>
                <motion.div variants={item}>
                    <StatCard
                        title="Mood"
                        value={metrics?.mood?.toString() || "5"}
                        sub="/ 10 Scale"
                        icon={Smile}
                        variant="4"
                        className="relative"
                    >
                        <div className="absolute right-0 bottom-0 w-24 h-24 pointer-events-none translate-y-4 translate-x-4">
                            <MoodLottie />
                        </div>
                    </StatCard>
                </motion.div>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="col-span-4 rounded-xl2 border-soft bg-white dark:bg-card shadow-lg p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold">Weekly Activity</h3>
                            <p className="text-sm text-muted-foreground">Steps over the last 7 days</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                            <SmallSparkline data={weeklyData.map(d => d.steps)} color="#3b82f6" />
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <WeeklyChart data={weeklyData} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="col-span-3 rounded-xl2 border-soft bg-white dark:bg-card shadow-lg p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold">Medication Reminders</h3>
                            <p className="text-sm text-muted-foreground">Don't forget your meds</p>
                        </div>
                    </div>
                    <MedicationsList medications={medications} />
                </motion.div>
            </div>

            {userId && <FabChat userId={userId} />}
        </div>
    )
}
