import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ArrowRight, Trophy, BrainCircuit, Gamepad2, Swords } from 'lucide-react'

// Define the root route
export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 transition-colors">
      
      {/* Top Navigation - Flat, no bottom border */}
      <header className="flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-7 w-7 text-primary" />
          <span className="text-2xl font-extrabold tracking-tight">Damra</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link to="/auth/login" className="text-sm font-bold text-neutral-500 hover:text-primary dark:text-neutral-400 transition-colors">
            Sign in
          </Link>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 font-bold shadow-none">
            <Link to="/auth/login">
              Start Playing
            </Link>
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
        <div className="max-w-3xl space-y-8">
          
          {/* Flat Pill Indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
            New Quizzes Added Daily
          </div>

          {/* Solid, flat typography */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-neutral-900 dark:text-white">
            Learn Faster. <br className="hidden md:block" /> Compete Harder.
          </h1>

          <p className="text-lg md:text-xl text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Master new subjects through bite-sized lessons, challenge friends in real-time trivia battles, and climb the global leaderboard. Education meets intense competition.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            {/* Flat Primary Button */}
            <Button asChild size="lg" className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl h-14 px-8 text-base font-bold shadow-none">
              <Link to="/auth/login">
                Jump into the Arena <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            {/* Flat Secondary Button */}
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto gap-2 rounded-2xl h-14 px-8 text-base font-bold border-0 shadow-none bg-neutral-200 text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700">
              <Link to="/super-admin/check-health">
                Admin Portal
              </Link>
            </Button>
          </div>
        </div>

        {/* Feature Highlights - Flat background cards, no borders, no shadows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-24 text-left">
          
          <div className="space-y-4 p-8 rounded-3xl bg-neutral-200/50 dark:bg-neutral-900/50">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Gamepad2 className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">Bite-Sized Mastery</h3>
            <p className="text-neutral-600 dark:text-neutral-400 font-medium">
              Progress through structured, gamified learning paths designed to keep you hooked and retain knowledge effortlessly.
            </p>
          </div>

          <div className="space-y-4 p-8 rounded-3xl bg-neutral-200/50 dark:bg-neutral-900/50">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Swords className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">Elite Quiz Battles</h3>
            <p className="text-neutral-600 dark:text-neutral-400 font-medium">
              Test your skills against other learners in high-stakes, real-time multiplayer quiz showdowns.
            </p>
          </div>

          <div className="space-y-4 p-8 rounded-3xl bg-neutral-200/50 dark:bg-neutral-900/50">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Trophy className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">Global Leaderboards</h3>
            <p className="text-neutral-600 dark:text-neutral-400 font-medium">
              Earn XP, unlock premium badges, maintain your daily streak, and fight for the number one spot.
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}