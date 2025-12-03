'use client'

import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface SmallSparklineProps {
    data: number[]
    color?: string
}

export default function SmallSparkline({ data, color = "#2563eb" }: SmallSparklineProps) {
    const chartData = data.map((val, i) => ({ i, val }))

    return (
        <div className="h-[40px] w-[80px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <Line
                        type="monotone"
                        dataKey="val"
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
