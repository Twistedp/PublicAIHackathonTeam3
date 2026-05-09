import { useParams, useNavigate } from "react-router-dom"
import recordsData from "../data/records.json"
import masterRecordsData from "../data/master_records.json"
import extractedProjectsData from "../data/extracted_projects.json"
import type { ProjectRecord } from "../types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const allRecords = [
  ...(recordsData as unknown as ProjectRecord[]),
  ...(masterRecordsData as unknown as ProjectRecord[]),
  ...(extractedProjectsData as unknown as ProjectRecord[])
]

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
  const project = allRecords.find(r => r.projektnummer === decodedId)

  if (!project) {
    return (
      <div className="min-h-screen bg-muted/20 p-4 md:p-6 font-sans flex flex-col items-center justify-center space-y-4">
        <h1 className="text-xl font-bold">Projekt nicht gefunden</h1>
        <Button size="sm" onClick={() => navigate("/")}>Zurück zum Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-6 font-sans">
      <div className="mx-auto max-w-4xl space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/")} className="mb-2">
          &larr; Zurück
        </Button>
        
        <header className="space-y-1.5 border-b pb-3 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] font-medium uppercase">{project.projektnummer}</Badge>
            <Badge variant="secondary" className="text-[10px] uppercase">{project.hauptprojektstandort}</Badge>
            {project.laufzeit_ende >= today ? (
              <Badge className="bg-green-600 hover:bg-green-700 text-white border-none text-[10px] px-1.5 h-5 uppercase">Laufend</Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] px-1.5 h-5 uppercase">Abgeschlossen</Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">{project.projekttitel}</h1>
          <p className="text-base text-muted-foreground">Träger: {project.projekttraeger}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-5">
              <CardTitle className="text-base">Projektübersicht</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">Startdatum</span>
                  <span className="font-medium">{project.laufzeit_beginn}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">Enddatum</span>
                  <span className="font-medium">{project.laufzeit_ende}</span>
                </div>
              </div>
              
              <div className="space-y-1.5 pt-3 border-t">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">Zielgruppen</span>
                <div className="flex flex-wrap gap-1">
                  {ensureArray(project.zielgruppe_gliner_kandidaten).map((aud, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px] font-normal py-0">{aud}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">Kernmaßnahmen</span>
                <div className="flex flex-wrap gap-1">
                  {ensureArray(project.projektmassnahmen_gliner_kandidaten).map((measure, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] font-normal bg-background py-0">{measure}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="py-3 px-5">
              <CardTitle className="text-base">Zielerreichung</CardTitle>
              <CardDescription className="text-[11px] leading-tight">{project.hauptindikator_name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-md text-center">
                  <span className="block text-[10px] uppercase text-muted-foreground mb-0.5">Soll</span>
                  <span className="text-xl font-bold">{project.hauptindikator_soll}</span>
                </div>
                <div className="p-3 bg-muted/50 rounded-md text-center">
                  <span className="block text-[10px] uppercase text-muted-foreground mb-0.5">Ist</span>
                  <span className="text-xl font-bold">{project.hauptindikator_ist}</span>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">Erfüllungsgrad</span>
                  <span className="font-bold text-primary">{project.hauptindikator_erfuellung_prozent}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-secondary border-none">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-in-out" 
                    style={{ width: `${Math.min(Number(project.hauptindikator_erfuellung_prozent) || 0, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 shadow-sm">
            <CardHeader className="py-3 px-5">
              <CardTitle className="text-base">Beschreibungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-4">
              <div className="space-y-1.5">
                <h3 className="font-semibold text-sm border-b pb-1">Auszug Zielgruppe</h3>
                <p className="text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {project.zielgruppe_beste_textstelle}
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-semibold text-sm border-b pb-1">Auszug Maßnahmen</h3>
                <p className="text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
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
