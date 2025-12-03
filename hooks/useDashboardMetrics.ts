import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'

export interface Metric {
    id: string
    user_id: string
    date: string
    steps: number
    water_ml: number
    sleep_hours: number
    mood: number
    created_at: string
}

export function useDashboardMetrics() {
    const supabase = createClient()

    return useQuery({
        queryKey: ['dashboard-metrics'],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('No session')

            const response = await fetch('/api/metrics/latest')
            if (!response.ok) {
                throw new Error('Failed to fetch metrics')
            }
            return response.json() as Promise<Metric>
        }
    })
}
