export type Lang = "ar" | "en";

export function isLang(v: string): v is Lang {
  return v === "ar" || v === "en";
}

const dict = {
  ar: {
    siteName: "موقع الأدوية",
    homeTitle: "موقع الأدوية",
    homeSubtitle: "قاعدة بيانات أدوية قابلة للبحث وصفحات صديقة لمحركات البحث.",
    openDatabase: "فتح قاعدة البيانات",
    quickSearch: "بحث سريع",
    drugsDbTitle: "قاعدة بيانات الأدوية",
    totalResults: "إجمالي النتائج",
    searchPlaceholder: "ابحث باسم الدواء / الشركة / المادة الفعالة",
    search: "بحث",
    company: "الشركة",
    activeIngredient: "المادة الفعالة",
    price: "السعر",
    page: "صفحة",
    of: "من",
    prev: "السابق",
    next: "التالي",
    backToSearch: "الرجوع إلى البحث",
    source: "المصدر",
    info: "معلومات",
    overview: "نظرة عامة",
    basicInfo: "البيانات الأساسية",
    description: "الوصف",
    medicalDisclaimerTitle: "تنبيه طبي",
    medicalDisclaimerBody:
      "هذه المعلومات للتثقيف العام ولا تغني عن استشارة الطبيب أو الصيدلي. لا تبدأ أو توقف أو تغيّر علاجًا دون استشارة مختص.",
    similarDrugs: "أدوية مشابهة",
    noSimilar: "لا توجد أدوية مشابهة مسجلة.",
    langToEnglish: "الإنجليزية",
    langToArabic: "العربية",
    homeNav: "الرئيسية",
    drugsNav: "الأدوية",
    themeLight: "الوضع النهاري",
    themeDark: "الوضع الليلي",
  },
  en: {
    siteName: "Drugs",
    homeTitle: "Drugs",
    homeSubtitle: "Searchable drug database with SEO-friendly server-rendered pages.",
    openDatabase: "Open database",
    quickSearch: "Quick search",
    drugsDbTitle: "Drug database",
    totalResults: "Total results",
    searchPlaceholder: "Search by drug name / company / active ingredient",
    search: "Search",
    company: "Company",
    activeIngredient: "Active ingredient",
    price: "Price",
    page: "Page",
    of: "of",
    prev: "Prev",
    next: "Next",
    backToSearch: "Back to search",
    source: "Source",
    info: "Info",
    overview: "Overview",
    basicInfo: "Basic info",
    description: "Description",
    medicalDisclaimerTitle: "Medical disclaimer",
    medicalDisclaimerBody:
      "This information is for general education and does not replace medical advice. Do not start, stop, or change any treatment without consulting a professional.",
    similarDrugs: "Similar drugs",
    noSimilar: "No similar drugs recorded.",
    langToEnglish: "English",
    langToArabic: "العربية",
    homeNav: "Home",
    drugsNav: "Drugs",
    themeLight: "Light mode",
    themeDark: "Dark mode",
  },
} as const;

export function t(lang: Lang, key: keyof (typeof dict)["ar"]) {
  return dict[lang][key];
}
