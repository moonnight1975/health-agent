import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the most recent metric entry
    const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
        .single()

    if (error) {
        // If no data found, return a default empty structure or 404
        if (error.code === 'PGRST116') {
            return NextResponse.json({
                steps: 0,
                water_ml: 0,
                sleep_hours: 0,
                mood: 5
            })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
