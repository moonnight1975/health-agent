'use client'

import { Player } from '@lottiefiles/react-lottie-player'

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
