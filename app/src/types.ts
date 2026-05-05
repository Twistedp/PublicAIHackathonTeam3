export type ProjectRecord = {
  projektnummer: string
  projekttitel: string
  projekttraeger: string
  laufzeit_beginn: string
  laufzeit_ende: string
  hauptprojektstandort: string
  zielgruppe_gliner_kandidaten: string | string[]
  projektmassnahmen_gliner_kandidaten: string | string[]
  hauptindikator_name: string
  hauptindikator_soll: number | string
  hauptindikator_ist: number | string
  hauptindikator_erfuellung_prozent: number | string
  zielgruppe_beste_textstelle: string
  massnahmen_beste_textstelle: string
}
