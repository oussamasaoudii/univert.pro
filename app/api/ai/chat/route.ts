import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { SUPPORT_CHAT_SYSTEM_PROMPT } from "@/lib/ai/prompts";

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

function getFallbackReply(input: string) {
  const normalized = input.toLowerCase();
  const arabic = isArabicText(input);

  if (/(domain|dns|ssl|subdomain|custom domain|دومين|نطاق)/.test(normalized)) {
    return arabic
      ? "يمكنني شرح خطوات ربط الدومين وDNS وSSL بشكل عام، لكن إذا كانت المشكلة مرتبطة بموقعك الحالي أو بحالة التحقق الفعلية فمن الأفضل فتح تذكرة دعم من داخل الداشبورد."
      : "I can explain how domains, DNS, and SSL work in general. If the issue is tied to your live website or current verification status, please create a dashboard support ticket so the team can inspect your account.";
  }

  if (/(billing|invoice|payment|renew|refund|الفاتورة|الدفع|الاشتراك|التجديد)/.test(normalized)) {
    return arabic
      ? "يمكنني توضيح الفرق بين الخطط وما الذي تتضمنه الفوترة بشكل عام، لكن أي مشكلة دفع أو فاتورة تحتاج تذكرة دعم حتى يراجع الفريق حسابك."
      : "I can help explain plans and billing at a high level, but invoice, payment, and renewal issues need a support ticket so the team can review your account safely.";
  }

  if (/(credential|login|password|access|بيانات الدخول|كلمة المرور|الدخول)/.test(normalized)) {
    return arabic
      ? "إذا كنت تسأل عن بيانات الدخول أو الوصول إلى موقعك، فمن الأفضل فتح تذكرة دعم من داخل الداشبورد. يمكن للفريق التحقق من حالة الإعداد وتسليم بيانات الوصول بشكل صحيح."
      : "If your question is about credentials or website access, please create a support ticket from the dashboard. The team can verify your setup status and provide the right access details.";
  }

  if (/(launch|setup|provision|ready|failed|error|لا يعمل|فشل|خطأ|غير جاهز)/.test(normalized)) {
    return arabic
      ? "يمكنني شرح مسار الإطلاق والإعداد بشكل عام، لكن إذا كان لديك موقع محدد لم يجهز بعد أو ظهرت لك مشكلة فعلية، افتح تذكرة دعم حتى يراجع الفريق الحالة مباشرة."
      : "I can explain the general launch and setup flow, but if a specific website is delayed or showing an error, please open a support ticket so the team can inspect the exact status.";
  }

  if (/(migration|export|ownership|handoff|نقل|هجرة|تصدير|ملكية)/.test(normalized)) {
    return arabic
      ? "الملكية والنقل جزء مهم من Univert. يمكنني شرح الفكرة العامة، لكن إذا كنت تريد طلب نقل أو تسليم فعلي فمن الأفضل فتح تذكرة دعم حتى تتم المتابعة مع فريقنا."
      : "Ownership and migration are part of the Univert promise. I can explain the high-level process, but if you want to request an actual export or migration, please create a support ticket so the team can handle it properly.";
  }

  return arabic
    ? "أنا مساعد دعم Univert. أستطيع مساعدتك في اختيار القالب، فهم الخطط، شرح الإطلاق، ربط الدومين، والدعم بعد الإطلاق. إذا كان طلبك مرتبطًا بحسابك أو بموقع محدد، افتح تذكرة دعم من داخل الداشبورد وسيتابعها الفريق."
    : "I’m the Univert support assistant. I can help with templates, plans, launch flow, domains, and post-launch support. If your request is tied to a specific account or website, please create a support ticket from the dashboard so the team can follow up.";
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

  try {
    const result = await generateText({
      model: "openai/gpt-5-mini",
      system: SUPPORT_CHAT_SYSTEM_PROMPT,
      messages: messages as Array<{ role: "user" | "assistant"; content: string }>,
      abortSignal: request.signal,
      maxOutputTokens: 800,
    });

    const text = result.text?.trim();

    return NextResponse.json({
      message: text || getFallbackReply(latestUserMessage),
      source: text ? "model" : "fallback",
    });
  } catch {
    return NextResponse.json({
      message: getFallbackReply(latestUserMessage),
      source: "fallback",
    });
  }
}
