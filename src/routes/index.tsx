import { createFileRoute, Link } from '@tanstack/react-router'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Map, Swords, Coins, Check, ChevronRight, ShieldCheck, BarChart3, Sun, Moon } from 'lucide-react'

// Define the root route
export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark')

  return (
    <div className="relative bg-background text-foreground transition-colors duration-300 font-sans min-h-screen flex flex-col selection:bg-primary/20">
      
      {/* Subtle Grid Background (Spans full screen) */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* FULL WIDTH NAVIGATION */}
      <nav className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary">
              Damra App
            </div>
            <div className="hidden md:flex space-x-8 text-sm font-medium text-muted-foreground">
              <a href="#paths" className="hover:text-primary transition-colors">Learning Paths</a>
              <a href="#battles" className="hover:text-primary transition-colors">Arena</a>
              <a href="#schools" className="hover:text-primary transition-colors">For Schools</a>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 text-sm font-medium">
              
              {/* Dark/Light Mode Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-[0.95]"
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
              </button>

              <Link to="/auth/login" className="hidden hover:bg-muted rounded-lg md:block px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">
                Log In
              </Link>
              <Link to="/auth/register" className="bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-lg shadow-xs transition-all active:scale-[0.97]">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* BORDERED BODY WRAPPER */}
      <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full border-x border-border shadow-[0_0_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_40px_-15px_rgba(0,0,0,0.2)]">
        
        {/* HERO SECTION */}
        <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-24 overflow-hidden px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-sm font-medium rounded-full bg-primary/10 text-primary border border-primary/20 backdrop-blur-xs">
              <span className="flex h-2 w-2 rounded-full bg-primary" />
              Damra App 1.0 is on development mode
            </div>

            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 text-foreground">
              Learn like a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">Genius.</span><br />
              Compete like a <span className="text-muted-foreground">Champion.</span>
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Conquer structured learning paths, unlock epic achievements, and wager your knowledge in real-time multiplayer arenas.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="h-12 px-6 text-base font-semibold">
                <Link to="/auth/login" className="flex items-center gap-2">
                  Start Your Journey <ChevronRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base font-semibold">
                <a href="#paths">
                  Explore Platform
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* HORIZONTAL DIVIDER */}
        <div className="relative flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="absolute h-[1px] w-1/4 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 blur-[1px]" />
        </div>

        {/* FEATURES GRID */}
        <section id="paths" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Engineered for Mastery</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Powered by a robust assessment engine, Damra combines structured curriculum with high-stakes gamification.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-card/80 backdrop-blur-sm border border-border p-8 rounded-2xl transition-all group">
              <div className="size-12 bg-muted border border-border rounded-xl flex items-center justify-center mb-6">
                <Map className="size-6 text-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Interactive Paths</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Follow curated maps designed by educators. Complete nodes, earn XP, and master complex subjects step-by-step.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card/80 backdrop-blur-sm border border-border p-8 rounded-2xl transition-all group">
              <div className="size-12 bg-muted border border-border rounded-xl flex items-center justify-center mb-6">
                <Swords className="size-6 text-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Multiplayer Battles</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Host or join live battle rooms. Pay the entry fee, race against the clock, and take the prize pool if you rank first.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card/80 backdrop-blur-sm border border-border p-8 rounded-2xl transition-all group">
              <div className="size-12 bg-muted border border-border rounded-xl flex items-center justify-center mb-6">
                <Coins className="size-6 text-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Rich Economy</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every answer matters. Grind for XP to unlock exclusive badges and accumulate coins to enter global admin contests.
              </p>
            </div>
          </div>
        </section>

        {/* SECOND TAILWIND STYLE HORIZONTAL DIVIDER */}
        <div className="relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
        </div>

        {/* B2B / SCHOOLS SECTION */}
        <section id="schools" className="py-16 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl font-bold tracking-tight text-foreground mb-6">
                Built for Institutions.<br/>
                <span className="text-muted-foreground">Secured for Students.</span>
              </h2>
              <ul className="space-y-6 mt-8">
                <li className="flex items-start">
                  <div className="mt-1 bg-muted border border-border rounded-md p-1.5 mr-4 shrink-0">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-foreground mb-1">Verified Grade Locking</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">Keep exams secure. Students must be authenticated and verified to enter specific grade-level content.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 bg-muted border border-border rounded-md p-1.5 mr-4 shrink-0">
                    <Check className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-foreground mb-1">Blind Grading & Feedback</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">Review individual exam attempts, award marks for open-ended questions, and leave personalized insights.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 bg-muted border border-border rounded-md p-1.5 mr-4 shrink-0">
                    <BarChart3 className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-foreground mb-1">Isolated Tenant Environments</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">Custom dashboards, role-based access control (RBAC), and leaderboards segmented perfectly by school.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* FULL WIDTH FOOTER */}
      <footer className="w-full bg-card/50 backdrop-blur-sm border-t border-border relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
            Built with Drive, Guide by Dream 
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Damra App. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}