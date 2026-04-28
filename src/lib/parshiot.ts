// List of Torah portions (Parshiot) - Ashkenazi spelling
export const PARSHIOT = [
  '**Bereishis**', // Book of Genesis
  'Noach',
  'Lech Lecha',
  'Vayera',
  'Chayei Sara',
  'Toldos',
  'Vayetze',
  'Vayishlach',
  'Vayeshev',
  'Miketz',
  'Vayigash',
  'Vayechi',
  '**Shemos**', // Book of Exodus
  'Va\'era',
  'Bo',
  'Beshalach',
  'Yisro',
  'Mishpatim',
  'Terumah',
  'Tetzaveh',
  'Ki Sisa',
  'Vayakhel',
  'Pekudei',
  '**Vayikra**', // Book of Leviticus
  'Tzav',
  'Shemini',
  'Tazria',
  'Metzora',
  'Acharei Mos',
  'Kedoshim',
  'Emor',
  'Behor',
  'Bechukosai',
  '**Bamidbar**', // Book of Numbers
  'Naso',
  'Beha\'aloscha',
  'Shlach',
  'Korach',
  'Chukas',
  'Balak',
  'Pinchos',
  'Matos',
  'Masei',
  '**Devarim**', // Book of Deuteronomy
  'Va\'eschanon',
  'Eikev',
  'Re\'eh',
  'Shoftim',
  'Ki Seitzei',
  'Ki Sovo',
  'Nitzavim',
  'Vayelech',
  'Ha\'azinu',
  'V\'zos Habracha',
];

export const getParshiaList = (): string[] => {
  return PARSHIOT.map(p => p.replace(/\*\*/g, ''));
};

export const isBookHeader = (parsha: string): boolean => {
  return PARSHIOT.some(p => p.startsWith('**') && p.replace(/\*\*/g, '') === parsha);
};

export const isValidParsha = (parsha: string): boolean => {
  const cleanParshiot = PARSHIOT.map(p => p.replace(/\*\*/g, ''));
  return cleanParshiot.includes(parsha);
};

const HEBCAL_PARSHA_MAP: Record<string, string> = {
  'Bereshit': 'Bereishis', 'Noach': 'Noach', 'Lech-Lecha': 'Lech Lecha',
  'Vayera': 'Vayera', 'Chayei Sara': 'Chayei Sara', 'Toldot': 'Toldos',
  'Vayetzei': 'Vayetze', 'Vayishlach': 'Vayishlach', 'Vayeshev': 'Vayeshev',
  'Miketz': 'Miketz', 'Vayigash': 'Vayigash', 'Vayechi': 'Vayechi',
  'Shemot': 'Shemos', "Va'eira": "Va'era", 'Bo': 'Bo',
  "B'shalach": 'Beshalach', 'Yitro': 'Yisro', 'Mishpatim': 'Mishpatim',
  'Terumah': 'Terumah', 'Tetzaveh': 'Tetzaveh', 'Ki Tisa': 'Ki Sisa',
  'Vayakhel': 'Vayakhel', 'Pekudei': 'Pekudei',
  'Vayikra': 'Vayikra', 'Tzav': 'Tzav', 'Shmini': 'Shemini',
  'Tazria': 'Tazria', 'Metzora': 'Metzora', "Achrei Mot": 'Acharei Mos',
  'Kedoshim': 'Kedoshim', 'Emor': 'Emor', 'Behar': 'Behor',
  'Bechukotai': 'Bechukosai', 'Bamidbar': 'Bamidbar', 'Nasso': 'Naso',
  "B'ha'alotcha": "Beha'aloscha", "Sh'lach": 'Shlach', 'Korach': 'Korach',
  'Chukat': 'Chukas', 'Balak': 'Balak', 'Pinchas': 'Pinchos',
  'Matot': 'Matos', 'Masei': 'Masei', 'Devarim': 'Devarim',
  "Va'etchanan": "Va'eschanon", 'Eikev': 'Eikev', "Re'eh": "Re'eh",
  'Shoftim': 'Shoftim', 'Ki Teitzei': 'Ki Seitzei', 'Ki Tavo': 'Ki Sovo',
  'Nitzavim': 'Nitzavim', 'Vayeilech': 'Vayelech', "Ha'azinu": "Ha'azinu",
  "V'Zot HaBrachah": "V'zos Habracha",
};

export async function fetchCurrentParsha(): Promise<string | null> {
  try {
    const res = await fetch('https://www.hebcal.com/shabbat?cfg=json&geonameid=5128581&M=on');
    if (!res.ok) return null;
    const data = await res.json();
    const parshaItem = data.items?.find((item: any) => item.category === 'parashat');
    if (!parshaItem) return null;
    const hebcalName = parshaItem.title.replace('Parashat ', '');
    const parts = hebcalName.split('-');
    for (const part of parts) {
      const trimmed = part.trim();
      if (HEBCAL_PARSHA_MAP[trimmed]) return HEBCAL_PARSHA_MAP[trimmed];
    }
    return null;
  } catch {
    return null;
  }
}
