import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, ArrowLeft, Sparkles, Loader2, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function NLSearch() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:8000/nl-filter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) throw new Error("Search failed")

      const filters = await response.json()
      
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value as string)
        }
      })

      navigate(`/?${params.toString()}`)
    } catch (error) {
      console.error("Error:", error)
      alert("Fehler bei der Suche. Bitte versuchen Sie es erneut.")
    } finally {
      setIsLoading(false)
    }
  }

  const suggestions = [
    "Welche Projekte führt die Caritas aktuell durch?",
    "Deutschkurse für Frauen in Graz ab September 2024.",
    "Projekte für Jugendliche mit Schwerpunkt Sport in Wien.",
    "Laufende Integrationsprojekte im Burgenland."
  ]

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-primary/10">
      {/* Abstract background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8 md:py-12 flex flex-col min-h-screen">
        <header className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")} 
            className="group gap-2 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> 
            Dashboard
          </Button>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">AI Powered</span>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center -mt-8">
          <div className="text-center space-y-3 mb-8 max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600">
              Wie kann ich Ihnen helfen?
            </h1>
            <p className="text-base md:text-lg text-slate-500 leading-relaxed">
              Suchen Sie in natürlicher Sprache nach Projekten, Standorten oder Zielgruppen.
            </p>
          </div>

          <Card className="w-full bg-white/70 backdrop-blur-xl border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500 focus-within:shadow-[0_20px_50px_rgba(0,0,0,0.1)] focus-within:border-primary/30">
            <CardContent className="p-1">
              <form onSubmit={handleSubmit} className="relative">
                <textarea
                  className="w-full min-h-[80px] md:min-h-[100px] p-4 text-base bg-transparent outline-none resize-none placeholder:text-slate-300 transition-all"
                  placeholder="Beschreiben Sie Ihre Suche..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSubmit(e);
                    }
                  }}
                  disabled={isLoading}
                />
                <div className="flex items-center justify-between p-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <kbd className="px-2 py-1 bg-slate-100 rounded text-[9px] font-bold tracking-widest uppercase">⌘ + Enter</kbd>
                    <span>zum Senden</span>
                  </div>
                  <Button 
                    type="submit" 
                    className="h-10 px-6 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:translate-y-0"
                    disabled={isLoading || !query.trim()}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold">Suchen</span>
                        <Search className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 w-full max-w-3xl">
            <div className="flex items-center gap-2 mb-4 text-slate-400">
              <Lightbulb className="h-3.5 w-3.5" />
              <span className="text-xs font-medium uppercase tracking-widest">Inspiration</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(s)}
                  className="text-left p-3.5 rounded-xl bg-white border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group shadow-sm hover:shadow-md"
                >
                  <p className="text-xs text-slate-600 group-hover:text-primary transition-colors leading-relaxed">
                    "{s}"
                  </p>
                </button>
              ))}
            </div>
          </div>
        </main>

        <footer className="py-6 text-center text-slate-400 text-[10px] tracking-widest uppercase mt-8">
          Bundeskanzleramt Projektdatenbank • Intelligent Search Engine
        </footer>
      </div>
    </div>
  )
}
