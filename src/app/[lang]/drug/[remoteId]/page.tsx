import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";
import { ImageLightbox } from "@/components/image-lightbox";
import SmartBackLink from "@/components/smart-back-link";
import { getOrTranslateFields } from "@/lib/translate/translations";

export const revalidate = 3600;

type AlternativeDrug = Prisma.DrugGetPayload<{
  select: {
    remoteId: true;
    name: true;
    company: true;
    activeIngredient: true;
    description: true;
    price: true;
    imageSourceUrl: true;
    imageLocalPath: true;
  };
}>;

type DosageForm =
  | "tablet"
  | "effervescent"
  | "capsule"
  | "syrup"
  | "suspension"
  | "drops"
  | "injection"
  | "cream"
  | "ointment"
  | "gel"
  | "spray"
  | "inhaler"
  | "solution"
  | "powder"
  | "other"
  | "unknown";

type AgeGroup = "kids" | "adults" | "unknown";

type IngredientProfile = {
  normalized: string;
  components: string[];
  tokens: string[];
};

type IngredientSimilarity = {
  overlapCount: number;
  overlapRatio: number;
  exactNormalized: boolean;
  exactComponents: boolean;
  passes: boolean;
};

type ScoredAlternative = {
  drug: AlternativeDrug;
  score: number;
  exactStrength: boolean;
  sameForm: boolean;
  strictSameForm: boolean;
  form: DosageForm;
  strengthKey: string;
  priceNum: number;
  ingredientSimilarity: IngredientSimilarity;
  differentCompany: boolean;
  matchTone: "strong" | "good" | "partial";
};

const ingredientStopwords = new Set([
  "hydrochloride",
  "hcl",
  "sodium",
  "potassium",
  "calcium",
  "acetate",
  "phosphate",
  "sulfate",
  "sulphate",
  "nitrate",
  "chloride",
  "bromide",
  "maleate",
  "tartrate",
  "succinate",
  "citrate",
  "base",
  "extended",
  "release",
  "xr",
  "sr",
  "cr",
  "plus",
  "forte",
  "extra",
  "compound",
  "comp",
  "oral",
  "film",
  "coated",
  "tablet",
  "tablets",
  "capsule",
  "capsules",
  "syrup",
  "suspension",
  "solution",
  "cream",
  "gel",
  "ointment",
  "spray",
  "inhaler",
  "powder",
  "drops",
  "ampoule",
  "injection",
  "حقن",
  "شراب",
  "معلق",
  "محلول",
  "كريم",
  "مرهم",
  "جل",
  "بخاخ",
  "قطرات",
  "قطرة",
  "كبسول",
  "كبسولة",
  "كبسولات",
  "قرص",
  "أقراص",
  "اقراص",
  "فوار",
  "ممتد",
  "المدى",
  "صوديوم",
  "بوتاسيوم",
  "كالسيوم",
  "هيدروكلوريد",
  "هيدروكلورايد",
]);

function areDosageFormsCompatible(a: DosageForm, b: DosageForm) {
  if (a === "unknown" || a === "other" || b === "unknown" || b === "other") return true;
  if (a === b) return true;
  const oralLiquid = new Set<DosageForm>(["syrup", "suspension"]);
  if (oralLiquid.has(a) && oralLiquid.has(b)) return true;
  const oralSolid = new Set<DosageForm>(["tablet", "effervescent", "capsule"]);
  if (oralSolid.has(a) && oralSolid.has(b)) return true;
  const topical = new Set<DosageForm>(["cream", "ointment", "gel"]);
  if (topical.has(a) && topical.has(b)) return true;
  return false;
}

function parsePrice(raw: string | null | undefined): number {
  if (!raw) return Number.POSITIVE_INFINITY;
  const s = String(raw);
  const m = s.match(/\d+(?:[\.,]\d+)?/g);
  if (!m || !m.length) return Number.POSITIVE_INFINITY;
  const n = Number.parseFloat(m.join(" ").split(" ")[0].replace(",", "."));
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

function normalizeText(s: string | null | undefined) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function detectAgeGroup(name: string, activeIngredient: string): AgeGroup {
  const s = `${normalizeText(name)} ${normalizeText(activeIngredient)}`;
  const kidsHints = [
    "pediatric",
    "paediatric",
    "child",
    "children",
    "kid",
    "kids",
    "infant",
    "baby",
    "junior",
    "jr",
    "اطفال",
    "للأطفال",
    "للاطفال",
    "رضع",
  ];
  const adultHints = ["adult", "adults", "لل成人", "للكبار", "للبالغين", "بالغين"]; 

  if (kidsHints.some((k) => s.includes(k))) return "kids";
  if (adultHints.some((k) => s.includes(k))) return "adults";
  return "unknown";
}

function detectDosageForm(name: string, description?: string | null): DosageForm {
  const s = normalizeText(`${name} ${description || ""}`);
  const has = (arr: string[]) => arr.some((k) => s.includes(k));
  const hasWord = (words: string[]) =>
    words.some((w) => {
      const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\b`, "i");
      return re.test(s);
    });

  if (has(["effervescent", "efferv", "fawar", "فوار"])) return "effervescent";

  if (has(["tablet", "قرص", "اقراص", "أقراص"]) || hasWord(["tab", "tbl"])) return "tablet";
  if (has(["capsule", "كبسول", "كبسولة", "كبسولات"]) || hasWord(["cap"])) return "capsule";
  if (has(["syrup", "شراب"]) || hasWord(["syp"])) return "syrup";
  if (has(["suspension", "معلق"]) || hasWord(["susp"])) return "suspension";
  if (has(["drop", "drops", "نقط", "قطرة", "قطرات"]) || hasWord(["drp"])) return "drops";
  if (has(["injection", "ampoule", "حقن", "امبول", "أمبول"]) || hasWord(["inj", "amp"])) return "injection";

  if (has(["cream", "كريم"])) return "cream";
  if (has(["ointment", "مرهم"])) return "ointment";
  if (has(["gel", "جل"])) return "gel";
  if (has(["spray", "بخاخ"])) return "spray";
  if (has(["inhaler", "استنشاق", "بخاخ استنشاق"])) return "inhaler";
  if (has(["solution", "محلول"]) || hasWord(["sol"])) return "solution";
  if (has(["powder", "بودرة", "مسحوق"]) || hasWord(["pwd"])) return "powder";
  return "unknown";
}

function resolveDosageForm(name: string, description?: string | null): DosageForm {
  const byName = detectDosageForm(name);
  if (byName !== "unknown" && byName !== "other") return byName;
  return detectDosageForm(name, description);
}

function extractStrengthKey(name: string, activeIngredient: string) {
  const s = `${normalizeText(name)} ${normalizeText(activeIngredient)}`;
  const m = s.match(/(\d+(?:[\.,]\d+)?)\s*(mcg|ug|mg|g|iu|%)\b(?:\s*\/\s*(\d+(?:[\.,]\d+)?)\s*(ml|l)\b)?/i);
  if (!m) return "";
  const n1 = String(m[1] ?? "").replace(",", ".");
  const u1 = String(m[2] ?? "").toLowerCase();
  const n2 = m[3] ? String(m[3]).replace(",", ".") : "";
  const u2 = m[4] ? String(m[4]).toLowerCase() : "";
  return `${n1}${u1}${n2 ? `/${n2}${u2}` : ""}`;
}

function buildIngredientProfile(activeIngredient: string | null | undefined): IngredientProfile {
  const normalized = normalizeText(activeIngredient)
    .replace(/[()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const components = normalized
    .split(/[\+\/,&؛،]|(?:\band\b)|(?:\bwith\b)|(?:\sو\s)/g)
    .map((part) =>
      part
        .split(/[\s-]+/g)
        .map((token) => token.trim())
        .filter(
          (token) =>
            token.length >= 3 &&
            !ingredientStopwords.has(token) &&
            !/^\d/.test(token) &&
            !/^(mcg|ug|mg|g|iu|ml|l|%)$/i.test(token),
        )
        .join(" ")
        .trim(),
    )
    .filter(Boolean);

  const tokens = Array.from(new Set(components.flatMap((part) => part.split(/\s+/g).filter(Boolean))));

  return {
    normalized,
    components,
    tokens,
  };
}

function getIngredientSimilarity(base: IngredientProfile, candidate: IngredientProfile): IngredientSimilarity {
  if (!base.tokens.length || !candidate.tokens.length) {
    return {
      overlapCount: 0,
      overlapRatio: 0,
      exactNormalized: false,
      exactComponents: false,
      passes: false,
    };
  }

  const sharedTokens = base.tokens.filter((token) => candidate.tokens.includes(token));
  const overlapCount = sharedTokens.length;
  const overlapRatio = overlapCount / base.tokens.length;
  const exactNormalized = Boolean(base.normalized && base.normalized === candidate.normalized);
  const exactComponents = base.components.length > 0 && base.components.every((part) => candidate.components.includes(part));
  const similarCombo =
    base.components.length > 1
      ? overlapRatio >= 0.72 && Math.abs(candidate.components.length - base.components.length) <= 1
      : false;
  const passes = exactNormalized || exactComponents || similarCombo || overlapRatio >= 0.5 || overlapCount >= 2;

  return {
    overlapCount,
    overlapRatio,
    exactNormalized,
    exactComponents,
    passes,
  };
}

function uniqueByRemoteId(drugs: AlternativeDrug[]) {
  return Array.from(new Map(drugs.map((d) => [d.remoteId, d])).values());
}

function resolveThumb(src?: string | null, local?: string | null) {
  const value = src || local;
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return value;
  return null;
}

function formatDosageForm(lang: Lang, form: DosageForm) {
  const map: Record<DosageForm, { ar: string; en: string }> = {
    tablet: { ar: "أقراص", en: "Tablet" },
    effervescent: { ar: "فوار", en: "Effervescent" },
    capsule: { ar: "كبسولات", en: "Capsule" },
    syrup: { ar: "شراب", en: "Syrup" },
    suspension: { ar: "معلق", en: "Suspension" },
    drops: { ar: "قطرات", en: "Drops" },
    injection: { ar: "حقن", en: "Injection" },
    cream: { ar: "كريم", en: "Cream" },
    ointment: { ar: "مرهم", en: "Ointment" },
    gel: { ar: "جل", en: "Gel" },
    spray: { ar: "بخاخ", en: "Spray" },
    inhaler: { ar: "استنشاق", en: "Inhaler" },
    solution: { ar: "محلول", en: "Solution" },
    powder: { ar: "مسحوق", en: "Powder" },
    other: { ar: "أخرى", en: "Other" },
    unknown: { ar: "غير محدد", en: "Unknown" },
  };
  return map[form][lang];
}

function formatAgeGroup(lang: Lang, ageGroup: AgeGroup) {
  if (ageGroup === "kids") return lang === "ar" ? "أطفال" : "Kids";
  if (ageGroup === "adults") return lang === "ar" ? "بالغون" : "Adults";
  return lang === "ar" ? "غير محدد" : "Unknown";
}

function matchToneLabel(lang: Lang, tone: ScoredAlternative["matchTone"]) {
  if (tone === "strong") return lang === "ar" ? "مطابقة قوية" : "Strong match";
  if (tone === "good") return lang === "ar" ? "مطابقة جيدة" : "Good match";
  return lang === "ar" ? "مطابقة جزئية" : "Partial match";
}

function toInt(v: string) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : NaN;
}

export async function generateStaticParams() {
  try {
    const drugs = await prisma.drug.findMany({
      select: { remoteId: true },
      orderBy: { updatedAt: "desc" },
      take: 300,
    });

    return drugs.flatMap((drug) => [
      { lang: "ar", remoteId: String(drug.remoteId) },
      { lang: "en", remoteId: String(drug.remoteId) },
    ]);
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; remoteId: string }>;
}): Promise<Metadata> {
  const { lang: raw, remoteId } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";
  const rid = toInt(remoteId);
  if (!Number.isFinite(rid) || rid <= 0) {
    return {
      title: t(lang, "siteName"),
    };
  }

  const drug = await prisma.drug.findUnique({
    where: { remoteId: rid },
    select: { name: true, company: true, activeIngredient: true },
  });

  if (!drug) {
    return {
      title: t(lang, "siteName"),
    };
  }

  const translated = await getOrTranslateFields(lang, [
    { entityType: "Drug", entityId: String(rid), field: "name", sourceText: drug.name },
    { entityType: "Drug", entityId: String(rid), field: "company", sourceText: drug.company || "" },
    { entityType: "Drug", entityId: String(rid), field: "activeIngredient", sourceText: drug.activeIngredient || "" },
  ]);

  const drugName = lang === "ar" ? translated[`Drug:${String(rid)}:name`] ?? t(lang, "translationPending") : drug.name;
  const company = lang === "ar" ? translated[`Drug:${String(rid)}:company`] ?? "" : drug.company || "";
  const activeIngredient =
    lang === "ar" ? translated[`Drug:${String(rid)}:activeIngredient`] ?? "" : drug.activeIngredient || "";

  const title = `${drugName} — ${t(lang, "siteName")}`;
  const parts = [company, activeIngredient].filter(Boolean);
  const description = parts.length ? `${t(lang, "basicInfo")}: ${parts.join(" · ")}` : t(lang, "homeSubtitle");

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/drug/${rid}`,
      languages: {
        ar: `/ar/drug/${rid}`,
        en: `/en/drug/${rid}`,
      },
    },
  };
}

export default async function DrugDetailPage({
  params,
}: {
  params: Promise<{ lang: string; remoteId: string }>;
}) {
  const { lang: raw, remoteId } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";

  const rid = toInt(remoteId);
  if (!Number.isFinite(rid) || rid <= 0) notFound();

  const drug = await prisma.drug.findUnique({
    where: { remoteId: rid },
    select: {
      id: true,
      remoteId: true,
      name: true,
      price: true,
      company: true,
      activeIngredient: true,
      description: true,
      imageSourceUrl: true,
      imageLocalPath: true,
    },
  });

  if (!drug) notFound();

  const rawCompany = drug.company || "";
  const rawActiveIngredient = drug.activeIngredient || "";
  const currentPrice = parsePrice(drug.price);

  const currentAgeGroup = detectAgeGroup(drug.name, rawActiveIngredient);
  const currentDosageForm = resolveDosageForm(drug.name, drug.description);
  const currentStrengthKey = extractStrengthKey(drug.name, rawActiveIngredient);
  const ingredientProfile = buildIngredientProfile(rawActiveIngredient || drug.name);
  const ingredientQueryTokens = ingredientProfile.tokens.slice(0, 6);

  const alternativesCandidates: AlternativeDrug[] = ingredientQueryTokens.length
    ? ((await prisma.drug.findMany({
        where: {
          remoteId: { not: drug.remoteId },
          OR: ingredientQueryTokens.flatMap((token) => [
            { activeIngredient: { contains: token, mode: "insensitive" as const } },
            { name: { contains: token, mode: "insensitive" as const } },
          ]),
        },
        take: 320,
        select: {
          remoteId: true,
          name: true,
          company: true,
          activeIngredient: true,
          description: true,
          price: true,
          imageSourceUrl: true,
          imageLocalPath: true,
        },
      })) as AlternativeDrug[])
    : [];

  const scored = alternativesCandidates
    .map((candidate): ScoredAlternative | null => {
      const candidateProfile = buildIngredientProfile(candidate.activeIngredient || candidate.name);
      const ingredientSimilarity = getIngredientSimilarity(ingredientProfile, candidateProfile);
      if (!ingredientSimilarity.passes) return null;

      const candidateAgeGroup = detectAgeGroup(candidate.name, candidate.activeIngredient || "");
      if (currentAgeGroup !== "unknown" && candidateAgeGroup !== "unknown" && candidateAgeGroup !== currentAgeGroup) {
        return null;
      }

      const form = resolveDosageForm(candidate.name, candidate.description);
      const strength = extractStrengthKey(candidate.name, candidate.activeIngredient || "");
      const exactStrength = Boolean(currentStrengthKey && strength && strength === currentStrengthKey);
      const strictSameForm =
        currentDosageForm !== "unknown" &&
        currentDosageForm !== "other" &&
        form !== "unknown" &&
        form !== "other" &&
        form === currentDosageForm;
      const sameForm = areDosageFormsCompatible(form, currentDosageForm);
      const exactActive = ingredientSimilarity.exactNormalized || ingredientSimilarity.exactComponents;
      const differentCompany = Boolean(rawCompany) && normalizeText(candidate.company) !== normalizeText(rawCompany);
      const score =
        (exactActive ? 120 : 0) +
        ingredientSimilarity.overlapCount * 26 +
        Math.round(ingredientSimilarity.overlapRatio * 120) +
        (strictSameForm ? 55 : 0) +
        (!strictSameForm && sameForm ? 25 : 0) +
        (exactStrength ? 45 : 0) +
        (differentCompany ? 12 : 0);
      const matchTone: ScoredAlternative["matchTone"] =
        exactActive && strictSameForm ? "strong" : score >= 170 ? "good" : "partial";

      return {
        drug: candidate,
        score,
        exactStrength,
        sameForm,
        strictSameForm,
        form,
        strengthKey: strength,
        priceNum: parsePrice(candidate.price),
        ingredientSimilarity,
        differentCompany,
        matchTone,
      };
    })
    .filter((candidate): candidate is ScoredAlternative => Boolean(candidate))
    .sort((a, b) => {
      if (a.strictSameForm !== b.strictSameForm) return a.strictSameForm ? -1 : 1;
      if (a.exactStrength !== b.exactStrength) return a.exactStrength ? -1 : 1;
      if (a.ingredientSimilarity.exactComponents !== b.ingredientSimilarity.exactComponents) {
        return a.ingredientSimilarity.exactComponents ? -1 : 1;
      }
      if (a.sameForm !== b.sameForm) return a.sameForm ? -1 : 1;
      if (a.score !== b.score) return b.score - a.score;
      if (a.priceNum !== b.priceNum) return a.priceNum - b.priceNum;
      return a.drug.remoteId - b.drug.remoteId;
    });

  const strongAlternatives = scored
    .filter((candidate) => candidate.strictSameForm && (candidate.exactStrength || !currentStrengthKey || candidate.score >= 190))
    .map((candidate) => candidate.drug);

  const cheaperAlternatives = Number.isFinite(currentPrice)
    ? strongAlternatives.filter((candidate) => {
        const price = parsePrice(candidate.price);
        return Number.isFinite(price) && price < currentPrice;
      })
    : [];

  const premiumAlternatives = Number.isFinite(currentPrice)
    ? strongAlternatives.filter((candidate) => {
        const price = parsePrice(candidate.price);
        return !(Number.isFinite(price) && price < currentPrice);
      })
    : strongAlternatives;

  const strictSameFormDifferentStrength = scored
    .filter((candidate) => {
      if (!candidate.strictSameForm) return false;
      if (candidate.exactStrength) return false;
      if (!currentStrengthKey) return false;
      return Boolean(candidate.strengthKey && candidate.strengthKey !== currentStrengthKey);
    })
    .map((candidate) => candidate.drug);

  const closeAlternatives = scored
    .filter((candidate) => !strongAlternatives.some((drugItem) => drugItem.remoteId === candidate.drug.remoteId))
    .filter((candidate) => candidate.sameForm)
    .map((candidate) => candidate.drug);

  const formShiftAlternatives = scored
    .filter((candidate) => !candidate.sameForm && candidate.form !== "unknown" && candidate.form !== "other")
    .map((candidate) => candidate.drug);

  const visibleOtherForms = uniqueByRemoteId(formShiftAlternatives).slice(0, 24);
  const otherAlternativesList = uniqueByRemoteId(closeAlternatives).slice(0, 24);
  const alternativesSorted = uniqueByRemoteId([
    ...cheaperAlternatives,
    ...premiumAlternatives,
    ...strictSameFormDifferentStrength,
    ...otherAlternativesList,
    ...visibleOtherForms,
  ]);

  const translations = await getOrTranslateFields(
    lang,
    [
      { entityType: "Drug" as const, entityId: String(drug.remoteId), field: "name", sourceText: drug.name },
      { entityType: "Drug" as const, entityId: String(drug.remoteId), field: "company", sourceText: drug.company || "" },
      { entityType: "Drug" as const, entityId: String(drug.remoteId), field: "activeIngredient", sourceText: drug.activeIngredient || "" },
      { entityType: "Drug" as const, entityId: String(drug.remoteId), field: "description", sourceText: drug.description || "" },
      ...alternativesSorted.flatMap((d) => [
        { entityType: "Drug" as const, entityId: String(d.remoteId), field: "name", sourceText: d.name },
        { entityType: "Drug" as const, entityId: String(d.remoteId), field: "company", sourceText: d.company || "" },
        { entityType: "Drug" as const, entityId: String(d.remoteId), field: "activeIngredient", sourceText: d.activeIngredient || "" },
      ]),
    ],
  );

  const drugName =
    lang === "ar" ? translations[`Drug:${String(drug.remoteId)}:name`] ?? t(lang, "translationPending") : drug.name;

  const company = lang === "ar" ? translations[`Drug:${String(drug.remoteId)}:company`] ?? "" : rawCompany;
  const activeIngredient = lang === "ar" ? translations[`Drug:${String(drug.remoteId)}:activeIngredient`] ?? "" : rawActiveIngredient;
  const descriptionText =
    lang === "ar" ? translations[`Drug:${String(drug.remoteId)}:description`] ?? "" : drug.description || "";

  const trSimilar = (remoteId: number, field: "name" | "company" | "activeIngredient", fallback: string) => {
    if (lang !== "ar") return fallback;
    const v = translations[`Drug:${String(remoteId)}:${field}`];
    return v ?? t(lang, "translationPending");
  };

  const otherLang: Lang = lang === "ar" ? "en" : "ar";
  const alternativesByRemoteId = new Map(scored.map((candidate) => [candidate.drug.remoteId, candidate]));
  const alternativesIntro =
    lang === "ar"
      ? "تم ترشيح البدائل آلياً اعتماداً على المادة الفعالة، الشكل الدوائي، التركيز، الفئة العمرية، والسعر دون الاعتماد على حقل البدائل غير الدقيق في قاعدة البيانات."
      : "Alternatives are ranked automatically using active ingredient, dosage form, strength, age group, and price without relying on the inaccurate database relation field.";
  const summaryTiles = [
    {
      label: lang === "ar" ? "الشكل الدوائي" : "Dosage form",
      value: formatDosageForm(lang, currentDosageForm),
    },
    {
      label: lang === "ar" ? "التركيز" : "Strength",
      value: currentStrengthKey || (lang === "ar" ? "غير محدد" : "Unknown"),
    },
    {
      label: lang === "ar" ? "الفئة العمرية" : "Age group",
      value: formatAgeGroup(lang, currentAgeGroup),
    },
    {
      label: lang === "ar" ? "البدائل المرشحة" : "Recommended alternatives",
      value: String(alternativesSorted.length),
    },
  ] as const;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const pageUrl = baseUrl ? new URL(`/${lang}/drug/${drug.remoteId}`, baseUrl).toString() : undefined;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t(lang, "homeNav"),
        item: baseUrl ? new URL(`/${lang}`, baseUrl).toString() : `/${lang}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t(lang, "drugsNav"),
        item: baseUrl ? new URL(`/${lang}/drugs`, baseUrl).toString() : `/${lang}/drugs`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: drug.name,
        item: pageUrl ?? `/${lang}/drug/${drug.remoteId}`,
      },
    ],
  };

  const imageUrl = (() => {
    const src = drug.imageSourceUrl || drug.imageLocalPath;
    if (!src) return null;
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    if (src.startsWith("/")) return src;
    return null;
  })();

  const drugJsonLd = {
    "@context": "https://schema.org",
    "@type": "Drug",
    name: drugName,
    description: descriptionText || undefined,
    image: imageUrl ?? undefined,
    manufacturer: company ? { "@type": "Organization", name: company } : undefined,
    activeIngredient: activeIngredient ?? undefined,
    url: pageUrl,
    inLanguage: lang,
    isSimilarTo: alternativesSorted.slice(0, 6).map((candidate) => ({
      "@type": "Drug",
      name: trSimilar(candidate.remoteId, "name", candidate.name),
      url: baseUrl ? new URL(`/${lang}/drug/${candidate.remoteId}`, baseUrl).toString() : `/${lang}/drug/${candidate.remoteId}`,
    })),
  };

  const descriptionSections = (() => {
    if (!descriptionText) return [] as { title: string; body: string }[];
    const raw = String(descriptionText);

    const lines = raw.split(/\r?\n/);
    const sections: { title: string; bodyLines: string[] }[] = [];
    const defaultTitle: string = String(t(lang, "description"));
    let current = { title: defaultTitle, bodyLines: [] as string[] };

    const normalizeTitle = (s: string) =>
      s
        .trim()
        .replace(/^[-*#\s]+/, "")
        .replace(/[:：]+\s*$/, "")
        .replace(/ميكانيكية\s+العمل/g, "آلية العمل")
        .trim();

    const splitInlineHeading = (line: string) => {
      const l = line.trim();
      if (!l) return null as null | { title: string; rest: string };
      const m = l.match(
        /^(الوصف|مقدمة|معلومات|الاستعمالات|دواعي الاستعمال|الاستطبابات|الجرعة|الجرعات|طريقة الاستعمال|آلية العمل|ميكانيكية العمل|التحذيرات|احتياطات|التداخلات الدوائية|الآثار الجانبية|الأعراض الجانبية|موانع الاستعمال|الحفظ|التخزين|الحمل والرضاعة)\s*[:：]\s*(.*)$/,
      );
      if (!m) return null;
      return { title: normalizeTitle(m[1] || ""), rest: (m[2] || "").trim() };
    };

    const isHeading = (line: string) => {
      const l = line.trim();
      if (!l) return false;
      if (/^#{1,6}\s+/.test(l)) return true;
      if (/^\*\*.+\*\*$/.test(l)) return true;
      if (/^[A-Za-z][A-Za-z\s]{2,32}:$/.test(l)) return true;
      if (/^(Introduction|Info|Information|Indications|Dosage|Warnings|Side Effects|Contraindications):?$/i.test(l)) return true;
      if (
        /^(الوصف|مقدمة|معلومات|الاستعمالات|دواعي الاستعمال|الاستطبابات|الجرعة|الجرعات|طريقة الاستعمال|آلية العمل|ميكانيكية العمل|التحذيرات|احتياطات|التداخلات الدوائية|الآثار الجانبية|الأعراض الجانبية|موانع الاستعمال|الحفظ|التخزين|الحمل والرضاعة)[:：]?$/.test(
          l,
        )
      )
        return true;
      return false;
    };

    for (const line of lines) {
      const inline = splitInlineHeading(line);
      if (inline) {
        if (current.bodyLines.join("\n").trim()) sections.push(current);
        current = { title: inline.title || defaultTitle, bodyLines: [] };
        if (inline.rest) current.bodyLines.push(inline.rest);
        continue;
      }
      if (isHeading(line)) {
        const title = normalizeTitle(line.replace(/^#{1,6}\s+/, "").replace(/^\*\*|\*\*$/g, ""));
        if (current.bodyLines.join("\n").trim()) sections.push(current);
        current = { title: title || defaultTitle, bodyLines: [] };
        continue;
      }
      current.bodyLines.push(line);
    }

    if (current.bodyLines.join("\n").trim()) sections.push(current);

    const cleaned = sections
      .map((s) => ({ title: s.title, body: s.bodyLines.join("\n").trim() }))
      .filter((s) => s.body);

    if (cleaned.length <= 1) {
      const paras = raw
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean);
      if (paras.length <= 1) return [{ title: defaultTitle, body: raw }];
      return paras.map((p, idx) => ({ title: idx === 0 ? defaultTitle : `${defaultTitle} (${idx + 1})`, body: p }));
    }
    return cleaned;
  })();

  const renderAlternativeCard = (candidate: AlternativeDrug) => {
    const scoreMeta = alternativesByRemoteId.get(candidate.remoteId);
    const thumb = resolveThumb(candidate.imageSourceUrl, candidate.imageLocalPath);

    return (
      <Link
        key={candidate.remoteId}
        href={`/${lang}/drug/${candidate.remoteId}`}
        className="premium-card group rounded-[26px] p-4 transition hover:-translate-y-1"
      >
        <div className="flex items-start gap-4">
          {thumb ? (
            <img
              src={thumb}
              alt={trSimilar(candidate.remoteId, "name", candidate.name)}
              loading="lazy"
              className="h-[4.5rem] w-[4.5rem] rounded-[20px] border border-white/50 bg-white/90 object-contain p-2 shadow-[0_14px_26px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#0b1326]"
            />
          ) : (
            <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[20px] border border-white/50 bg-white/70 dark:border-white/10 dark:bg-[#0b1326]">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M10.5 6.5 6.5 10.5a4 4 0 0 0 5.66 5.66l4-4A4 4 0 1 0 10.5 6.5Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 9 15 15" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm font-semibold text-zinc-950 transition group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
                {trSimilar(candidate.remoteId, "name", candidate.name)}
              </div>
              {scoreMeta ? (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-500/12 dark:text-blue-300">
                  {matchToneLabel(lang, scoreMeta.matchTone)}
                </span>
              ) : null}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
              <div className="rounded-2xl bg-white/60 px-3 py-2.5 dark:bg-white/6">
                <div className="font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">{t(lang, "company")}</div>
                <div className="mt-1 wrap-anywhere text-sm text-zinc-900 dark:text-zinc-100">
                  {trSimilar(candidate.remoteId, "company", candidate.company || "-")}
                </div>
              </div>
              <div className="rounded-2xl bg-white/60 px-3 py-2.5 dark:bg-white/6">
                <div className="font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">{t(lang, "activeIngredient")}</div>
                <div className="mt-1 wrap-anywhere text-sm text-zinc-900 dark:text-zinc-100">
                  {trSimilar(candidate.remoteId, "activeIngredient", candidate.activeIngredient || "-")}
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-violet-50 px-3 py-1 font-semibold text-violet-700 dark:bg-violet-500/12 dark:text-violet-300">
                {t(lang, "price")}: {candidate.price || "-"}
              </span>
              {scoreMeta ? (
                <span className="rounded-full bg-cyan-50 px-3 py-1 font-semibold text-cyan-700 dark:bg-cyan-500/12 dark:text-cyan-300">
                  {formatDosageForm(lang, scoreMeta.form)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(drugJsonLd) }} />

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3">
            <SmartBackLink lang={lang} />
            <Link
              href={`/${otherLang}/drug/${drug.remoteId}`}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/50 bg-white/70 px-4 text-sm font-medium text-zinc-950 transition hover:-translate-y-0.5 hover:border-blue-400 dark:border-white/10 dark:bg-white/7 dark:text-white dark:hover:border-blue-400"
            >
              {lang === "ar" ? t(lang, "langToEnglish") : t(lang, "langToArabic")}
            </Link>
          </div>

          <section className="section-shell rounded-[34px] p-6 sm:p-8">
            <div className="hero-orb hero-orb-a" />
            <div className="hero-orb hero-orb-b" />
            <div className="relative z-10 page-grid">
              <div className="space-y-5">
                <div className="glow-pill inline-flex rounded-full px-3 py-1 text-xs font-semibold text-zinc-900 dark:text-white">
                  {lang === "ar" ? "صفحة دواء ثابتة ومهيأة لمحركات البحث" : "Static-friendly, search-optimized drug page"}
                </div>
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">{t(lang, "overview")}</div>
                  <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">{drugName}</h1>
                  <div className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                    {lang === "ar"
                      ? "صفحة تفصيلية مصممة للتصفح السريع، الربط الداخلي، واقتراح بدائل أكثر دقة."
                      : "A fast, detailed page designed for internal linking, search discovery, and more accurate alternative suggestions."}
                  </div>
                  <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/12 dark:text-blue-300">
                    {t(lang, "idLabel")}: {drug.remoteId}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {summaryTiles.map((tile) => (
                    <div key={tile.label} className="premium-card rounded-3xl p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{tile.label}</div>
                      <div className="mt-3 text-base font-semibold text-zinc-950 dark:text-white">{tile.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  {rawCompany ? (
                    <Link href={`/${lang}/companies/${encodeURIComponent(rawCompany)}`} className="premium-card rounded-3xl p-4 transition hover:-translate-y-0.5">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{t(lang, "company")}</div>
                      <div className="mt-3 wrap-anywhere text-base font-semibold text-zinc-950 dark:text-white">{company || rawCompany}</div>
                    </Link>
                  ) : (
                    <div className="premium-card rounded-3xl p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{t(lang, "company")}</div>
                      <div className="mt-3 text-base font-semibold text-zinc-950 dark:text-white">-</div>
                    </div>
                  )}

                  {rawActiveIngredient ? (
                    <Link href={`/${lang}/active-ingredients/${encodeURIComponent(rawActiveIngredient)}`} className="premium-card rounded-3xl p-4 transition hover:-translate-y-0.5">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{t(lang, "activeIngredient")}</div>
                      <div className="mt-3 wrap-anywhere text-base font-semibold text-zinc-950 dark:text-white">{activeIngredient || rawActiveIngredient}</div>
                    </Link>
                  ) : (
                    <div className="premium-card rounded-3xl p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{t(lang, "activeIngredient")}</div>
                      <div className="mt-3 text-base font-semibold text-zinc-950 dark:text-white">-</div>
                    </div>
                  )}
                </div>
              </div>

              <aside className="space-y-4">
                {imageUrl ? (
                  <ImageLightbox
                    src={imageUrl}
                    alt={drugName}
                    lang={lang}
                    className="premium-card overflow-hidden rounded-[30px] p-3 text-left"
                    imgClassName="h-64 w-full object-contain p-4"
                  />
                ) : (
                  <div className="premium-card flex h-64 items-center justify-center rounded-[30px]">
                    <svg viewBox="0 0 24 24" className="h-14 w-14 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M10.5 6.5 6.5 10.5a4 4 0 0 0 5.66 5.66l4-4A4 4 0 1 0 10.5 6.5Z" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9 9 15 15" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}

                <div className="ad-slot rounded-[30px] p-5">
                  <div className="relative z-10">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
                      {lang === "ar" ? "موضع إعلاني ثابت" : "Stable ad slot"}
                    </div>
                    <div className="mt-3 text-lg font-semibold text-zinc-950 dark:text-white">
                      {lang === "ar" ? "مهيأ للربح مع تقليل القفز البصري" : "Monetization-ready with reduced layout shift"}
                    </div>
                    <div className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                      {lang === "ar"
                        ? "يمكن استخدام هذا الموضع لإعلانات داخلية أو وحدات AdSense بحجم ثابت."
                        : "This reserved area can host internal promotions or fixed-size AdSense units."}
                    </div>
                  </div>
                </div>

                <div className="premium-card rounded-[28px] p-5 text-amber-950 dark:text-amber-100">
                  <div className="text-sm font-semibold">{t(lang, "medicalDisclaimerTitle")}</div>
                  <div className="mt-2 text-sm leading-7 text-amber-900/80 dark:text-amber-100/80">{t(lang, "medicalDisclaimerBody")}</div>
                </div>
              </aside>
            </div>
          </section>

          <section className="section-shell rounded-[30px] p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">{t(lang, "basicInfo")}</h2>
              <div className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-zinc-600 dark:bg-white/6 dark:text-zinc-300">
                {t(lang, "price")}: {drug.price || "-"}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
              <div className="premium-card rounded-[24px] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{t(lang, "company")}</div>
                <div className="mt-3 wrap-anywhere text-base font-semibold text-zinc-950 dark:text-white">{company || "-"}</div>
              </div>
              <div className="premium-card rounded-[24px] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{t(lang, "activeIngredient")}</div>
                <div className="mt-3 wrap-anywhere text-base font-semibold text-zinc-950 dark:text-white">{activeIngredient || "-"}</div>
              </div>
              <div className="premium-card rounded-[24px] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{t(lang, "price")}</div>
                <div className="mt-3 text-base font-semibold text-zinc-950 dark:text-white">{drug.price || "-"}</div>
              </div>
              <div className="premium-card rounded-[24px] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{t(lang, "idLabel")}</div>
                <div className="mt-3 text-base font-semibold text-zinc-950 dark:text-white">{drug.remoteId}</div>
              </div>
            </div>
          </section>

          {descriptionSections.length
            ? descriptionSections.map((section, index) => (
                <section key={`${index}-${section.title}`} className="section-shell rounded-[30px] p-6">
                  <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">{section.title}</h2>
                  <div className="mt-4 whitespace-pre-wrap text-sm leading-8 text-zinc-700 dark:text-zinc-300">{section.body}</div>
                </section>
              ))
            : null}

          <section className="section-shell rounded-[32px] p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">{t(lang, "similarDrugs")}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">{alternativesIntro}</p>
              </div>
              <div className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-zinc-600 dark:bg-white/6 dark:text-zinc-300">
                {lang === "ar" ? `إجمالي الترشيحات: ${alternativesSorted.length}` : `Total suggestions: ${alternativesSorted.length}`}
              </div>
            </div>

            {alternativesSorted.length ? (
              <div className="mt-6 space-y-7">
                {cheaperAlternatives.length ? (
                  <div>
                    <div className="mb-3 text-sm font-semibold text-zinc-950 dark:text-white">{t(lang, "cheaperAlternatives")}</div>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      {cheaperAlternatives.slice(0, 12).map(renderAlternativeCard)}
                    </div>
                  </div>
                ) : null}

                {premiumAlternatives.length ? (
                  <div>
                    <div className="mb-3 text-sm font-semibold text-zinc-950 dark:text-white">
                      {lang === "ar" ? "أفضل البدائل المطابقة" : "Best matching alternatives"}
                    </div>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      {premiumAlternatives.slice(0, 12).map(renderAlternativeCard)}
                    </div>
                  </div>
                ) : null}

                {strictSameFormDifferentStrength.length ? (
                  <div>
                    <div className="mb-3 text-sm font-semibold text-zinc-950 dark:text-white">{t(lang, "differentStrengthAlternatives")}</div>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      {strictSameFormDifferentStrength.slice(0, 12).map(renderAlternativeCard)}
                    </div>
                  </div>
                ) : null}

                {otherAlternativesList.length ? (
                  <div>
                    <div className="mb-3 text-sm font-semibold text-zinc-950 dark:text-white">{t(lang, "otherAlternatives")}</div>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      {otherAlternativesList.slice(0, 12).map(renderAlternativeCard)}
                    </div>
                  </div>
                ) : null}

                {visibleOtherForms.length ? (
                  <div>
                    <div className="mb-3 text-sm font-semibold text-zinc-950 dark:text-white">{t(lang, "otherFormsAlternatives")}</div>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      {visibleOtherForms.slice(0, 12).map(renderAlternativeCard)}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">{t(lang, "noSimilar")}</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
