export type ProjectRecord = {
  projektnummer: string
  projekttitel: string
  projekttraeger: string
  laufzeit_beginn: string
  laufzeit_ende: string
  hauptprojektstandort: string
  zielgruppe_gliner_kandidaten: string[]
  projektmassnahmen_gliner_kandidaten: string[]
  hauptindikator_name: string
  hauptindikator_soll: number
  hauptindikator_ist: number
  hauptindikator_erfuellung_prozent: number
  zielgruppe_beste_textstelle: string
  massnahmen_beste_textstelle: string
}
