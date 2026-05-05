import { useParams, useNavigate } from "react-router-dom"
import recordsData from "../data/records.json"
import type { ProjectRecord } from "../types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const records = recordsData as unknown as ProjectRecord[]

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const today = new Date().toISOString().split("T")[0]

  // Helper to ensure we have an array of strings
  const ensureArray = (val: string | string[]): string[] => {
    if (!val) return []
    if (Array.isArray(val)) return val
    return val.split(";").map(s => s.trim()).filter(Boolean)
  }

  // Need to decode since the ID might contain slashes and get encoded
  const decodedId = id ? decodeURIComponent(id) : ""
  const project = records.find(r => r.projektnummer === decodedId)

  if (!project) {
    return (
      <div className="min-h-screen bg-muted/20 p-8 font-sans flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">Projekt nicht gefunden</h1>
        <Button onClick={() => navigate("/")}>Zurück zum Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20 p-8 font-sans">
      <div className="mx-auto max-w-4xl space-y-6">
        <Button variant="outline" onClick={() => navigate("/")} className="mb-4">
          &larr; Zurück zum Dashboard
        </Button>
        
        <header className="space-y-2 border-b pb-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="text-sm font-medium">{project.projektnummer}</Badge>
            <Badge variant="secondary" className="text-sm">{project.hauptprojektstandort}</Badge>
            {project.laufzeit_ende >= today ? (
              <Badge className="bg-green-600 hover:bg-green-700 text-white border-none text-xs px-2 uppercase">Laufend</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs px-2 uppercase">Abgeschlossen</Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">{project.projekttitel}</h1>
          <p className="text-lg text-muted-foreground">Träger: {project.projekttraeger}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Projektübersicht</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Startdatum</span>
                  <span className="font-medium">{project.laufzeit_beginn}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Enddatum</span>
                  <span className="font-medium">{project.laufzeit_ende}</span>
                </div>
              </div>
              
              <div className="space-y-2 pt-4 border-t">
                <span className="text-muted-foreground text-xs uppercase tracking-wider block">Zielgruppen</span>
                <div className="flex flex-wrap gap-2">
                  {ensureArray(project.zielgruppe_gliner_kandidaten).map((aud, i) => (
                    <Badge key={i} variant="secondary" className="font-normal">{aud}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <span className="text-muted-foreground text-xs uppercase tracking-wider block">Kernmaßnahmen</span>
                <div className="flex flex-wrap gap-2">
                  {ensureArray(project.projektmassnahmen_gliner_kandidaten).map((measure, i) => (
                    <Badge key={i} variant="outline" className="font-normal bg-background">{measure}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zielerreichung Hauptindikator</CardTitle>
              <CardDescription>{project.hauptindikator_name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-md text-center">
                  <span className="block text-xs uppercase text-muted-foreground mb-1">Ziel (Soll)</span>
                  <span className="text-2xl font-bold">{project.hauptindikator_soll}</span>
                </div>
                <div className="p-4 bg-muted rounded-md text-center">
                  <span className="block text-xs uppercase text-muted-foreground mb-1">Ist-Zustand (Ist)</span>
                  <span className="text-2xl font-bold">{project.hauptindikator_ist}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Erfüllungsgrad</span>
                  <span className="font-bold text-primary">{project.hauptindikator_erfuellung_prozent}%</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-secondary border">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-in-out" 
                    style={{ width: `${Math.min(Number(project.hauptindikator_erfuellung_prozent) || 0, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Detaillierte Beschreibungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg border-b pb-2">Auszug Zielgruppe</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {project.zielgruppe_beste_textstelle}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg border-b pb-2">Auszug Maßnahmen</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {project.massnahmen_beste_textstelle}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
