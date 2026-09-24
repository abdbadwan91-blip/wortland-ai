const GLOSSARY: Record<string, { en: string; ar: string }> = {
  guten:{en:'good',ar:'جيد'}, tag:{en:'day',ar:'يوم'}, kaffee:{en:'coffee',ar:'قهوة'},
  bitte:{en:'please',ar:'من فضلك'}, milch:{en:'milk',ar:'حليب'}, danke:{en:'thanks',ar:'شكراً'},
  tisch:{en:'table',ar:'طاولة'}, personen:{en:'people',ar:'أشخاص'}, fenster:{en:'window',ar:'نافذة'},
  speisekarte:{en:'menu',ar:'قائمة الطعام'}, morgen:{en:'tomorrow',ar:'غداً'}, bahnhof:{en:'station',ar:'محطة'},
  uhr:{en:'o’clock',ar:'الساعة'}, zug:{en:'train',ar:'قطار'}, karten:{en:'tickets',ar:'تذاكر'},
  plätze:{en:'seats',ar:'مقاعد'}, mitte:{en:'middle',ar:'الوسط'}, fahrzeug:{en:'vehicle',ar:'مركبة'},
  bremsen:{en:'brakes / braking',ar:'الفرامل / الفرملة'}, geräusch:{en:'noise',ar:'صوت'},
  geschwindigkeit:{en:'speed',ar:'سرعة'}, hause:{en:'home',ar:'المنزل'},
};
export function translateDialogueWord(word: string, lang: string): string | null {
  const key=word.toLocaleLowerCase('de-DE').replace(/[^a-zäöüß]/g,'');
  const hit=GLOSSARY[key];
  if(!hit) return null;
  return lang === 'ar' ? hit.ar : hit.en;
}
