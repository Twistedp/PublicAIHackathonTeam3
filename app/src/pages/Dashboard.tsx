import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import recordsData from "../data/records.json"
import type { ProjectRecord } from "../types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const records = recordsData as ProjectRecord[]

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [audienceFilter, setAudienceFilter] = useState("")
  const [carrierFilter, setCarrierFilter] = useState("")
  const [titleFilter, setTitleFilter] = useState("")
  const [startDateFilter, setStartDateFilter] = useState("")
  const [endDateFilter, setEndDateFilter] = useState("")

  const navigate = useNavigate()

  // Get unique values for dropdowns
  const uniqueLocations = useMemo(() => Array.from(new Set(records.map((r) => r.hauptprojektstandort).filter(Boolean))), [])
  const uniqueCarriers = useMemo(() => Array.from(new Set(records.map((r) => r.projekttraeger).filter(Boolean))), [])
  const uniqueTitles = useMemo(() => Array.from(new Set(records.map((r) => r.projekttitel).filter(Boolean))), [])

  // Filter records based on state
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.projekttitel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.projektnummer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.projektmassnahmen_gliner_kandidaten.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesLocation = locationFilter ? record.hauptprojektstandort === locationFilter : true
      const matchesCarrier = carrierFilter ? record.projekttraeger === carrierFilter : true
      const matchesTitle = titleFilter ? record.projekttitel === titleFilter : true

      const matchesAudience = audienceFilter
        ? record.zielgruppe_gliner_kandidaten.some((z) => z.toLowerCase().includes(audienceFilter.toLowerCase()))
        : true

      // Date filtering logic: checks if the project timeframe overlaps or falls within the specified dates.
      let matchesStartDate = true
      if (startDateFilter) {
        // Project ends after the filter start date
        matchesStartDate = record.laufzeit_ende >= startDateFilter
      }

      let matchesEndDate = true
      if (endDateFilter) {
        // Project starts before the filter end date
        matchesEndDate = record.laufzeit_beginn <= endDateFilter
      }

      return matchesSearch && matchesLocation && matchesAudience && matchesCarrier && matchesTitle && matchesStartDate && matchesEndDate
    })
  }, [searchTerm, locationFilter, audienceFilter, carrierFilter, titleFilter, startDateFilter, endDateFilter])

  return (
    <div className="min-h-screen bg-muted/20 p-8 font-sans">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-2 border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Bundeskanzleramt Projektdatenbank</h1>
          <p className="text-muted-foreground">Offizielles Dashboard zur Verwaltung und Filterung von Förderprojekten.</p>
        </header>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search measures or IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-1 flex flex-col">
              <label className="text-sm font-medium">Project Title</label>
              <select
                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
              >
                <option value="">All Titles</option>
                {uniqueTitles.map((title) => (
                  <option key={title} value={title}>
                    {title.length > 40 ? title.substring(0, 40) + '...' : title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 flex flex-col">
              <label className="text-sm font-medium">Project Carrier (Träger)</label>
              <select
                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={carrierFilter}
                onChange={(e) => setCarrierFilter(e.target.value)}
              >
                <option value="">All Carriers</option>
                {uniqueCarriers.map((carrier) => (
                  <option key={carrier} value={carrier}>
                    {carrier}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 flex flex-col">
              <label className="text-sm font-medium">Location</label>
              <select
                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="">All Locations</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Target Audience</label>
              <Input
                placeholder="e.g. Migrationshintergrund"
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Start Date (From)</label>
              <Input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">End Date (To)</label>
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
                Clear Filters
              </button>
            </div>

          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Results <Badge variant="secondary" className="ml-2">{filteredRecords.length}</Badge>
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredRecords.map((record) => (
              <Card key={record.projektnummer} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg leading-tight">{record.projekttitel}</CardTitle>
                      <CardDescription>
                        {record.projektnummer} • {record.projekttraeger}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {record.hauptprojektstandort}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Duration</span>
                      {record.laufzeit_beginn} to {record.laufzeit_ende}
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Fulfillment</span>
                      <div className="flex items-center gap-2">
                        <span>{record.hauptindikator_erfuellung_prozent}%</span>
                        <div className="h-2 w-full max-w-[100px] overflow-hidden rounded-full bg-secondary">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${Math.min(record.hauptindikator_erfuellung_prozent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider block">Target Audiences</span>
                    <div className="flex flex-wrap gap-1">
                      {record.zielgruppe_gliner_kandidaten.slice(0, 5).map((aud, i) => (
                        <Badge key={i} variant="secondary" className="text-xs font-normal">
                          {aud}
                        </Badge>
                      ))}
                      {record.zielgruppe_gliner_kandidaten.length > 5 && (
                        <Badge variant="secondary" className="text-xs font-normal">
                          +{record.zielgruppe_gliner_kandidaten.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider block">Key Measures</span>
                    <div className="flex flex-wrap gap-1">
                      {record.projektmassnahmen_gliner_kandidaten.slice(0, 5).map((measure, i) => (
                        <Badge key={i} variant="outline" className="text-xs font-normal bg-background">
                          {measure}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 pb-4 px-6 border-t mt-auto">
                  <Button onClick={() => navigate(`/project/${encodeURIComponent(record.projektnummer)}`)} variant="outline" className="w-full mt-4">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {filteredRecords.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                No projects found matching your filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
