import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { SUPPORT_CHAT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { getActiveAiProviderLabel, getDefaultTextModel, hasConfiguredAiProvider } from "@/lib/ai/provider";

export const maxDuration = 30;

type IncomingMessage = {
  role?: string;
  text?: string;
  parts?: Array<{ type?: string; text?: string }>;
};

function extractMessageText(message: IncomingMessage) {
  if (typeof message.text === "string" && message.text.trim()) {
    return message.text.trim();
  }

  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((part) => part?.type === "text" && typeof part.text === "string")
      .map((part) => part.text!.trim())
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

function isArabicText(text: string) {
  return /[\u0600-\u06FF]/.test(text);
}

function buildReply(lines: string[]) {
  return lines.filter(Boolean).join("\n\n");
}

function mentions(normalized: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(normalized));
}

function getFallbackReply(input: string) {
  const normalized = input.toLowerCase();
  const arabic = isArabicText(input);

  if (
    mentions(normalized, [
      /(plan|pricing|tier|price|monthly|yearly|cheapest|best plan|choose.*plan)/,
      /(الخطة|الخطط|السعر|الأسعار|الباقة|الباقات|الاشتراك|شهري|سنوي)/,
    ])
  ) {
    return arabic
      ? buildReply([
          "لاختيار الخطة المناسبة بسرعة:",
          "• اختر `Starter` إذا كنت تبدأ بموقع واحد وتريد إطلاقًا بسيطًا مع دعم أساسي.",
          "• اختر `Growth` إذا كنت تحتاج مرونة أكبر، دعمًا أفضل، وتوسّعًا مريحًا بعد الإطلاق.",
          "• اختر `Pro` إذا كان المشروع مهمًا تجاريًا وتريد أولوية أعلى ودعمًا أعمق.",
          "• إذا كانت لديك متطلبات خاصة أو أكثر من موقع أو تنسيق مخصص، فابدأ من صفحة `Pricing` ثم تواصل معنا من `Contact` أو افتح تذكرة دعم.",
          "إذا أخبرتني بنوع موقعك وعدد المواقع وهل تحتاج دومين مخصص، يمكنني أن أرشح لك الخطة الأقرب مباشرة.",
        ])
      : buildReply([
          "A quick way to choose the right plan:",
          "• Pick `Starter` if you are launching one website and want a simple managed start.",
          "• Pick `Growth` if you need more flexibility, stronger support, and room to grow after launch.",
          "• Pick `Pro` if the website matters commercially and you want higher-priority help and deeper coverage.",
          "• If you need something unusual, multiple sites, or a more tailored scope, start from the `Pricing` page and then contact Univert or open a support ticket.",
          "If you tell me what kind of site you want, how many websites you need, and whether you need a custom domain, I can suggest the closest plan.",
        ]);
  }

  if (
    mentions(normalized, [
      /(wordpress|laravel|next\.?js|stack|which stack|choose.*stack)/,
      /(ووردبريس|لارافيل|نكست|ستاك|أي.*stack|أي.*تقنية)/,
    ])
  ) {
    return arabic
      ? buildReply([
          "اختيار الـ stack في Univert يعتمد على طريقة عمل مشروعك:",
          "• `WordPress`: الأفضل إذا كنت تريد أسهل تجربة لتحرير المحتوى والصفحات بعد الإطلاق.",
          "• `Laravel`: الأفضل إذا كان المشروع يحتاج منطقًا مخصصًا أو تدفقات عمل أو لوحة أعمال خاصة.",
          "• `Next.js`: الأفضل للمواقع التسويقية الحديثة وتجربة واجهة سريعة ومظهر منتج احترافي.",
          "كقاعدة سريعة: محتوى سهل = WordPress، منطق أعمال مخصص = Laravel، واجهة حديثة وأداء قوي = Next.js.",
          "إذا أخبرتني بنوع نشاطك، أستطيع أن أرشح لك الـ stack والقالب الأقرب.",
        ])
      : buildReply([
          "Choosing the right stack in Univert depends on how the website will be used:",
          "• `WordPress`: best when your team wants the easiest content editing experience after launch.",
          "• `Laravel`: best when the project needs custom business logic, workflows, or a more tailored backend setup.",
          "• `Next.js`: best for polished modern marketing sites and fast presentation-focused experiences.",
          "Quick rule: easy content editing = WordPress, custom workflows = Laravel, modern presentation and speed = Next.js.",
          "If you tell me your business type, I can suggest the closest stack and template.",
        ]);
  }

  if (
    mentions(normalized, [
      /(template|demo|restaurant|store|shop|portfolio|agency|business site|saas|marketplace)/,
      /(قالب|قوالب|ديمو|مطعم|متجر|بورتفوليو|وكالة|شركة|ساس|ماركت بليس)/,
    ])
  ) {
    return arabic
      ? buildReply([
          "يمكنني مساعدتك في اختيار القالب حسب النشاط:",
          "• مطعم أو كافيه: اختر فئة `Restaurant`.",
          "• متجر ومنتجات: اختر `Store / E-commerce`.",
          "• شركة أو خدمات: اختر `Business` أو `Corporate`.",
          "• معرض أعمال أو شخصي: اختر `Portfolio`.",
          "• وكالة أو فريق يقدم خدمات: اختر `Agency`.",
          "• منصة أو منتج برمجي: انظر إلى `SaaS` أو `Marketplace` حسب طبيعة المشروع.",
          "أفضل خطوة الآن هي `Templates` أو `Live Demos`، وإذا أردت يمكنني مساعدتك في تضييق الاختيار حسب نشاطك.",
        ])
      : buildReply([
          "I can help narrow templates by business type:",
          "• Restaurant or cafe: choose the `Restaurant` category.",
          "• Product selling or catalog: choose `Store / E-commerce`.",
          "• Company or services website: choose `Business` or `Corporate`.",
          "• Personal brand or showcase: choose `Portfolio`.",
          "• Client service team: choose `Agency`.",
          "• Product-led business: look at `SaaS` or `Marketplace` depending on the concept.",
          "The best next step is to browse `Templates` or `Live Demos`, and I can help narrow the shortlist if you tell me your business type.",
        ]);
  }

  if (/(domain|dns|ssl|subdomain|custom domain|دومين|نطاق)/.test(normalized)) {
    return arabic
      ? buildReply([
          "طريقة الدومين في Univert بسيطة:",
          "• تبدأ عادةً على `subdomain` سريع حتى يتم تجهيز الموقع.",
          "• يمكنك ربط `custom domain` لاحقًا من الداشبورد.",
          "• يشمل ذلك شرح خطوات DNS وSSL بشكل موجه وليس تقنيًا قدر الإمكان.",
          "إذا كانت المشكلة مرتبطة بحالة التحقق الفعلية أو دومين موقعك الحالي، افتح تذكرة دعم من داخل الداشبورد حتى يراجع الفريق الحالة مباشرة.",
        ])
      : buildReply([
          "The domain flow in Univert is straightforward:",
          "• You can start on a fast subdomain while the website is being prepared.",
          "• You can connect a custom domain later from the dashboard.",
          "• DNS and SSL are handled through guided steps rather than low-level technical instructions.",
          "If the issue is tied to your actual verification status or a live domain on your account, please open a support ticket so the team can inspect it directly.",
        ]);
  }

  if (/(billing|invoice|payment|renew|refund|الفاتورة|الدفع|الاشتراك|التجديد)/.test(normalized)) {
    return arabic
      ? buildReply([
          "أستطيع شرح الفوترة والخطط بشكل عام، لكن تفاصيل الدفع الفعلية مرتبطة بالحساب.",
          "إذا كانت لديك مشكلة في فاتورة أو دفعة أو تجديد، افتح تذكرة دعم من داخل الداشبورد حتى يراجع الفريق بيانات حسابك بأمان.",
        ])
      : buildReply([
          "I can explain billing and plans at a high level, but real payment, invoice, and renewal issues are account-specific.",
          "If you have a billing problem, please open a dashboard support ticket so the team can review your account safely.",
        ]);
  }

  if (/(credential|login|password|access|بيانات الدخول|كلمة المرور|الدخول)/.test(normalized)) {
    return arabic
      ? buildReply([
          "إذا كان سؤالك عن بيانات الدخول أو الوصول إلى موقعك، فهذا يحتاج مراجعة مرتبطة بحسابك.",
          "الأفضل فتح تذكرة دعم من داخل الداشبورد حتى يتحقق الفريق من حالة الإعداد ويسلّم بيانات الوصول الصحيحة.",
        ])
      : buildReply([
          "If your question is about credentials or website access, that needs account-specific review.",
          "Please create a support ticket from the dashboard so the team can verify the setup status and provide the right access details.",
        ]);
  }

  if (/(launch|setup|provision|ready|failed|error|لا يعمل|فشل|خطأ|غير جاهز)/.test(normalized)) {
    return arabic
      ? buildReply([
          "مسار الإطلاق في Univert عادةً يكون كالتالي:",
          "• اختيار القالب أو الديمو المناسب.",
          "• اختيار الـ subdomain أو اسم المشروع.",
          "• بدء الإعداد المُدار من طرف الفريق.",
          "• ظهور رابط الموقع وبيانات الدخول عندما يصبح الموقع جاهزًا.",
          "إذا كان لديك موقع محدد متأخر أو غير جاهز أو يظهر خطأ، افتح تذكرة دعم حتى يراجع الفريق الحالة الدقيقة.",
        ])
      : buildReply([
          "The usual launch path in Univert is:",
          "• choose the template or demo,",
          "• choose the subdomain or project name,",
          "• managed setup begins,",
          "• the website URL and credentials appear when the site is ready.",
          "If a specific website is delayed, not ready, or showing an error, please open a support ticket so the team can inspect the exact status.",
        ]);
  }

  if (/(migration|export|ownership|handoff|نقل|هجرة|تصدير|ملكية)/.test(normalized)) {
    return arabic
      ? buildReply([
          "الملكية والنقل جزء أساسي من وعد Univert.",
          "يمكنك البدء بتجربة مُدارة الآن، ومع نمو المشروع يبقى لديك مسار لاحق لطلب التصدير أو النقل أو التسليم.",
          "إذا كنت تريد بدء طلب فعلي للنقل أو التصدير، افتح تذكرة دعم حتى تتم المتابعة بشكل صحيح مع فريقنا.",
        ])
      : buildReply([
          "Ownership and migration are a core part of the Univert promise.",
          "You can start with the managed experience now while keeping a future path for export, migration, or handoff later.",
          "If you want to begin a real export or migration request, please open a support ticket so the team can handle it correctly.",
        ]);
  }

  if (
    mentions(normalized, [
      /(support|help center|human|agent|contact support|talk to support)/,
      /(دعم|مساعدة|مركز المساعدة|موظف|فريق الدعم|التواصل مع الدعم)/,
    ])
  ) {
    return arabic
      ? buildReply([
          "إذا كنت تحتاج مساعدة عامة، ابدأ من `Help Center` داخل الموقع أو الداشبورد.",
          "إذا كان السؤال مرتبطًا بحسابك أو موقعك أو الدومين أو الفوترة، استخدم زر `Create Ticket` من داخل هذه النافذة أو اذهب إلى صفحة `Support` في الداشبورد.",
        ])
      : buildReply([
          "If you need general guidance, start from the `Help Center` inside the site or dashboard.",
          "If the issue is tied to your account, website, domain, or billing, use the `Create Ticket` action in this widget or open the `Support` page in the dashboard.",
        ]);
  }

  return arabic
    ? buildReply([
        "أنا مساعد دعم Univert.",
        "أستطيع مساعدتك في اختيار القالب، فهم الخطط، شرح الإطلاق، ربط الدومين، والملكية بعد الإطلاق.",
        "إذا كان طلبك مرتبطًا بحسابك أو بموقع محدد، افتح تذكرة دعم من داخل الداشبورد وسيتابعها الفريق.",
      ])
    : buildReply([
        "I’m the Univert support assistant.",
        "I can help with templates, plans, launch flow, domains, and ownership questions.",
        "If your request is tied to a specific account or website, please open a support ticket from the dashboard so the team can follow up.",
      ]);
}

async function generateModelReply(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  signal: AbortSignal,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("ai-timeout"), 8000);
  const abort = () => controller.abort("request-aborted");
  signal.addEventListener("abort", abort, { once: true });

  try {
    return await generateText({
      model: getDefaultTextModel(),
      system: SUPPORT_CHAT_SYSTEM_PROMPT,
      messages,
      abortSignal: controller.signal,
      maxOutputTokens: 800,
    });
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener("abort", abort);
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    messages?: IncomingMessage[];
  };

  const messages = Array.isArray(body.messages)
    ? body.messages
        .map((message) => {
          const text = extractMessageText(message);
          const role = message.role === "assistant" ? "assistant" : "user";
          return text ? { role, content: text } : null;
        })
        .filter(Boolean)
    : [];

  const latestUserMessage =
    [...messages].reverse().find((message) => message?.role === "user")?.content || "";

  if (!messages.length) {
    return NextResponse.json({
      message:
        "Hello! I can help with templates, launch, domains, support, and ownership questions.",
      source: "fallback",
    });
  }

  if (!hasConfiguredAiProvider()) {
    return NextResponse.json({
      message: getFallbackReply(latestUserMessage),
      source: "fallback",
      reason: "missing-ai-provider",
      provider: getActiveAiProviderLabel(),
    });
  }

  try {
    const result = await generateModelReply(
      messages as Array<{ role: "user" | "assistant"; content: string }>,
      request.signal,
    );

    const text = result.text?.trim();

    return NextResponse.json({
      message: text || getFallbackReply(latestUserMessage),
      source: text ? "model" : "fallback",
      provider: getActiveAiProviderLabel(),
    });
  } catch {
    return NextResponse.json({
      message: getFallbackReply(latestUserMessage),
      source: "fallback",
      reason: "model-unavailable",
      provider: getActiveAiProviderLabel(),
    });
  }
}
