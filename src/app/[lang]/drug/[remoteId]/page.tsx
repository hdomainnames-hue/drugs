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

type AlternativeDrug = Prisma.DrugGetPayload<{
  select: {
    remoteId: true;
    name: true;
    company: true;
    activeIngredient: true;
    price: true;
    imageSourceUrl: true;
    imageLocalPath: true;
  };
}>;

type AgeGroup = "kids" | "adults" | "unknown";

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

function areDosageFormsCompatible(a: DosageForm, b: DosageForm) {
  if (a === "unknown" || a === "other" || b === "unknown" || b === "other") return true;
  if (a === b) return true;
  const oralLiquid = new Set<DosageForm>(["syrup", "suspension"]);
  if (oralLiquid.has(a) && oralLiquid.has(b)) return true;
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

function detectAgeGroup(name: string, activeIngredient: string) {
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

  if (kidsHints.some((k) => s.includes(k))) return "kids" as const;
  if (adultHints.some((k) => s.includes(k))) return "adults" as const;
  return "unknown" as const;
}

function detectDosageForm(name: string) {
  const s = normalizeText(name);
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

function splitActiveTokens(activeIngredient: string) {
  const s = normalizeText(activeIngredient);
  return s
    .split(/[\+\/,&؛،]/g)
    .map((x) => x.trim())
    .filter((x) => x.length >= 3)
    .slice(0, 4);
}

function includesAllTokens(hay: string, tokens: string[]) {
  const h = normalizeText(hay);
  return tokens.every((t) => h.includes(normalizeText(t)));
}

function toInt(v: string) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : NaN;
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
  const currentDosageForm = detectDosageForm(drug.name);
  const currentStrengthKey = extractStrengthKey(drug.name, rawActiveIngredient);

  const activeTokens = splitActiveTokens(rawActiveIngredient);

  const alternativesCandidates: AlternativeDrug[] = activeTokens.length
    ? ((await prisma.drug.findMany({
        where: {
          remoteId: { not: drug.remoteId },
          AND: activeTokens.map((tok) => ({
            activeIngredient: {
              contains: tok,
              mode: "insensitive",
            },
          })),
        },
        take: 250,
        select: {
          remoteId: true,
          name: true,
          company: true,
          activeIngredient: true,
          price: true,
          imageSourceUrl: true,
          imageLocalPath: true,
        },
      })) as AlternativeDrug[])
    : [];

  const alternativesFiltered = alternativesCandidates
    .filter((d) => includesAllTokens(d.activeIngredient || "", activeTokens))
    .filter((d) => {
      const ag = detectAgeGroup(d.name, d.activeIngredient || "");
      if (currentAgeGroup === "unknown" || ag === "unknown") return true;
      return ag === currentAgeGroup;
    });

  const scored = alternativesFiltered
    .map((d) => {
      const form = detectDosageForm(d.name);
      const strength = extractStrengthKey(d.name, d.activeIngredient || "");
      const exactStrength = Boolean(currentStrengthKey && strength && strength === currentStrengthKey);
      const strictSameForm =
        currentDosageForm !== "unknown" &&
        currentDosageForm !== "other" &&
        form !== "unknown" &&
        form !== "other" &&
        areDosageFormsCompatible(form, currentDosageForm);
      const sameForm =
        areDosageFormsCompatible(form, currentDosageForm);
      const exactActive = normalizeText(d.activeIngredient) === normalizeText(rawActiveIngredient);
      const score = (exactActive ? 100 : 0) + (sameForm ? 40 : 0) + (exactStrength ? 60 : 0);
      return {
        drug: d,
        score,
        exactStrength,
        sameForm,
        strictSameForm,
        form,
        strengthKey: strength,
        priceNum: parsePrice(d.price),
      };
    })
    .sort((a, b) => {
      if (a.sameForm !== b.sameForm) return a.sameForm ? -1 : 1;
      if (a.exactStrength !== b.exactStrength) return a.exactStrength ? -1 : 1;
      if (a.score !== b.score) return b.score - a.score;
      if (a.priceNum !== b.priceNum) return a.priceNum - b.priceNum;
      return a.drug.remoteId - b.drug.remoteId;
    });

  const sameFormExactStrength = scored
    .filter((x) => x.sameForm && x.exactStrength)
    .map((x) => x.drug);

  const sameFormDifferentStrength = scored
    .filter((x) => {
      if (!x.sameForm) return false;
      if (x.exactStrength) return false;
      if (!currentStrengthKey) return false;
      return Boolean(x.strengthKey && x.strengthKey !== currentStrengthKey);
    })
    .map((x) => x.drug);

  const sameFormUnknownStrength = scored
    .filter((x) => {
      if (!x.sameForm) return false;
      if (x.exactStrength) return false;
      if (currentStrengthKey && x.strengthKey) return false;
      return true;
    })
    .map((x) => x.drug);

  const hasAnyStrictSameForm = scored.some((x) => x.strictSameForm);

  const otherFormsAlternatives = scored
    .filter((x) => {
      if (!hasAnyStrictSameForm) return false;
      if (currentDosageForm === "unknown" || currentDosageForm === "other") return false;
      if (x.form === "unknown" || x.form === "other") return false;
      return !areDosageFormsCompatible(x.form, currentDosageForm);
    })
    .map((x) => x.drug);

  const cheaperAlternatives = Number.isFinite(currentPrice)
    ? sameFormExactStrength.filter((d) => {
        const p = parsePrice(d.price);
        return Number.isFinite(p) && p < currentPrice;
      })
    : [];

  const otherAlternatives = Number.isFinite(currentPrice)
    ? sameFormExactStrength.filter((d) => {
        const p = parsePrice(d.price);
        return !(Number.isFinite(p) && p < currentPrice);
      })
    : sameFormExactStrength;

  const alternativesSorted = [
    ...sameFormExactStrength,
    ...sameFormDifferentStrength,
    ...sameFormUnknownStrength,
    ...otherFormsAlternatives,
  ];

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

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(drugJsonLd) }}
        />
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3">
            <SmartBackLink lang={lang} />

            <Link
              href={`/${otherLang}/drug/${drug.remoteId}`}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
            >
              {lang === "ar" ? t(lang, "langToEnglish") : t(lang, "langToArabic")}
            </Link>
          </div>

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "overview")}</div>
                {imageUrl ? (
                  <ImageLightbox
                    src={imageUrl}
                    alt={drugName}
                    lang={lang}
                    className="mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white text-left dark:border-zinc-800 dark:bg-zinc-950"
                    imgClassName="h-48 w-full object-contain p-3 sm:h-56"
                  />
                ) : null}
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{drugName}</h1>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t(lang, "idLabel")}: {drug.remoteId}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-black/40">
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "price")}</div>
                  <div className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">{drug.price || "-"}</div>
                </div>
                {rawCompany ? (
                  <Link
                    href={`/${lang}/companies/${encodeURIComponent(rawCompany)}`}
                    className="block rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-black/40 dark:hover:border-zinc-600"
                  >
                    <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "company")}</div>
                    <div className="mt-1 min-w-0 overflow-hidden text-ellipsis text-sm font-semibold leading-6 text-zinc-950 wrap-anywhere dark:text-zinc-50">
                      {company || rawCompany}
                    </div>
                  </Link>
                ) : (
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-black/40">
                    <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "company")}</div>
                    <div className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">-</div>
                  </div>
                )}

                {rawActiveIngredient ? (
                  <Link
                    href={`/${lang}/active-ingredients/${encodeURIComponent(rawActiveIngredient)}`}
                    className="block rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-black/40 dark:hover:border-zinc-600"
                  >
                    <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "activeIngredient")}</div>
                    <div className="mt-1 min-w-0 overflow-hidden text-ellipsis text-sm font-semibold leading-6 text-zinc-950 wrap-anywhere dark:text-zinc-50">
                      {activeIngredient || rawActiveIngredient}
                    </div>
                  </Link>
                ) : (
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-black/40">
                    <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "activeIngredient")}</div>
                    <div className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">-</div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                <div className="text-sm font-semibold">{t(lang, "medicalDisclaimerTitle")}</div>
                <div className="mt-1 text-xs leading-6">{t(lang, "medicalDisclaimerBody")}</div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{t(lang, "basicInfo")}</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              {rawCompany ? (
                <Link
                  href={`/${lang}/companies/${encodeURIComponent(rawCompany)}`}
                  className="block rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                >
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "company")}</div>
                  <div className="mt-1 min-w-0 overflow-hidden text-ellipsis font-semibold leading-6 text-zinc-950 wrap-anywhere dark:text-zinc-50">
                    {company || rawCompany}
                  </div>
                </Link>
              ) : (
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "company")}</div>
                  <div className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">-</div>
                </div>
              )}

              {rawActiveIngredient ? (
                <Link
                  href={`/${lang}/active-ingredients/${encodeURIComponent(rawActiveIngredient)}`}
                  className="block rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                >
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "activeIngredient")}</div>
                  <div className="mt-1 min-w-0 overflow-hidden text-ellipsis font-semibold leading-6 text-zinc-950 wrap-anywhere dark:text-zinc-50">
                    {activeIngredient || rawActiveIngredient}
                  </div>
                </Link>
              ) : (
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "activeIngredient")}</div>
                  <div className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">-</div>
                </div>
              )}
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "price")}</div>
                <div className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">{drug.price || "-"}</div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "idLabel")}</div>
                <div className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">{drug.remoteId}</div>
              </div>
            </div>
          </section>

          {descriptionSections.length
            ? descriptionSections.map((s, idx) => (
                <section
                  key={`${idx}-${s.title}`}
                  className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{s.title}</h2>
                  <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-700 dark:text-zinc-300">{s.body}</div>
                </section>
              ))
            : null}

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{t(lang, "similarDrugs")}</h2>

            {alternativesSorted.length ? (
              <div className="mt-4 space-y-6">
                {cheaperAlternatives.length ? (
                  <div>
                    <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{t(lang, "cheaperAlternatives")}</div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {cheaperAlternatives.slice(0, 24).map((d) => (
                        <Link
                          key={d.remoteId}
                          href={`/${lang}/drug/${d.remoteId}`}
                          className="group rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                        >
                          <div className="flex flex-row-reverse items-start gap-3">
                            {(() => {
                              const src = d.imageSourceUrl || d.imageLocalPath;
                              const thumb = !src
                                ? null
                                : src.startsWith("http://") || src.startsWith("https://")
                                  ? src
                                  : src.startsWith("/")
                                    ? src
                                    : null;
                              return thumb ? (
                                <img
                                  src={thumb}
                                  alt={trSimilar(d.remoteId, "name", d.name)}
                                  loading="lazy"
                                  className="h-12 w-12 flex-none rounded-xl border border-zinc-200 bg-white object-contain p-1 dark:border-zinc-800 dark:bg-zinc-950"
                                />
                              ) : (
                                <div className="h-12 w-12 flex-none rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-black/40" />
                              );
                            })()}

                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-zinc-950 group-hover:underline dark:text-zinc-50">
                                {trSimilar(d.remoteId, "name", d.name)}
                              </div>
                              <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                                <div>
                                  {t(lang, "company")}: {trSimilar(d.remoteId, "company", d.company || "-")}
                                </div>
                                <div>
                                  {t(lang, "activeIngredient")}: {trSimilar(d.remoteId, "activeIngredient", d.activeIngredient || "-")}
                                </div>
                                <div>
                                  {t(lang, "price")}: {d.price || "-"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {sameFormDifferentStrength.length ? (
                  <div>
                    <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                      {t(lang, "differentStrengthAlternatives")}
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {sameFormDifferentStrength.slice(0, 24).map((d) => (
                        <Link
                          key={d.remoteId}
                          href={`/${lang}/drug/${d.remoteId}`}
                          className="group rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                        >
                          <div className="flex flex-row-reverse items-start gap-3">
                            {(() => {
                              const src = d.imageSourceUrl || d.imageLocalPath;
                              const thumb = !src
                                ? null
                                : src.startsWith("http://") || src.startsWith("https://")
                                  ? src
                                  : src.startsWith("/")
                                    ? src
                                    : null;
                              return thumb ? (
                                <img
                                  src={thumb}
                                  alt={trSimilar(d.remoteId, "name", d.name)}
                                  loading="lazy"
                                  className="h-12 w-12 flex-none rounded-xl border border-zinc-200 bg-white object-contain p-1 dark:border-zinc-800 dark:bg-zinc-950"
                                />
                              ) : (
                                <div className="h-12 w-12 flex-none rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-black/40" />
                              );
                            })()}

                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-zinc-950 group-hover:underline dark:text-zinc-50">
                                {trSimilar(d.remoteId, "name", d.name)}
                              </div>
                              <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                                <div>
                                  {t(lang, "company")}: {trSimilar(d.remoteId, "company", d.company || "-")}
                                </div>
                                <div>
                                  {t(lang, "activeIngredient")}: {trSimilar(d.remoteId, "activeIngredient", d.activeIngredient || "-")}
                                </div>
                                <div>
                                  {t(lang, "price")}: {d.price || "-"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {otherAlternatives.length || sameFormUnknownStrength.length ? (
                  <div>
                    <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{t(lang, "otherAlternatives")}</div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[...otherAlternatives, ...sameFormUnknownStrength].slice(0, 24).map((d) => (
                        <Link
                          key={d.remoteId}
                          href={`/${lang}/drug/${d.remoteId}`}
                          className="group rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                        >
                          <div className="flex flex-row-reverse items-start gap-3">
                            {(() => {
                              const src = d.imageSourceUrl || d.imageLocalPath;
                              const thumb = !src
                                ? null
                                : src.startsWith("http://") || src.startsWith("https://")
                                  ? src
                                  : src.startsWith("/")
                                    ? src
                                    : null;
                              return thumb ? (
                                <img
                                  src={thumb}
                                  alt={trSimilar(d.remoteId, "name", d.name)}
                                  loading="lazy"
                                  className="h-12 w-12 flex-none rounded-xl border border-zinc-200 bg-white object-contain p-1 dark:border-zinc-800 dark:bg-zinc-950"
                                />
                              ) : (
                                <div className="h-12 w-12 flex-none rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-black/40" />
                              );
                            })()}

                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-zinc-950 group-hover:underline dark:text-zinc-50">
                                {trSimilar(d.remoteId, "name", d.name)}
                              </div>
                              <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                                <div>
                                  {t(lang, "company")}: {trSimilar(d.remoteId, "company", d.company || "-")}
                                </div>
                                <div>
                                  {t(lang, "activeIngredient")}: {trSimilar(d.remoteId, "activeIngredient", d.activeIngredient || "-")}
                                </div>
                                <div>
                                  {t(lang, "price")}: {d.price || "-"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {otherFormsAlternatives.length ? (
                  <div>
                    <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{t(lang, "otherFormsAlternatives")}</div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {otherFormsAlternatives.slice(0, 24).map((d) => (
                        <Link
                          key={d.remoteId}
                          href={`/${lang}/drug/${d.remoteId}`}
                          className="group rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                        >
                          <div className="flex flex-row-reverse items-start gap-3">
                            {(() => {
                              const src = d.imageSourceUrl || d.imageLocalPath;
                              const thumb = !src
                                ? null
                                : src.startsWith("http://") || src.startsWith("https://")
                                  ? src
                                  : src.startsWith("/")
                                    ? src
                                    : null;
                              return thumb ? (
                                <img
                                  src={thumb}
                                  alt={trSimilar(d.remoteId, "name", d.name)}
                                  loading="lazy"
                                  className="h-12 w-12 flex-none rounded-xl border border-zinc-200 bg-white object-contain p-1 dark:border-zinc-800 dark:bg-zinc-950"
                                />
                              ) : (
                                <div className="h-12 w-12 flex-none rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-black/40" />
                              );
                            })()}

                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-zinc-950 group-hover:underline dark:text-zinc-50">
                                {trSimilar(d.remoteId, "name", d.name)}
                              </div>
                              <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                                <div>
                                  {t(lang, "company")}: {trSimilar(d.remoteId, "company", d.company || "-")}
                                </div>
                                <div>
                                  {t(lang, "activeIngredient")}: {trSimilar(d.remoteId, "activeIngredient", d.activeIngredient || "-")}
                                </div>
                                <div>
                                  {t(lang, "price")}: {d.price || "-"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{t(lang, "noSimilar")}</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
