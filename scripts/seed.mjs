import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  const siteEmail = process.env.SEED_SITE_EMAIL || process.env.SITE_EMAIL || "";

  await prisma.siteSetting.upsert({
    where: { key: "site_name_ar" },
    update: { value: "موقع الأدوية" },
    create: { key: "site_name_ar", value: "موقع الأدوية" },
  });
  await prisma.siteSetting.upsert({
    where: { key: "site_name_en" },
    update: { value: "Drugs" },
    create: { key: "site_name_en", value: "Drugs" },
  });
  if (siteEmail) {
    await prisma.siteSetting.upsert({
      where: { key: "site_email" },
      update: { value: siteEmail },
      create: { key: "site_email", value: siteEmail },
    });
  }

  const articles = [
    {
      slug: "ar-safe-medication-use",
      lang: "ar",
      title: "استخدام الأدوية بأمان: دليل عملي للمريض",
      excerpt: "نصائح أساسية لتناول الدواء بشكل صحيح، وتجنب الأخطاء الشائعة، ومتى يجب استشارة الطبيب أو الصيدلي.",
      imageUrl:
        "https://images.unsplash.com/photo-1584305574647-0b0b0d3f4f1b?auto=format&fit=crop&w=1200&q=60",
      content:
        "هذا الدليل يشرح مبادئ استخدام الأدوية بأمان.\n\n1) اقرأ النشرة الداخلية واتبع الجرعة الموصوفة.\n2) لا تجمع أدوية متعددة دون استشارة مختص.\n3) انتبه للتداخلات الدوائية والحساسية.\n4) راقب الأعراض الجانبية وسجّلها.\n\nتنبيه: المحتوى للتثقيف العام ولا يغني عن الاستشارة الطبية.",
    },
    {
      slug: "en-safe-medication-use",
      lang: "en",
      title: "Safe Medication Use: A Practical Patient Guide",
      excerpt: "Key tips to take medications correctly, avoid common mistakes, and know when to consult a professional.",
      imageUrl:
        "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=60",
      content:
        "This guide covers practical basics for safer medication use.\n\n1) Follow the prescribed dose and read the leaflet.\n2) Avoid combining multiple medicines without professional advice.\n3) Be mindful of interactions and allergies.\n4) Track side effects and seek help when needed.\n\nDisclaimer: Educational content only.",
    },
    {
      slug: "ar-how-to-search-drug",
      lang: "ar",
      title: "كيف تبحث عن دواء بشكل صحيح؟",
      excerpt: "طريقة عملية للبحث حسب الاسم التجاري أو الشركة أو المادة الفعالة، مع نصائح لفهم المعلومات المعروضة.",
      imageUrl:
        "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=1200&q=60",
      content:
        "يمكنك البحث في قاعدة بيانات الأدوية بأكثر من طريقة:\n\n- الاسم التجاري\n- الشركة\n- المادة الفعالة\n\nاقرأ الوصف بعناية، ولا تعتمد على المعلومات وحدها لاتخاذ قرار علاجي.",
    },
    {
      slug: "en-how-to-search-drug",
      lang: "en",
      title: "How to Search for a Drug Correctly",
      excerpt: "A practical method to search by brand name, company, or active ingredient, plus tips to interpret the results.",
      imageUrl:
        "https://images.unsplash.com/photo-1582719478185-2a67a4d3f060?auto=format&fit=crop&w=1200&q=60",
      content:
        "You can search the database using:\n\n- Brand name\n- Company\n- Active ingredient\n\nAlways read the description carefully and consult a professional when needed.",
    },
  ];

  for (const a of articles) {
    await prisma.article.upsert({
      where: { slug: a.slug },
      update: {
        lang: a.lang,
        title: a.title,
        excerpt: a.excerpt,
        imageUrl: a.imageUrl,
        content: a.content,
        publishedAt: now,
      },
      create: {
        slug: a.slug,
        lang: a.lang,
        title: a.title,
        excerpt: a.excerpt,
        imageUrl: a.imageUrl,
        content: a.content,
        publishedAt: now,
      },
    });
  }

  const faqs = [
    {
      lang: "ar",
      order: 1,
      question: "هل المعلومات في الموقع بديل عن الطبيب؟",
      answer: "لا. المحتوى للتثقيف العام ولا يغني عن استشارة الطبيب أو الصيدلي.",
    },
    {
      lang: "ar",
      order: 2,
      question: "كيف أبحث عن الدواء؟",
      answer: "استخدم البحث بالاسم أو الشركة أو المادة الفعالة، ثم راجع النتائج واختر الدواء لعرض التفاصيل.",
    },
    {
      lang: "ar",
      order: 3,
      question: "ماذا أفعل إذا نسيت جرعة؟",
      answer:
        "اتبع إرشادات الطبيب/النشرة الداخلية. غالبًا تؤخذ الجرعة عند التذكر ما لم يقترب موعد الجرعة التالية. لا تضاعف الجرعات دون استشارة مختص.",
    },
    {
      lang: "en",
      order: 1,
      question: "Is the information a replacement for medical advice?",
      answer: "No. This content is educational and does not replace professional medical advice.",
    },
    {
      lang: "en",
      order: 2,
      question: "How do I search the database?",
      answer: "Use the search by name, company, or active ingredient, then open the drug page for details.",
    },
    {
      lang: "en",
      order: 3,
      question: "What if I miss a dose?",
      answer:
        "Follow your clinician's instructions and the medication leaflet. Common advice is to take it when remembered unless it's close to the next dose. Do not double doses without professional advice.",
    },
  ];

  for (const f of faqs) {
    const existing = await prisma.faq.findFirst({
      where: { lang: f.lang, order: f.order, question: f.question },
      select: { id: true },
    });

    if (existing) {
      await prisma.faq.update({
        where: { id: existing.id },
        data: { answer: f.answer },
      });
    } else {
      await prisma.faq.create({
        data: { lang: f.lang, order: f.order, question: f.question, answer: f.answer },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
