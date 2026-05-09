import fs from 'fs';
import path from 'path';

const baseRecord = {
  projektnummer: "042-2024/25",
  projekttitel: "HandWerk.Zukunft – Berufsvorbereitungskurse mit Lehrvermittlung",
  projekttraeger: "Steiermark",
  laufzeit_beginn: "2024-01-01",
  laufzeit_ende: "2025-12-31",
  hauptprojektstandort: "Steiermark",
  zielgruppe_gliner_kandidaten: [
    "Menschen mit Migrationsbiographie",
    "Zielgruppe",
    "Menschen mit Migrationshintergrund",
    "Menschen"
  ],
  projektmassnahmen_gliner_kandidaten: [
    "Maßnahme 9",
    "Maßnahme 7",
    "Maßnahme 6",
    "Evaluierungen",
    "Maßnahme 8",
    "Supervision",
    "Projekt",
    "Maßnahme 2"
  ],
  hauptindikator_name: "Anzahl der Projektteilnehmenden gesamt",
  hauptindikator_soll: 180,
  hauptindikator_ist: 194,
  hauptindikator_erfuellung_prozent: 107.8,
  zielgruppe_beste_textstelle: "Mock textstelle...",
  massnahmen_beste_textstelle: "Mock textstelle..."
};

const locations = ["Wien", "Steiermark", "Tirol", "Oberösterreich", "Salzburg", "Kärnten", "Vorarlberg", "Burgenland", "Niederösterreich"];
const carriers = ["Caritas", "Diakonie", "Rotes Kreuz", "Volkshilfe", "Hilfswerk", "WIFI", "BFI"];
const titles = [
  "HandWerk.Zukunft – Berufsvorbereitungskurse",
  "Deutsch-im-Alltag - Sprachförderung",
  "YouthConnect - Jugendarbeit",
  "Begegnungsräume Schaffen",
  "SchulStart - Nachhilfe",
  "Lernstube für Kinder",
  "Wurzeln-fassen Integration",
  "Miteinander-stark Communities",
  "Finish-Strong Lehrabschluss",
  "FitKoop Gesundheitsförderung"
];
const audiences = [
  "Jugendliche", "Frauen", "Langzeitarbeitslose", "Menschen mit Migrationsbiographie", 
  "Asylberechtigte", "EU-Bürger", "Alleinerziehende", "Ältere Arbeitnehmer"
];

function randomItem(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItems(arr: any[], min: number, max: number) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomDate(startYear: number, endYear: number) {
  const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const records = [];

for (let i = 0; i < 50; i++) {
  const soll = Math.floor(Math.random() * 200) + 50;
  const ist = Math.floor(Math.random() * 250) + 30;
  const prozent = parseFloat(((ist / soll) * 100).toFixed(1));
  
  const start = randomDate(2019, 2024);
  const endYear = parseInt(start.split('-')[0]) + Math.floor(Math.random() * 3) + 1;
  const end = `${endYear}-${start.split('-')[1]}-${start.split('-')[2]}`;

  records.push({
    ...baseRecord,
    projektnummer: `${String(i + 1).padStart(3, '0')}-${start.split('-')[0]}/${String(endYear).slice(-2)}`,
    projekttitel: randomItem(titles),
    projekttraeger: randomItem(carriers),
    laufzeit_beginn: start,
    laufzeit_ende: end,
    hauptprojektstandort: randomItem(locations),
    zielgruppe_gliner_kandidaten: randomItems(audiences, 2, 5),
    hauptindikator_soll: soll,
    hauptindikator_ist: ist,
    hauptindikator_erfuellung_prozent: prozent
  });
}

const outputPath = path.join(__dirname, '../src/data/records.json');
fs.writeFileSync(outputPath, JSON.stringify(records, null, 2));
console.log(`Generated ${records.length} records to ${outputPath}`);