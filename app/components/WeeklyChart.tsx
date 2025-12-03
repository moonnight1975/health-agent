'use client'

import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'

interface WeeklyChartProps {
    data: { date: string; steps: number }[]
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorSteps" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#5b6cff" />
                            <stop offset="100%" stopColor="#2dd4bf" />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                    <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                        dy={10}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
                        cursor={{ stroke: '#5b6cff', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="steps"
                        stroke="url(#colorSteps)"
                        strokeWidth={4}
                        dot={{ r: 4, fill: '#5b6cff', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, fill: '#2dd4bf', strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
