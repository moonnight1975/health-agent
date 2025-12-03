import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, Heart, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center gap-2 font-bold text-xl" href="#">
          <Activity className="h-6 w-6 text-blue-600" />
          <span>Health Assist</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Login
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/signup">
            Sign Up
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                  Your Personal Health Companion
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Track your steps, water, medication, and mood. Chat with your AI health assistant anytime.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/signup">
                  <Button className="h-11 px-8 rounded-full bg-blue-600 hover:bg-blue-700">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="h-11 px-8 rounded-full">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold">Daily Tracking</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Monitor your steps, water intake, and sleep patterns effortlessly.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                  <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-bold">Health Insights</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Visualize your progress with beautiful charts and daily stats.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold">AI Assistant</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Chat with your personal health avatar for advice and motivation.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 Health Assist. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
