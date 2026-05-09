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
    <div className="min-h-screen bg-muted/20 p-4 md:p-6 font-sans">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3 mb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-primary uppercase">Integrationsförderung Projektdatenbank</h1>
            <p className="text-sm text-muted-foreground">Offizielles Dashboard zur Verwaltung und Filterung von Förderprojekten.</p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-1 text-sm shadow-sm" title="Development Feature: Choose Data Source">
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 text-[10px] px-1 h-4 uppercase font-bold">Dev</Badge>
                <Database className="h-4 w-4 text-amber-600" />
              </div>
              <select
                className="bg-transparent border-none focus:ring-0 text-sm font-medium text-amber-900"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
              >
                {availableSources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
            <Button onClick={() => navigate("/upload")} variant="outline" className="gap-2 shrink-0 border-primary/30 text-primary hover:bg-primary/5">
              <Plus className="h-4 w-4" /> Projekt Hochladen
            </Button>
          </div>

        </header>

        {/* Intelligente KI-Suche CTA */}
        <div className="bg-primary/[0.03] border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm mb-2">
          <div className="flex items-center gap-5">
            <div className="bg-primary/10 p-4 rounded-2xl">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-primary tracking-tight">Intelligente KI-Suche</h3>
              <p className="text-muted-foreground max-w-lg">
                Finden Sie Projekte durch natürliche Sprache. Suchen Sie nach Inhalten wie "Jugendliche in Graz" oder "Deutschkurse der Caritas".
              </p>
            </div>
          </div>
          <Button 
            onClick={() => navigate("/search")} 
            className="gap-2 px-10 h-12 text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full md:w-auto rounded-full"
          >
            <Sparkles className="h-5 w-5" /> KI-Suche öffnen
          </Button>
        </div>

        {/* Filters */}
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-5">
            <CardTitle className="text-base">Filter</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-5 pb-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">Suche</label>
              <Input
                className="h-8 text-sm"
                placeholder="Suche nach Maßnahmen oder IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-1 flex flex-col">
              <label className="text-xs font-medium">Projekttitel</label>
              <select
                className="flex h-8 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
              >
                <option value="">Alle Titel</option>
                {uniqueTitles.map((title) => (
                  <option key={title} value={title}>
                    {title.length > 30 ? title.substring(0, 30) + '...' : title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 flex flex-col">
              <label className="text-xs font-medium">Projektträger</label>
              <select
                className="flex h-8 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
              <label className="text-xs font-medium">Standort</label>
              <select
                className="flex h-8 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
              <label className="text-xs font-medium">Zielgruppe</label>
              <Input
                className="h-8 text-sm"
                placeholder="z.B. Migrationshintergrund"
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Startdatum (Von)</label>
              <Input
                className="h-8 text-sm"
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Enddatum (Bis)</label>
              <Input
                className="h-8 text-sm"
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
              />
            </div>

            <div className="flex items-end pb-1.5">
              <button 
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
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
        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Ergebnisse <Badge variant="secondary" className="ml-2 text-xs">{filteredRecords.length}</Badge>
          </h2>

          <div className="grid gap-3 md:grid-cols-2">
            {filteredRecords.map((record) => {
              const isOngoing = record.laufzeit_ende >= today

              return (
                <Card 
                  key={record.projektnummer} 
                  className={`flex flex-col transition-all duration-300 shadow-sm ${
                    isOngoing 
                      ? "border-green-200 bg-green-50/30" 
                      : "opacity-80 grayscale-[0.2]"
                  }`}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 mb-0.5">
                          <CardTitle className="text-base leading-tight">{record.projekttitel}</CardTitle>
                          {isOngoing ? (
                            <Badge className="bg-green-600 hover:bg-green-700 text-white border-none text-[9px] h-4.5 px-1 uppercase">Laufend</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[9px] h-4.5 px-1 uppercase">Abgeschlossen</Badge>
                          )}
                        </div>
                        <CardDescription className="text-xs">
                          {record.projektnummer} • {record.projekttraeger}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="shrink-0 bg-background/50 text-[10px] px-1.5">
                        {record.hauptprojektstandort}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3 p-4 pt-2">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">Laufzeit</span>
                        {record.laufzeit_beginn} bis {record.laufzeit_ende}
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">Zielerreichung</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{record.hauptindikator_erfuellung_prozent}%</span>
                          <div className="h-1.5 w-full max-w-[80px] overflow-hidden rounded-full bg-secondary">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${Math.min(Number(record.hauptindikator_erfuellung_prozent) || 0, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">Zielgruppen</span>
                      <div className="flex flex-wrap gap-1">
                        {ensureArray(record.zielgruppe_gliner_kandidaten).slice(0, 4).map((aud, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] font-normal py-0">
                            {aud}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">Kernmaßnahmen</span>
                      <div className="flex flex-wrap gap-1">
                        {ensureArray(record.projektmassnahmen_gliner_kandidaten).slice(0, 4).map((measure, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] font-normal bg-background py-0">
                            {measure}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 pb-3 px-4 border-t mt-auto">
                    <Button onClick={() => navigate(`/project/${encodeURIComponent(record.projektnummer)}`)} variant="ghost" size="sm" className="w-full mt-2 text-xs">
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
