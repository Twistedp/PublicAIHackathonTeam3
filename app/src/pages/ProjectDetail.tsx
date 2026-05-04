import { useParams, useNavigate } from "react-router-dom"
import recordsData from "../data/records.json"
import type { ProjectRecord } from "../types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const records = recordsData as ProjectRecord[]

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  // Need to decode since the ID might contain slashes and get encoded
  const decodedId = id ? decodeURIComponent(id) : ""
  const project = records.find(r => r.projektnummer === decodedId)

  if (!project) {
    return (
      <div className="min-h-screen bg-muted/20 p-8 font-sans flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">Project not found</h1>
        <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20 p-8 font-sans">
      <div className="mx-auto max-w-4xl space-y-6">
        <Button variant="outline" onClick={() => navigate("/")} className="mb-4">
          &larr; Back to Dashboard
        </Button>
        
        <header className="space-y-2 border-b pb-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="text-sm font-medium">{project.projektnummer}</Badge>
            <Badge variant="secondary" className="text-sm">{project.hauptprojektstandort}</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">{project.projekttitel}</h1>
          <p className="text-lg text-muted-foreground">Carrier: {project.projekttraeger}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Start Date</span>
                  <span className="font-medium">{project.laufzeit_beginn}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">End Date</span>
                  <span className="font-medium">{project.laufzeit_ende}</span>
                </div>
              </div>
              
              <div className="space-y-2 pt-4 border-t">
                <span className="text-muted-foreground text-xs uppercase tracking-wider block">Target Audiences</span>
                <div className="flex flex-wrap gap-2">
                  {project.zielgruppe_gliner_kandidaten.map((aud, i) => (
                    <Badge key={i} variant="secondary" className="font-normal">{aud}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <span className="text-muted-foreground text-xs uppercase tracking-wider block">Key Measures</span>
                <div className="flex flex-wrap gap-2">
                  {project.projektmassnahmen_gliner_kandidaten.map((measure, i) => (
                    <Badge key={i} variant="outline" className="font-normal bg-background">{measure}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Indicator Fulfillment</CardTitle>
              <CardDescription>{project.hauptindikator_name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-md text-center">
                  <span className="block text-xs uppercase text-muted-foreground mb-1">Target (Soll)</span>
                  <span className="text-2xl font-bold">{project.hauptindikator_soll}</span>
                </div>
                <div className="p-4 bg-muted rounded-md text-center">
                  <span className="block text-xs uppercase text-muted-foreground mb-1">Actual (Ist)</span>
                  <span className="text-2xl font-bold">{project.hauptindikator_ist}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Fulfillment Rate</span>
                  <span className="font-bold text-primary">{project.hauptindikator_erfuellung_prozent}%</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-secondary border">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-in-out" 
                    style={{ width: `${Math.min(project.hauptindikator_erfuellung_prozent, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Detailed Descriptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg border-b pb-2">Target Audience Excerpt</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {project.zielgruppe_beste_textstelle}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg border-b pb-2">Measures Excerpt</h3>
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
