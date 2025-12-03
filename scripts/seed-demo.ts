import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
    console.log('Seeding demo data...')

    // 1. Get a user (or create one if needed, but for this script we assume a user exists or we login)
    // For simplicity, we'll try to login with the test user
    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'valid.user.test@gmail.com',
        password: 'StrongPassword123!',
    })

    if (loginError || !user) {
        console.error('Login failed. Please ensure the test user exists.', loginError?.message)
        return
    }

    const userId = user.id
    console.log(`Seeding for user: ${userId}`)

    // 2. Insert Metrics (Past 7 days)
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]

        await supabase.from('metrics').upsert({
            user_id: userId,
            date: dateStr,
            steps: Math.floor(Math.random() * 5000) + 5000, // 5000-10000
            water_ml: Math.floor(Math.random() * 1000) + 1500, // 1500-2500
            sleep_hours: Math.floor(Math.random() * 3) + 6, // 6-9
            mood: Math.floor(Math.random() * 5) + 5, // 5-10
        }, { onConflict: 'user_id, date' })
    }
    console.log('Metrics seeded.')

    // 3. Insert Medications
    await supabase.from('medications').delete().eq('user_id', userId) // Clear old
    await supabase.from('medications').insert([
        { user_id: userId, name: 'Vitamin D', dose: '1000 IU', schedule_time: '08:00', active: false },
        { user_id: userId, name: 'Omega-3', dose: '500mg', schedule_time: '13:00', active: true },
        { user_id: userId, name: 'Magnesium', dose: '200mg', schedule_time: '21:00', active: true },
    ])
    console.log('Medications seeded.')

    // 4. Insert Conversations
    await supabase.from('conversations').insert([
        { user_id: userId, role: 'user', content: 'Hi, how are my steps this week?' },
        { user_id: userId, role: 'assistant', content: 'You have been doing great! You averaged 7,500 steps this week.' },
    ])
    console.log('Conversations seeded.')

    console.log('Done!')
}

seed()
