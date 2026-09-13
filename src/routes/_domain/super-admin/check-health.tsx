import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CheckCircle2, AlertTriangle, Loader2, RefreshCw } from "lucide-react"
import { healthApi } from "@/api/health"

// Update the route path to perfectly match the file structure
export const Route = createFileRoute('/_domain/super-admin/check-health')({
  component: CheckHealthPage,
})

function CheckHealthPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<string | null>(null)

  const checkHealth = async () => {
    setStatus("loading")
    setError(null)
    try {
      const data = await healthApi.checkHealth()
      setResponse(data)
      setStatus("success")
      setLastChecked(new Date().toLocaleTimeString())
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to connect to the server")
      setStatus("error")
      setLastChecked(new Date().toLocaleTimeString())
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-900 dark:text-slate-50">
      <div className="flex w-full max-w-md flex-col gap-6">
        
        {/* Welcome Section */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Project Ready
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Damra Admin App
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            A state-of-the-art admin interface connected to your secure authentication services.
          </p>
        </div>

        {/* Health Checker Card */}
        <Card className="overflow-hidden transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-500 dark:text-emerald-400 animate-pulse" />
                  API Health Status
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Verify real-time status of the backend API
                </CardDescription>
              </div>
              
              {status === "success" && (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25">
                  Online
                </Badge>
              )}
              {status === "error" && (
                <Badge variant="destructive" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/25">
                  Offline
                </Badge>
              )}
              {status === "idle" && (
                <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  Unchecked
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Status Display */}
            <div className="rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20 p-4 transition-all duration-300">
              {status === "idle" && (
                <div className="flex flex-col items-center justify-center py-6 text-center text-slate-500 dark:text-slate-400 space-y-2">
                  <Activity className="h-8 w-8 text-slate-400 dark:text-slate-600" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">No status data available yet. Run a check to fetch.</p>
                </div>
              )}

              {status === "loading" && (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                  <Loader2 className="h-8 w-8 text-emerald-500 dark:text-emerald-400 animate-spin" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 animate-pulse">Contacting backend services...</p>
                </div>
              )}

              {status === "success" && response && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span className="font-semibold text-sm">Connection Successful</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-mono bg-white/70 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                    <div><span className="text-slate-400 dark:text-slate-500">endpoint:</span> /api/health</div>
                    <div><span className="text-slate-400 dark:text-slate-500">response:</span> {JSON.stringify(response)}</div>
                    {lastChecked && (
                      <div><span className="text-slate-400 dark:text-slate-500">timestamp:</span> {lastChecked}</div>
                    )}
                  </div>
                </div>
              )}

              {status === "error" && error && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <span className="font-semibold text-sm">Connection Error</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-mono bg-white/70 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                    <div className="text-rose-500 dark:text-rose-400/90"><span className="text-slate-400 dark:text-slate-500">error:</span> {error}</div>
                    {lastChecked && (
                      <div><span className="text-slate-400 dark:text-slate-500">failed at:</span> {lastChecked}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Trigger Button */}
            <Button 
              onClick={checkHealth}
              disabled={status === "loading"}
              className="w-full relative overflow-hidden bg-primary hover:bg-primary/90 text-white rounded-lg !h-12 text-base font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none group"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              
              <span className="relative flex items-center justify-center gap-2">
                {status === "loading" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <RefreshCw className="h-5 w-5 transition-transform group-hover:rotate-180 duration-500" />
                )}
                {status === "idle" ? "Verify API Connection" : "Run Diagnostics Again"}
              </span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Global styles for the button shimmer effect */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}