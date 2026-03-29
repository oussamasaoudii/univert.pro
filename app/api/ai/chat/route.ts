import { type NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { SUPPORT_CHAT_SYSTEM_PROMPT } from "@/lib/ai/prompts";

export const maxDuration = 30;

interface ChatRequestMessage {
  role: "user" | "assistant";
  text: string;
}

function detectArabic(text: string) {
  return /[\u0600-\u06FF]/.test(text);
}

function buildFallbackReply(input: string) {
  const message = input.toLowerCase();
  const isArabic = detectArabic(input);

  if (
    message.includes("plan") ||
    message.includes("pricing") ||
    message.includes("price") ||
    message.includes("subscription") ||
    message.includes("باقة") ||
    message.includes("سعر") ||
    message.includes("اشتراك")
  ) {
    return isArabic
      ? "يمكنني مساعدتك في اختيار الباقة. بشكل عام: Starter مناسبة لموقع واحد بسيط، Growth مناسبة للأعمال التي تحتاج أكثر من موقع أو دعم أقوى، وPro/Premium للمشاريع الأكبر. إذا أخبرتني بعدد المواقع والدومينات والدعم الذي تحتاجه سأرشح لك الأنسب."
      : "I can help you choose a plan. In general, Starter fits a simple single-site launch, Growth fits businesses that need more than one site or stronger support, and Pro/Premium fit larger operations. If you tell me how many websites, domains, and support needs you have, I can narrow it down.";
  }

  if (
    message.includes("template") ||
    message.includes("theme") ||
    message.includes("demo") ||
    message.includes("قالب") ||
    message.includes("ديمو")
  ) {
    return isArabic
      ? "لدينا قوالب جاهزة لفئات مثل الأعمال، المتاجر، البورتفوليو، صفحات الهبوط، والمدونات. إذا أخبرتني بنوع مشروعك وهل تريد WordPress أو Laravel أو Next.js، سأساعدك في تضييق الخيارات بسرعة."
      : "We offer launch-ready templates for business sites, stores, portfolios, landing pages, and blogs. Tell me what kind of website you need and whether you prefer WordPress, Laravel, or Next.js, and I’ll help you narrow the options quickly.";
  }

  if (
    message.includes("setup") ||
    message.includes("launch") ||
    message.includes("how long") ||
    message.includes("وقت") ||
    message.includes("اطلاق") ||
    message.includes("إطلاق") ||
    message.includes("إعداد")
  ) {
    return isArabic
      ? "بعد اختيار القالب والخطة واسم النطاق الفرعي، يبدأ فريق Univert الإعداد. عادةً ستظهر حالة الإعداد داخل لوحة التحكم، وعندما يصبح الموقع جاهزًا ستظهر بيانات الوصول والرابط إذا كانت متاحة."
      : "After you choose a template, plan, and subdomain, the Univert team starts the setup process. You can track progress in the dashboard, and when the website is ready the live URL and access details appear there when available.";
  }

  if (
    message.includes("domain") ||
    message.includes("dns") ||
    message.includes("ssl") ||
    message.includes("دومين") ||
    message.includes("نطاق")
  ) {
    return isArabic
      ? "يمكنك البدء بنطاق فرعي من Univert ثم ربط دومينك لاحقًا. إذا كنت تحتاج مساعدة في DNS أو SSL أو نقل الدومين، يمكنني أيضًا اقتراح فتح تذكرة دعم لتسريع المعالجة."
      : "You can start with a Univert subdomain and connect your own domain later. If you need help with DNS, SSL, or domain transfer, I can also suggest opening a support ticket for faster handling.";
  }

  if (
    message.includes("migrate") ||
    message.includes("migration") ||
    message.includes("export") ||
    message.includes("ownership") ||
    message.includes("نقل") ||
    message.includes("تصدير") ||
    message.includes("ملكية")
  ) {
    return isArabic
      ? "نعم، فلسفة Univert تقوم على عدم حبس العميل. يمكنك البدء معنا بخدمة مُدارة ثم طلب التصدير أو النقل لاحقًا حسب حالة مشروعك وخطتك. إذا أردت، أشرح لك مسار الملكية والنقل خطوة بخطوة."
      : "Yes. Univert is positioned around no lock-in. You can launch with managed support and later request export or migration depending on your setup and plan. If you want, I can walk you through the ownership and migration path step by step.";
  }

  if (
    message.includes("login") ||
    message.includes("credential") ||
    message.includes("access") ||
    message.includes("billing") ||
    message.includes("فاتورة") ||
    message.includes("دخول") ||
    message.includes("بيانات")
  ) {
    return isArabic
      ? "هذا النوع من الطلبات قد يحتاج فحصًا لحسابك أو موقعك مباشرة. أستطيع مساعدتك بالمعلومات العامة، وإذا كانت المشكلة تخص الوصول أو الفوترة أو بيانات الدخول فالأفضل إنشاء تذكرة دعم من داخل الويدجت."
      : "That kind of request may require checking your account or website directly. I can help with general guidance, and if the issue is about access, billing, or credentials, the best next step is creating a support ticket from the widget.";
  }

  return isArabic
    ? "أنا هنا لمساعدتك في الخطط، القوالب، الإطلاق، الدومينات، الدعم، والملكية والنقل. اكتب لي ما الذي تريد تنفيذه أو ما الذي يحيّرك، وسأرشدك للخطوة التالية المناسبة."
    : "I’m here to help with plans, templates, launch steps, domains, support, and ownership or migration questions. Tell me what you’re trying to do, and I’ll guide you to the best next step.";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { messages?: ChatRequestMessage[] };
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const lastUserMessage =
      [...messages].reverse().find((message) => message.role === "user")?.text?.trim() || "";

    if (!lastUserMessage) {
      return NextResponse.json({
        message:
          "Tell me what you need help with, and I’ll guide you through plans, templates, setup, domains, or support.",
        source: "fallback",
      });
    }

    try {
      const conversation = messages
        .map((message) => `${message.role === "user" ? "User" : "Assistant"}: ${message.text}`)
        .join("\n");

      const result = await generateText({
        model: "openai/gpt-5-mini",
        system: SUPPORT_CHAT_SYSTEM_PROMPT,
        prompt: conversation,
        maxOutputTokens: 500,
      });

      return NextResponse.json({
        message: result.text || buildFallbackReply(lastUserMessage),
        source: "ai",
      });
    } catch (error) {
      console.error("AI chat fallback triggered:", error);
      return NextResponse.json({
        message: buildFallbackReply(lastUserMessage),
        source: "fallback",
      });
    }
  } catch (error) {
    console.error("AI chat route error:", error);
    return NextResponse.json({
      message:
        "I’m having trouble processing that request right now. Please try again, or create a support ticket if the issue is urgent.",
      source: "fallback",
    });
  }
}
