import { useState, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Plus, Database, Sparkles } from "lucide-react"
import type { ProjectRecord } from "../types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import recordsData from "../data/records.json"
import masterRecordsData from "../data/master_records.json"
import extractedProjectsData from "../data/extracted_projects.json"

export default function Dashboard() {
  const [searchParams] = useSearchParams()

  const sourcesMap: Record<string, ProjectRecord[]> = {
    "master_records.json": masterRecordsData as unknown as ProjectRecord[],
    "records.json": recordsData as unknown as ProjectRecord[],
    "extracted_projects.json": extractedProjectsData as unknown as ProjectRecord[]
  }

  const [availableSources] = useState<string[]>(Object.keys(sourcesMap))
  const [selectedSource, setSelectedSource] = useState<string>("master_records.json")

  
  const records = useMemo(() => sourcesMap[selectedSource] || [], [selectedSource])

  const [searchTerm, setSearchTerm] = useState(searchParams.get("searchTerm") || "")
  const [locationFilter, setLocationFilter] = useState(searchParams.get("locationFilter") || "")
  const [audienceFilter, setAudienceFilter] = useState(searchParams.get("audienceFilter") || "")
  const [carrierFilter, setCarrierFilter] = useState(searchParams.get("carrierFilter") || "")
  const [titleFilter, setTitleFilter] = useState(searchParams.get("titleFilter") || "")
  const [startDateFilter, setStartDateFilter] = useState(searchParams.get("startDateFilter") || "")
  const [endDateFilter, setEndDateFilter] = useState(searchParams.get("endDateFilter") || "")

  const navigate = useNavigate()
  const today = useMemo(() => new Date().toISOString().split("T")[0], [])

  // Helper to ensure we have an array of strings
  const ensureArray = (val: string | string[]): string[] => {
    if (!val) return []
    if (Array.isArray(val)) return val
    return val.split(";").map(s => s.trim()).filter(Boolean)
  }

  // Get unique values for dropdowns
  const uniqueLocations = useMemo(() => Array.from(new Set(records.map((r) => r.hauptprojektstandort).filter(Boolean))), [records])
  const uniqueCarriers = useMemo(() => Array.from(new Set(records.map((r) => r.projekttraeger).filter(Boolean))), [records])
  const uniqueTitles = useMemo(() => Array.from(new Set(records.map((r) => r.projekttitel).filter(Boolean))), [records])

  // Filter records based on state
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const audiences = ensureArray(record.zielgruppe_gliner_kandidaten)
      const measures = ensureArray(record.projektmassnahmen_gliner_kandidaten)

      const matchesSearch =
        (record.projekttitel || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.projektnummer || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        measures.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesLocation = locationFilter ? record.hauptprojektstandort === locationFilter : true
      const matchesCarrier = carrierFilter ? record.projekttraeger === carrierFilter : true
      const matchesTitle = titleFilter ? record.projekttitel === titleFilter : true

      const matchesAudience = audienceFilter
        ? audiences.some((z) => z.toLowerCase().includes(audienceFilter.toLowerCase()))
        : true

      // Date filtering logic
      let matchesStartDate = true
      if (startDateFilter) {
        matchesStartDate = record.laufzeit_ende >= startDateFilter
      }

      let matchesEndDate = true
      if (endDateFilter) {
        matchesEndDate = record.laufzeit_beginn <= endDateFilter
      }

      return matchesSearch && matchesLocation && matchesAudience && matchesCarrier && matchesTitle && matchesStartDate && matchesEndDate
    })
  }, [records, searchTerm, locationFilter, audienceFilter, carrierFilter, titleFilter, startDateFilter, endDateFilter])

  return (
    <div className="min-h-screen bg-muted/20 p-8 font-sans">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 mb-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Bundeskanzleramt Projektdatenbank</h1>
            <p className="text-muted-foreground">Offizielles Dashboard zur Verwaltung und Filterung von Förderprojekten.</p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-1 text-sm shadow-sm">
              <Database className="h-4 w-4 text-muted-foreground" />
              <select
                className="bg-transparent border-none focus:ring-0 text-sm font-medium"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
              >
                {availableSources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
            <Button onClick={() => navigate("/search")} variant="outline" className="gap-2 shrink-0 border-primary/50 text-primary hover:bg-primary/5">
              <Sparkles className="h-4 w-4" /> KI-Suche
            </Button>
            <Button onClick={() => navigate("/upload")} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" /> Projekt Hochladen
            </Button>
          </div>
        </header>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Suche</label>
              <Input
                placeholder="Suche nach Maßnahmen oder IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-1 flex flex-col">
              <label className="text-sm font-medium">Projekttitel</label>
              <select
                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
              >
                <option value="">Alle Titel</option>
                {uniqueTitles.map((title) => (
                  <option key={title} value={title}>
                    {title.length > 40 ? title.substring(0, 40) + '...' : title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 flex flex-col">
              <label className="text-sm font-medium">Projektträger</label>
              <select
                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={carrierFilter}
                onChange={(e) => setCarrierFilter(e.target.value)}
              >
                <option value="">Alle Träger</option>
                {uniqueCarriers.map((carrier) => (
                  <option key={carrier} value={carrier}>
                    {carrier}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 flex flex-col">
              <label className="text-sm font-medium">Standort</label>
              <select
                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="">Alle Standorte</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Zielgruppe</label>
              <Input
                placeholder="z.B. Migrationshintergrund"
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Startdatum (Von)</label>
              <Input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Enddatum (Bis)</label>
              <Input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
              />
            </div>

            <div className="flex items-end pb-1">
              <button 
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
                onClick={() => {
                  setSearchTerm("")
                  setTitleFilter("")
                  setCarrierFilter("")
                  setLocationFilter("")
                  setAudienceFilter("")
                  setStartDateFilter("")
                  setEndDateFilter("")
                }}
              >
                Filter löschen
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Ergebnisse <Badge variant="secondary" className="ml-2">{filteredRecords.length}</Badge>
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredRecords.map((record) => {
              const isOngoing = record.laufzeit_ende >= today

              return (
                <Card 
                  key={record.projektnummer} 
                  className={`flex flex-col transition-all duration-300 ${
                    isOngoing 
                      ? "border-green-200 bg-green-50/30 shadow-sm" 
                      : "opacity-80 grayscale-[0.2]"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg leading-tight">{record.projekttitel}</CardTitle>
                          {isOngoing ? (
                            <Badge className="bg-green-600 hover:bg-green-700 text-white border-none text-[10px] h-5 px-1.5 uppercase">Laufend</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 uppercase">Abgeschlossen</Badge>
                          )}
                        </div>
                        <CardDescription>
                          {record.projektnummer} • {record.projekttraeger}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="shrink-0 bg-background/50">
                        {record.hauptprojektstandort}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Laufzeit</span>
                        {record.laufzeit_beginn} bis {record.laufzeit_ende}
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Zielerreichung</span>
                        <div className="flex items-center gap-2">
                          <span>{record.hauptindikator_erfuellung_prozent}%</span>
                          <div className="h-2 w-full max-w-[100px] overflow-hidden rounded-full bg-secondary">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${Math.min(Number(record.hauptindikator_erfuellung_prozent) || 0, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider block">Zielgruppen</span>
                      <div className="flex flex-wrap gap-1">
                        {ensureArray(record.zielgruppe_gliner_kandidaten).slice(0, 5).map((aud, i) => (
                          <Badge key={i} variant="secondary" className="text-xs font-normal">
                            {aud}
                          </Badge>
                        ))}
                        {ensureArray(record.zielgruppe_gliner_kandidaten).length > 5 && (
                          <Badge variant="secondary" className="text-xs font-normal">
                            +{ensureArray(record.zielgruppe_gliner_kandidaten).length - 5} weitere
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider block">Kernmaßnahmen</span>
                      <div className="flex flex-wrap gap-1">
                        {ensureArray(record.projektmassnahmen_gliner_kandidaten).slice(0, 5).map((measure, i) => (
                          <Badge key={i} variant="outline" className="text-xs font-normal bg-background">
                            {measure}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 pb-4 px-6 border-t mt-auto">
                    <Button onClick={() => navigate(`/project/${encodeURIComponent(record.projektnummer)}`)} variant="outline" className="w-full mt-4">
                      Details anzeigen
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
            
            {filteredRecords.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                Keine Projekte gefunden, die Ihren Filtern entsprechen.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
