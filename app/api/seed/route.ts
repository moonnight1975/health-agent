import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Seed metrics
    const today = new Date()
    const metrics = []

    for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        metrics.push({
            user_id: user.id,
            date: date.toISOString().split('T')[0],
            steps: Math.floor(Math.random() * 5000) + 5000,
            water_ml: Math.floor(Math.random() * 1000) + 1000,
            sleep_hours: Math.floor(Math.random() * 3) + 6,
            mood: Math.floor(Math.random() * 5) + 5,
        })
    }

    const { error: metricsError } = await supabase.from('metrics').upsert(metrics, { onConflict: 'user_id,date' })

    if (metricsError) {
        return NextResponse.json({ error: metricsError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Demo data loaded' })
}
