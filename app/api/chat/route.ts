import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const supabase = await createClient()
    const { message, userId } = await req.json()

    // Store user message
    const { error: insertError } = await supabase
        .from('conversations')
        .insert({
            user_id: userId,
            role: 'user',
            content: message,
        })

    if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    try {
        const llmEndpoint = process.env.LLM_ENDPOINT || 'http://127.0.0.1:11434/v1/chat/completions'
        const llmModel = process.env.LLM_MODEL || 'gemma2'

        // Fetch from local LLM
        const response = await fetch(llmEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: llmModel,
                messages: [
                    { role: 'system', content: 'You are a helpful health assistant avatar. You help users track their health, steps, water intake, and medication. Be concise, friendly, and motivating.' },
                    { role: 'user', content: message }
                ],
                stream: true,
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('LLM Error:', errorText)
            throw new Error(`LLM responded with ${response.status}: ${errorText}`)
        }

        const encoder = new TextEncoder()
        const decoder = new TextDecoder()
        const reader = response.body?.getReader()

        if (!reader) {
            throw new Error('No response body from LLM')
        }

        let fullResponse = ''

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    while (true) {
                        const { done, value } = await reader.read()
                        if (done) break

                        const chunk = decoder.decode(value, { stream: true })
                        const lines = chunk.split('\n').filter(line => line.trim() !== '')

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6)
                                if (data === '[DONE]') continue

                                try {
                                    const json = JSON.parse(data)
                                    const content = json.choices[0]?.delta?.content || ''
                                    if (content) {
                                        fullResponse += content
                                        controller.enqueue(encoder.encode(content))
                                    }
                                } catch (e) {
                                    console.error('Error parsing JSON chunk', e)
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error('Stream error:', err)
                    controller.error(err)
                } finally {
                    // Store assistant message when done
                    if (fullResponse) {
                        await supabase
                            .from('conversations')
                            .insert({
                                user_id: userId,
                                role: 'assistant',
                                content: fullResponse,
                            })
                    }
                    controller.close()
                }
            },
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        })

    } catch (error: any) {
        console.error('Chat API Error:', error)

        // Mock streaming response (Fallback)
        const mockResponse = "I'm currently in offline mode (Mock). My brain (LLM) seems disconnected, but I can still chat! How are you feeling?"
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
            async start(controller) {
                const tokens = mockResponse.split(' ')
                for (const token of tokens) {
                    controller.enqueue(encoder.encode(token + ' '))
                    await new Promise((resolve) => setTimeout(resolve, 100))
                }
                controller.close()
            },
        })

        // Store fallback message
        await supabase.from('conversations').insert({
            user_id: userId,
            role: 'assistant',
            content: mockResponse,
        })

        return new Response(stream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
    }
}
