import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Upload, CheckCircle2, AlertCircle, FileText, Table as TableIcon, FileUp, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Category = "project_description" | "final_report" | "soll_indicators" | "ist_indicators"

interface FileMapping {
  key: Category
  label: string
  keywords: string[]
  matchedFile: File | null
  icon: typeof FileText
}

export default function UploadProject() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const [mappings, setMappings] = useState<FileMapping[]>([
    {
      key: "project_description",
      label: "Projektbeschreibung",
      keywords: ["projektbeschreibung"],
      matchedFile: null,
      icon: FileText,
    },
    {
      key: "final_report",
      label: "Inhaltlicher Endbericht",
      keywords: ["inhaltlicher endbericht", "endbericht"],
      matchedFile: null,
      icon: FileText,
    },
    {
      key: "soll_indicators",
      label: "Indikatorenblatt (SOLL)",
      keywords: ["indikatorenblatt", "soll", "indikatoren"],
      matchedFile: null,
      icon: TableIcon,
    },
    {
      key: "ist_indicators",
      label: "Indikatorenbericht (IST)",
      keywords: ["indikatorenbericht", "ist"],
      matchedFile: null,
      icon: TableIcon,
    },
  ])

  const matchFiles = useCallback((files: FileList) => {
    const newMappings = [...mappings]
    const fileArray = Array.from(files)

    fileArray.forEach((file) => {
      const fileName = file.name.toLowerCase()
      
      // 1. Check for IST (Indikatorenbericht) first because it's more specific
      const istMapping = newMappings.find(m => m.key === "ist_indicators")
      if (istMapping && !istMapping.matchedFile && istMapping.keywords.some(k => fileName.includes(k))) {
        istMapping.matchedFile = file
        return
      }

      // 2. Check for other mappings (including SOLL which has "indikatoren")
      for (const mapping of newMappings) {
        if (mapping.key === "ist_indicators") continue // Already handled
        if (mapping.keywords.some(keyword => fileName.includes(keyword))) {
          if (!mapping.matchedFile) {
            mapping.matchedFile = file
            break
          }
        }
      }
    })

    setMappings(newMappings)
  }, [mappings])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      matchFiles(e.target.files)
    }
  }

  const clearMapping = (key: Category) => {
    setMappings(prev => prev.map(m => m.key === key ? { ...m, matchedFile: null } : m))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const missing = mappings.filter(m => !m.matchedFile)
    if (missing.length > 0) {
      setResult({ 
        success: false, 
        message: `Bitte laden Sie alle erforderlichen Dateien hoch. Fehlend: ${missing.map(m => m.label).join(", ")}` 
      })
      return
    }

    setLoading(true)
    setResult(null)

    const formData = new FormData()
    mappings.forEach(m => {
      if (m.matchedFile) {
        formData.append(m.key, m.matchedFile)
      }
    })

    try {
      const response = await fetch("http://localhost:8000/upload-project", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: `Erfolgreich hochgeladen! Bundle ID: ${data.bundle_id}. Die Dokumente werden nun verarbeitet.`,
        })
        // Reset mappings on success
        setMappings(prev => prev.map(m => ({ ...m, matchedFile: null })))
      } else {
        setResult({
          success: false,
          message: data.detail || "Fehler beim Hochladen der Dokumente.",
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Netzwerkfehler. Stellen Sie sicher, dass die Backend-API unter http://localhost:8000 läuft.",
      })
    } finally {
      setLoading(false)
    }
  }

  const allMatched = mappings.every(m => m.matchedFile !== null)

  return (
    <div className="min-h-screen bg-muted/20 p-8 font-sans">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="flex items-center gap-4 border-b pb-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Projekt Hochladen</h1>
            <p className="text-muted-foreground">Dateien per Drag & Drop oder Auswahl hinzufügen – automatische Zuordnung nach Dateiname.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <FileUp className="h-10 w-10 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">Dateien hierher ziehen oder klicken</p>
                <p className="text-sm text-muted-foreground">Wählen Sie alle 4 Projektdokumente gleichzeitig aus.</p>
              </div>
              <label className="cursor-pointer">
                <span className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors inline-block">
                  Dateien auswählen
                </span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".docx,.pdf,.xlsx,.xls,.doc"
                />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Automatische Zuordnung</CardTitle>
              <CardDescription>
                Basierend auf den Dateinamen wurden folgende Dokumente erkannt:
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {mappings.map((mapping) => (
                <div key={mapping.key} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${mapping.matchedFile ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      <mapping.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{mapping.label}</p>
                      {mapping.matchedFile ? (
                        <p className="text-xs text-green-600 font-mono flex items-center gap-1">
                          <Check className="h-3 w-3" /> {mapping.matchedFile.name}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Noch nicht erkannt</p>
                      )}
                    </div>
                  </div>
                  {mapping.matchedFile && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => clearMapping(mapping.key)}
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {result && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${result.success ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
              {result.success ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
              <span className="text-sm">{result.message}</span>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate("/")} disabled={loading}>
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              className="gap-2 min-w-[180px]" 
              disabled={loading || !allMatched}
            >
              {loading ? "Wird hochgeladen..." : <><Upload className="h-4 w-4" /> Projekt Einreichen</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
