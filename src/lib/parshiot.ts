// List of Torah portions (Parshiot) - Ashkenazi spelling
export const PARSHIOT = [
  '**Bereishis**', // Book of Genesis
  'Noach',
  'Lech Lecho',
  'Vayero',
  'Chayei Soro',
  'Toldos',
  'Vayetzei',
  'Vayishlach',
  'Vayeshiv',
  'Mikeitz',
  'Vayigosh',
  'Vaychi',
  '**Shemos**', // Book of Exodus
  'Va\'ero',
  'Bo',
  'Beshalach',
  'Yitro',
  'Mishpotim',
  'Terumah',
  'Tetzaveh',
  'Ki Siso',
  'Vayakhel',
  'Pekudei',
  '**Vayikro**', // Book of Leviticus
  'Tzov',
  'Shemini',
  'Tazrio',
  'Matzoro',
  'Acharei Mos',
  'Kedoshim',
  'Emor',
  'Behor',
  'Bechukosai',
  '**Bamidbar**', // Book of Numbers
  'Nasso',
  'Beha\'aloscho',
  'Shlach',
  'Korach',
  'Chukas',
  'Balak',
  'Pinchos',
  'Matos',
  'Masei',
  '**Devarim**', // Book of Deuteronomy
  'Va\'etchonon',
  'Eikev',
  'Reeh',
  'Shofetim',
  'Ki Seitzei',
  'Ki Sovo',
  'Netzovim',
  'Vayelech',
  'Ha\'azinu',
  'V\'zos Habrosho',
];

export const getParshiaList = (): string[] => {
  return PARSHIOT.map(p => p.replace(/\*\*/g, '')); // Remove markdown for dropdown
};

export const isValidParsha = (parsha: string): boolean => {
  const cleanParshiot = PARSHIOT.map(p => p.replace(/\*\*/g, ''));
  return cleanParshiot.includes(parsha);
};
