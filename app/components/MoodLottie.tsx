'use client'

import dynamic from 'next/dynamic'

const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then(mod => mod.Player), {
    ssr: false
})

export default function MoodLottie() {
    return (
        <div className="w-full h-full flex items-center justify-center opacity-80">
            <Player
                autoplay
                loop
                src="/mood.json"
                style={{ height: '100px', width: '100px' }}
            />
        </div>
    )
}
