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
  return PARSHIOT.map(p => p.replace(/\*\*/g, '')); // Remove markdown for dropdown
};

export const isValidParsha = (parsha: string): boolean => {
  const cleanParshiot = PARSHIOT.map(p => p.replace(/\*\*/g, ''));
  return cleanParshiot.includes(parsha);
};
