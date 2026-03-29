"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  Globe,
  Headphones,
  Home,
  LifeBuoy,
  Loader2,
  Maximize2,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Minimize2,
  Newspaper,
  Plus,
  Send,
  Shield,
  Sparkles,
  Ticket,
  User,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type WidgetTab = "home" | "messages" | "news" | "tickets";
type TicketCategory = "technical" | "billing" | "domain" | "other";
type TicketPriority = "low" | "medium" | "high" | "urgent";
type SuggestionReason = "domain" | "billing" | "access" | "launch" | "migration" | "general";
type Locale = "en" | "ar";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
};

type ConversationThread = {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
};

type CreatedTicket = {
  id: string;
  ticketNumber?: string | null;
};

type TicketSuggestion = {
  category: TicketCategory;
  priority: TicketPriority;
  reason: SuggestionReason;
};

type WebsiteContext = {
  pathname: string;
  websiteId?: string;
  websiteName?: string;
  templateName?: string;
  templateStack?: string;
  setupStatus?: string;
  liveUrl?: string | null;
};

type DashboardTicket = {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: TicketCategory;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  responsesCount: number;
};

type SupportResponse = {
  tickets: DashboardTicket[];
  stats: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
};

type NewsArticle = {
  id: string;
  badge: string;
  theme: string;
  title: { en: string; ar: string };
  excerpt: { en: string; ar: string };
  preview: { en: string; ar: string };
  body: { en: string[]; ar: string[] };
  tags: string[];
  ctaHref: string;
  ctaLabel: { en: string; ar: string };
  publishedAgo: string;
};

const STORAGE_KEY = "univert-support-widget-threads-v2";

const starterQuestions = {
  en: [
    "Which stack should I choose?",
    "How does launch work after I pick a template?",
    "Can I connect my own domain later?",
    "How do I request support or migration?",
  ],
  ar: [
    "أي Stack أختار؟",
    "كيف يتم الإطلاق بعد اختيار القالب؟",
    "هل يمكنني ربط دوميني لاحقًا؟",
    "كيف أطلب الدعم أو النقل؟",
  ],
} as const;

const quickTopics = {
  en: [
    { label: "Template advice", icon: Sparkles },
    { label: "Domain help", icon: Globe },
    { label: "Billing questions", icon: LifeBuoy },
    { label: "Ownership & export", icon: Shield },
  ],
  ar: [
    { label: "مساعدة اختيار القالب", icon: Sparkles },
    { label: "مساعدة الدومين", icon: Globe },
    { label: "أسئلة الفوترة", icon: LifeBuoy },
    { label: "الملكية والتصدير", icon: Shield },
  ],
} as const;

const escalationKeywords = [
  "billing",
  "invoice",
  "payment",
  "subscription",
  "renew",
  "refund",
  "domain",
  "dns",
  "ssl",
  "subdomain",
  "custom domain",
  "credential",
  "login",
  "password",
  "launch",
  "setup",
  "migration",
  "export",
  "not ready",
  "not working",
  "missing",
  "error",
  "failed",
  "دومين",
  "نطاق",
  "الدخول",
  "كلمة السر",
  "كلمة المرور",
  "بيانات الدخول",
  "الفاتورة",
  "الدفع",
  "الاشتراك",
  "التجديد",
  "الهجرة",
  "النقل",
  "تصدير",
  "الموقع غير جاهز",
  "لا يعمل",
  "مشكلة",
  "خطأ",
  "فشل",
];

const supportAgents = [
  { name: "Rania", initials: "RA", hue: "from-emerald-400 to-cyan-400" },
  { name: "Omar", initials: "OM", hue: "from-cyan-400 to-sky-400" },
  { name: "Lina", initials: "LI", hue: "from-teal-300 to-emerald-300" },
] as const;

const newsArticles: NewsArticle[] = [
  {
    id: "launch-readiness",
    badge: "Launch",
    theme: "from-[#9ff7df] via-[#6fe7d2] to-[#87d8ff]",
    title: {
      en: "Launch updates now flow faster through your dashboard",
      ar: "تحديثات الإطلاق أصبحت أوضح وأسرع داخل الداشبورد",
    },
    excerpt: {
      en: "Track setup milestones, domain steps, and delivery updates from one support surface.",
      ar: "تابع مراحل الإعداد والدومين وتسليم الموقع من سطح دعم واحد وواضح.",
    },
    preview: {
      en: "A clearer launch path for teams that want practical visibility.",
      ar: "مسار إطلاق أوضح للفرق التي تريد رؤية عملية ومباشرة.",
    },
    body: {
      en: [
        "The support workspace now groups launch guidance, domain help, and ownership information into one flow so customers do not need to jump between pages to understand what is happening.",
        "This makes it easier to understand what was completed, what is still pending, and when to open a ticket for a specific website issue.",
        "As the product matures, this same surface can grow into a full launch command center for delivery, credentials, and post-launch support.",
      ],
      ar: [
        "واجهة الدعم أصبحت تجمع توجيهات الإطلاق ومساعدة الدومين وشرح الملكية في مسار واحد حتى لا يضطر العميل للتنقل بين صفحات كثيرة لفهم ما يحدث.",
        "هذا يجعل متابعة ما اكتمل وما بقي قيد التنفيذ ومتى يجب فتح تذكرة دعم أمرًا أوضح بكثير.",
        "ومع تطور المنتج يمكن أن تتحول هذه الواجهة نفسها إلى مركز كامل للإطلاق والتسليم وبيانات الدخول والدعم بعد الإطلاق.",
      ],
    },
    tags: ["New", "Support"],
    ctaHref: "/dashboard/support",
    ctaLabel: { en: "Open support", ar: "فتح الدعم" },
    publishedAgo: "2d",
  },
  {
    id: "domain-confidence",
    badge: "Domains",
    theme: "from-[#98f5e1] via-[#78e1d5] to-[#b5f1ff]",
    title: {
      en: "Domain setup now feels less technical and more guided",
      ar: "إعداد الدومين أصبح أقل تقنية وأكثر توجيهًا",
    },
    excerpt: {
      en: "DNS, SSL, and verification steps now use clearer language for business customers.",
      ar: "خطوات DNS وSSL والتحقق أصبحت بلغة أوضح لعملاء الأعمال.",
    },
    preview: {
      en: "A more trustworthy path for customers connecting their domain for the first time.",
      ar: "مسار أكثر ثقة للعملاء الذين يربطون دومينهم لأول مرة.",
    },
    body: {
      en: [
        "Custom domain setup is one of the moments where support quality matters most. Clear instructions reduce hesitation and help customers feel that their website is in safe hands.",
        "Univert now frames domain tasks as guided actions instead of low-level infrastructure work, which matches the managed-service promise more closely.",
      ],
      ar: [
        "ربط الدومين المخصص من أكثر اللحظات التي يظهر فيها الفرق الحقيقي في جودة الدعم. كلما كانت الخطوات أوضح شعر العميل أن موقعه في يد أمينة.",
        "لهذا أصبحت Univert تقدم هذه الخطوات كإجراءات موجهة وليست أعمال بنية تقنية معقدة، وهو ما ينسجم أكثر مع وعد الخدمة المُدارة.",
      ],
    },
    tags: ["Guide", "SSL"],
    ctaHref: "/dashboard/domains",
    ctaLabel: { en: "Manage domains", ar: "إدارة الدومينات" },
    publishedAgo: "5d",
  },
  {
    id: "ownership-path",
    badge: "Ownership",
    theme: "from-[#aaf7dd] via-[#8be9d5] to-[#d0f4ff]",
    title: {
      en: "Ownership guidance is now part of the support flow",
      ar: "شرح الملكية أصبح جزءًا من مسار الدعم نفسه",
    },
    excerpt: {
      en: "Customers can move from launch questions to ownership and export guidance without losing context.",
      ar: "يمكن للعميل الانتقال من أسئلة الإطلاق إلى شرح الملكية والتصدير بدون فقدان السياق.",
    },
    preview: {
      en: "Keep the managed experience today without giving up future flexibility.",
      ar: "استفد من التجربة المُدارة اليوم بدون التخلي عن المرونة المستقبلية.",
    },
    body: {
      en: [
        "One of Univert’s strongest differentiators is that managed setup does not mean long-term lock-in. Customers should understand this from inside the product, not only from marketing pages.",
        "This article reinforces that support, launch, and ownership belong to the same customer journey.",
      ],
      ar: [
        "من أقوى نقاط تميز Univert أن الإعداد المُدار لا يعني الارتباط القسري على المدى الطويل. يجب أن يفهم العميل هذا من داخل المنتج نفسه وليس من صفحات التسويق فقط.",
        "لهذا تربط هذه المقالة بين الدعم والإطلاق والملكية باعتبارها رحلة عميل واحدة وليست مواضيع منفصلة.",
      ],
    },
    tags: ["Guide", "Freedom"],
    ctaHref: "/about/ownership",
    ctaLabel: { en: "Read ownership guide", ar: "قراءة دليل الملكية" },
    publishedAgo: "1w",
  },
];

const labelMaps = {
  category: {
    technical: { en: "Technical", ar: "تقنية" },
    billing: { en: "Billing", ar: "الفوترة" },
    domain: { en: "Domain", ar: "الدومين" },
    other: { en: "Other", ar: "أخرى" },
  },
  priority: {
    low: { en: "Low", ar: "منخفضة" },
    medium: { en: "Medium", ar: "متوسطة" },
    high: { en: "High", ar: "مرتفعة" },
    urgent: { en: "Urgent", ar: "عاجلة" },
  },
  reason: {
    domain: {
      en: "Suggested because the conversation mentions domains, DNS, SSL, or subdomains.",
      ar: "تم اقتراح هذا لأن المحادثة تتحدث عن الدومين أو DNS أو SSL أو السبدومين.",
    },
    billing: {
      en: "Suggested because the conversation mentions billing, invoices, payments, or renewals.",
      ar: "تم اقتراح هذا لأن المحادثة تتحدث عن الفوترة أو الدفع أو الفواتير أو التجديد.",
    },
    access: {
      en: "Suggested because the conversation mentions missing credentials, login issues, or website access problems.",
      ar: "تم اقتراح هذا لأن المحادثة تتحدث عن بيانات دخول مفقودة أو مشاكل تسجيل الدخول أو الوصول للموقع.",
    },
    launch: {
      en: "Suggested because the conversation mentions launch delays, setup failures, or website readiness.",
      ar: "تم اقتراح هذا لأن المحادثة تتحدث عن تأخر الإطلاق أو فشل الإعداد أو جاهزية الموقع.",
    },
    migration: {
      en: "Suggested because the conversation mentions export, migration, or ownership handoff.",
      ar: "تم اقتراح هذا لأن المحادثة تتحدث عن التصدير أو النقل أو تسليم الملكية.",
    },
    general: {
      en: "Suggested from the overall chat context.",
      ar: "تم اقتراح هذا بناءً على سياق المحادثة العام.",
    },
  },
} as const;

function safeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `support-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isArabicText(text: string) {
  return /[\u0600-\u06FF]/.test(text);
}

function t(locale: Locale, en: string, ar: string) {
  return locale === "ar" ? ar : en;
}

function formatRelativeTime(value: string, locale: Locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return locale === "ar" ? "الآن" : "Now";
  }

  const diff = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));

  if (minutes < 60) {
    return locale === "ar" ? `منذ ${minutes} د` : `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return locale === "ar" ? `منذ ${hours} س` : `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return locale === "ar" ? `منذ ${days} ي` : `${days}d ago`;
}

function inferTicketCategory(text: string): TicketCategory {
  const normalized = text.toLowerCase();

  if (/(domain|dns|ssl|subdomain|custom domain|دومين|نطاق)/.test(normalized)) {
    return "domain";
  }

  if (/(bill|invoice|payment|subscription|renew|الفاتورة|الدفع|الاشتراك|التجديد)/.test(normalized)) {
    return "billing";
  }

  if (/(error|login|launch|setup|credential|website|template|خطأ|الدخول|إطلاق|إعداد)/.test(normalized)) {
    return "technical";
  }

  return "other";
}

function inferTicketSuggestion(text: string): TicketSuggestion {
  const normalized = text.toLowerCase();

  const hasDomainSignal =
    /(domain|dns|ssl|subdomain|custom domain|دومين|نطاق)/.test(normalized);
  const hasBillingSignal =
    /(bill|billing|invoice|payment|subscription|renew|refund|الفاتورة|الدفع|الاشتراك|التجديد)/.test(
      normalized,
    );
  const hasAccessSignal =
    /(credential|login|password|access|admin|cannot sign in|can't sign in|بيانات الدخول|كلمة المرور|كلمة السر|الدخول)/.test(
      normalized,
    );
  const hasLaunchSignal =
    /(launch|setup|provision|ready|not ready|failed|error|down|offline|لا يعمل|فشل|خطأ|غير جاهز|جاهز)/.test(
      normalized,
    );
  const hasMigrationSignal =
    /(migration|migrate|export|ownership|handoff|transfer|النقل|الهجرة|تصدير|ملكية)/.test(
      normalized,
    );
  const isUrgent =
    /(urgent|asap|immediately|website down|site down|cannot access|can't access|downtime|عاجل|حالًا|فورًا|متوقف|لا يمكن الوصول)/.test(
      normalized,
    );
  const isHighImpact =
    /(failed launch|launch failed|missing credentials|dns not working|ssl error|payment failed|domain not working|فشل الإطلاق|بيانات الدخول مفقودة|مشكلة dns|الدفع فشل)/.test(
      normalized,
    );

  let category: TicketCategory = "other";
  let reason: SuggestionReason = "general";

  if (hasDomainSignal) {
    category = "domain";
    reason = "domain";
  } else if (hasBillingSignal) {
    category = "billing";
    reason = "billing";
  } else if (hasAccessSignal) {
    category = "technical";
    reason = "access";
  } else if (hasLaunchSignal) {
    category = "technical";
    reason = "launch";
  } else if (hasMigrationSignal) {
    category = "other";
    reason = "migration";
  } else {
    category = inferTicketCategory(normalized);
  }

  let priority: TicketPriority = "medium";
  if (isUrgent) {
    priority = "urgent";
  } else if (isHighImpact || hasAccessSignal || (hasDomainSignal && hasLaunchSignal)) {
    priority = "high";
  } else if (!(hasDomainSignal || hasBillingSignal || hasLaunchSignal || hasMigrationSignal)) {
    priority = "low";
  }

  return { category, priority, reason };
}

function shouldSuggestEscalation(text: string) {
  const normalized = text.toLowerCase();
  return escalationKeywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function getContextLines(context: WebsiteContext) {
  const lines = [`Current dashboard path: ${context.pathname}`];

  if (context.websiteId) lines.push(`Website ID: ${context.websiteId}`);
  if (context.websiteName) lines.push(`Website name: ${context.websiteName}`);
  if (context.templateName) lines.push(`Template: ${context.templateName}`);
  if (context.templateStack) lines.push(`Stack: ${context.templateStack}`);
  if (context.setupStatus) lines.push(`Setup status: ${context.setupStatus}`);
  if (context.liveUrl) lines.push(`Live URL: ${context.liveUrl}`);

  return lines;
}

function getAvailability(locale: Locale) {
  const hour = new Date().getUTCHours();
  const isLive = hour >= 8 && hour < 18;

  return {
    isLive,
    title: isLive
      ? t(locale, "Support team online", "فريق الدعم متصل الآن")
      : t(locale, "Replies during business hours", "الرد خلال ساعات العمل"),
    subtitle: isLive
      ? t(locale, "Typical human follow-up in a few working hours", "غالبًا تتم المتابعة البشرية خلال ساعات العمل")
      : t(locale, "AI assistant is available now, human follow-up starts in the next business window", "المساعد الذكي متاح الآن، والمتابعة البشرية تبدأ في نافذة العمل القادمة"),
  };
}

function createWelcomeMessage(locale: Locale) {
  return {
    id: safeId(),
    role: "assistant" as const,
    text: t(
      locale,
      "Hi, I’m the Univert support assistant. Ask me about templates, launch timing, domains, or ownership. If your case needs account-specific help, I can help you turn it into a support ticket.",
      "أهلًا، أنا مساعد دعم Univert. اسألني عن القوالب، وقت الإطلاق، الدومين، أو الملكية. وإذا كانت حالتك تحتاج متابعة مرتبطة بحسابك فسأساعدك في تحويلها إلى تذكرة دعم.",
    ),
    createdAt: new Date().toISOString(),
  };
}

function createThread(locale: Locale): ConversationThread {
  const welcome = createWelcomeMessage(locale);
  return {
    id: safeId(),
    title: t(locale, "New conversation", "محادثة جديدة"),
    updatedAt: welcome.createdAt,
    messages: [welcome],
  };
}

function decorateThreadTitle(text: string, locale: Locale) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return t(locale, "New conversation", "محادثة جديدة");
  return clean.length > 48 ? `${clean.slice(0, 45).trimEnd()}...` : clean;
}

function buildNewsArtwork(theme: string) {
  return (
    <div
      className={cn(
        "relative h-44 overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br shadow-[0_28px_70px_-32px_rgba(32,211,191,0.45)]",
        theme,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.48),transparent_42%)]" />
      <div className="absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),transparent)]" />
      <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
      <div className="absolute -left-6 bottom-6 h-24 w-24 rounded-[28px] border border-white/35 bg-white/25 backdrop-blur-sm" />
      <div className="absolute left-16 top-10 h-20 w-16 rounded-[24px] border border-white/30 bg-slate-950/15 shadow-[0_15px_40px_-20px_rgba(15,23,42,0.45)]" />
      <div className="absolute right-14 top-9 h-24 w-24 rounded-[28px] border border-white/25 bg-slate-950/15 shadow-[0_15px_40px_-20px_rgba(15,23,42,0.45)]" />
      <div className="absolute bottom-5 left-1/2 h-16 w-28 -translate-x-1/2 rounded-[20px] border border-white/20 bg-slate-950/15 backdrop-blur-sm" />
      <div className="absolute bottom-6 right-6 flex items-center gap-2 rounded-full border border-slate-950/10 bg-slate-950/20 px-3 py-1 text-[11px] font-medium text-slate-950/80">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Univert</span>
      </div>
    </div>
  );
}

export function ChatWidget() {
  const pathname = usePathname();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [locale, setLocale] = useState<Locale>("en");
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<WidgetTab>("home");
  const [messageView, setMessageView] = useState<"list" | "thread">("list");
  const [newsView, setNewsView] = useState<"feed" | "detail">("feed");
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [threadsLoaded, setThreadsLoaded] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketCategory, setTicketCategory] = useState<TicketCategory>("technical");
  const [ticketPriority, setTicketPriority] = useState<TicketPriority>("medium");
  const [ticketSuggestion, setTicketSuggestion] = useState<TicketSuggestion | null>(null);
  const [pageContext, setPageContext] = useState<WebsiteContext>({
    pathname: pathname || "/dashboard",
  });
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<CreatedTicket | null>(null);
  const [tickets, setTickets] = useState<DashboardTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState("");

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) || null,
    [threads, activeThreadId],
  );

  const activeMessages = activeThread?.messages || [];
  const sortedThreads = useMemo(
    () =>
      [...threads].sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      ),
    [threads],
  );
  const selectedNews = newsArticles.find((article) => article.id === selectedNewsId) || null;
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) || null;
  const availability = getAvailability(locale);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextLocale: Locale =
      document.documentElement.lang?.toLowerCase().startsWith("ar") ||
      navigator.language?.toLowerCase().startsWith("ar")
        ? "ar"
        : "en";
    setLocale(nextLocale);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setThreadsLoaded(true);
        return;
      }

      const parsed = JSON.parse(stored) as ConversationThread[];
      if (Array.isArray(parsed)) {
        setThreads(parsed);
        setActiveThreadId(parsed[0]?.id || null);
      }
    } catch {
      // Ignore malformed local widget history.
    } finally {
      setThreadsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!threadsLoaded || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  }, [threads, threadsLoaded]);

  useEffect(() => {
    const currentPath = pathname || "/dashboard";
    const websiteMatch = currentPath.match(/^\/dashboard\/websites\/([^/]+)$/);

    if (!websiteMatch) {
      setPageContext({ pathname: currentPath });
      return;
    }

    const websiteId = websiteMatch[1];
    let cancelled = false;

    const loadWebsiteContext = async () => {
      try {
        const response = await fetch("/api/dashboard/websites", {
          cache: "no-store",
          credentials: "include",
        });

        const payload = await response.json().catch(() => ({}));
        const website = Array.isArray(payload?.websites)
          ? payload.websites.find((item: { id?: string }) => item.id === websiteId)
          : null;

        if (cancelled) return;

        if (!response.ok || !website) {
          setPageContext({ pathname: currentPath, websiteId });
          return;
        }

        setPageContext({
          pathname: currentPath,
          websiteId,
          websiteName: typeof website.projectName === "string" ? website.projectName : undefined,
          templateName: typeof website.templateName === "string" ? website.templateName : undefined,
          templateStack: typeof website.templateStack === "string" ? website.templateStack : undefined,
          setupStatus: typeof website.status === "string" ? website.status : undefined,
          liveUrl: typeof website.liveUrl === "string" ? website.liveUrl : null,
        });
      } catch {
        if (!cancelled) {
          setPageContext({ pathname: currentPath, websiteId });
        }
      }
    };

    loadWebsiteContext();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, activeTab, messageView, newsView]);

  useEffect(() => {
    if (!isOpen) return;
    setHasUnread(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeTab !== "tickets") return;

    let cancelled = false;

    const loadTickets = async () => {
      setTicketsLoading(true);
      setTicketsError("");

      try {
        const response = await fetch("/api/dashboard/support/tickets", {
          cache: "no-store",
          credentials: "include",
        });
        const result = (await response.json().catch(() => ({}))) as
          | SupportResponse
          | { error?: string };

        if (!response.ok) {
          throw new Error((result as { error?: string }).error || "failed_to_load_tickets");
        }

        if (!cancelled) {
          const payload = result as SupportResponse;
          setTickets(Array.isArray(payload.tickets) ? payload.tickets : []);
          setSelectedTicketId((current) =>
            current && payload.tickets.some((ticket) => ticket.id === current)
              ? current
              : payload.tickets[0]?.id || null,
          );
        }
      } catch {
        if (!cancelled) {
          setTicketsError(
            t(
              locale,
              "Ticket history is temporarily unavailable here.",
              "سجل التذاكر غير متاح مؤقتًا هنا.",
            ),
          );
        }
      } finally {
        if (!cancelled) {
          setTicketsLoading(false);
        }
      }
    };

    loadTickets();

    return () => {
      cancelled = true;
    };
  }, [activeTab, isOpen, locale]);

  const updateThread = (threadId: string, updater: (thread: ConversationThread) => ConversationThread) => {
    setThreads((previous) =>
      previous.map((thread) => (thread.id === threadId ? updater(thread) : thread)),
    );
  };

  const ensureActiveThread = () => {
    const existing = activeThreadId
      ? threads.find((thread) => thread.id === activeThreadId)
      : null;

    if (existing) {
      return existing;
    }

    const freshThread = createThread(locale);
    setThreads((previous) => [freshThread, ...previous]);
    setActiveThreadId(freshThread.id);
    return freshThread;
  };

  const openConversation = () => {
    const thread = ensureActiveThread();
    setActiveTab("messages");
    setMessageView("thread");
    setActiveThreadId(thread.id);
  };

  const startFreshConversation = () => {
    const freshThread = createThread(locale);
    setThreads((previous) => [freshThread, ...previous]);
    setActiveThreadId(freshThread.id);
    setActiveTab("messages");
    setMessageView("thread");
    setCreatedTicket(null);
  };

  const sendStarterQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => {
      const form = document.getElementById("support-widget-form") as HTMLFormElement | null;
      form?.requestSubmit();
    }, 0);
  };

  const latestUserText =
    input.trim() ||
    [...activeMessages].reverse().find((message) => message.role === "user")?.text ||
    "";
  const latestAssistantText =
    [...activeMessages].reverse().find((message) => message.role === "assistant")?.text || "";

  const showEscalationPrompt =
    Boolean(latestUserText) &&
    (shouldSuggestEscalation(latestUserText) ||
      /support ticket/i.test(latestAssistantText) ||
      /تذكرة دعم/.test(latestAssistantText));

  const escalationPromptArabic = isArabicText(`${latestUserText}\n${latestAssistantText}`);

  const buildTicketDraft = () => {
    const lastUserMessage =
      input.trim() ||
      [...activeMessages].reverse().find((message) => message.role === "user")?.text ||
      t(locale, "Help with my website setup", "أحتاج مساعدة في إعداد موقعي");

    const conversationContext = activeMessages
      .slice(-8)
      .map((message) => `${message.role === "user" ? "Customer" : "Assistant"}: ${message.text}`)
      .join("\n");

    const subject =
      lastUserMessage.length > 90
        ? `${lastUserMessage.slice(0, 87).trimEnd()}...`
        : lastUserMessage;

    const subjectWithContext =
      pageContext.websiteName && !subject.toLowerCase().includes(pageContext.websiteName.toLowerCase())
        ? `${pageContext.websiteName}: ${subject}`.slice(0, 191)
        : subject;

    const contextBlock = getContextLines(pageContext).join("\n");
    const description = conversationContext
      ? `${t(locale, "Please help me with this issue.", "أحتاج مساعدة في هذه المشكلة.")}\n\n${t(locale, "Latest request", "آخر طلب")}:\n${lastUserMessage}\n\n${t(locale, "Current page context", "سياق الصفحة الحالي")}:\n${contextBlock}\n\n${t(locale, "Conversation context", "سياق المحادثة")}:\n${conversationContext}`
      : `${t(locale, "Please help me with this issue.", "أحتاج مساعدة في هذه المشكلة.")}\n\n${t(locale, "Latest request", "آخر طلب")}:\n${lastUserMessage}\n\n${t(locale, "Current page context", "سياق الصفحة الحالي")}:\n${contextBlock}`;

    const suggestion = inferTicketSuggestion(`${lastUserMessage}\n${conversationContext}`);

    setTicketSubject(subjectWithContext);
    setTicketDescription(description);
    setTicketCategory(suggestion.category);
    setTicketPriority(suggestion.priority);
    setTicketSuggestion(suggestion);
    setTicketDialogOpen(true);
  };

  const handleCreateTicket = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim() || isSubmittingTicket) return;

    setIsSubmittingTicket(true);

    try {
      const response = await fetch("/api/dashboard/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: ticketSubject.trim(),
          description: ticketDescription.trim(),
          category: ticketCategory,
          priority: ticketPriority,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : t(locale, "We could not create your support ticket right now.", "تعذر إنشاء تذكرة الدعم الآن."),
        );
      }

      setCreatedTicket({
        id: payload.ticket?.id ?? safeId(),
        ticketNumber: payload.ticket?.ticketNumber ?? null,
      });
      setTicketDialogOpen(false);
      setActiveTab("tickets");
      setSelectedTicketId(payload.ticket?.id ?? null);

      toast({
        title: t(locale, "Support ticket created", "تم إنشاء تذكرة الدعم"),
        description: payload.ticket?.ticketNumber
          ? t(
              locale,
              `${payload.ticket.ticketNumber} is now in your support inbox.`,
              `${payload.ticket.ticketNumber} أصبحت الآن في صندوق الدعم لديك.`,
            )
          : t(
              locale,
              "Your support request has been added to your queue.",
              "تمت إضافة طلب الدعم إلى قائمة المتابعة الخاصة بك.",
            ),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t(locale, "Could not create support ticket", "تعذر إنشاء تذكرة الدعم"),
        description:
          error instanceof Error
            ? error.message
            : t(locale, "Please try again from the support page.", "يرجى المحاولة من صفحة الدعم."),
      });
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || isSending) return;

    const thread = ensureActiveThread();
    const trimmedInput = input.trim();
    const createdAt = new Date().toISOString();
    const userMessage: ChatMessage = {
      id: safeId(),
      role: "user",
      text: trimmedInput,
      createdAt,
    };

    if (isArabicText(trimmedInput)) {
      setLocale("ar");
    }

    const optimisticMessages = [...thread.messages, userMessage];
    setInput("");
    setMessageView("thread");
    setActiveTab("messages");
    setIsSending(true);

    updateThread(thread.id, (current) => ({
      ...current,
      title:
        current.messages.length <= 1
          ? decorateThreadTitle(trimmedInput, isArabicText(trimmedInput) ? "ar" : locale)
          : current.title,
      updatedAt: createdAt,
      messages: optimisticMessages,
    }));

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: optimisticMessages.map((message) => ({
            role: message.role,
            text: message.text,
          })),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      const assistantText =
        typeof payload?.message === "string" && payload.message.trim()
          ? payload.message.trim()
          : t(
              locale,
              "I’m here to help with templates, launch, domains, and support. If your request needs account-specific action, please create a ticket.",
              "أنا هنا للمساعدة في القوالب والإطلاق والدومين والدعم. وإذا كان طلبك يحتاج متابعة مرتبطة بحسابك، يرجى إنشاء تذكرة.",
            );

      const assistantMessage: ChatMessage = {
        id: safeId(),
        role: "assistant",
        text: assistantText,
        createdAt: new Date().toISOString(),
      };

      updateThread(thread.id, (current) => ({
        ...current,
        updatedAt: assistantMessage.createdAt,
        messages: [...current.messages, assistantMessage],
      }));

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch {
      const assistantMessage: ChatMessage = {
        id: safeId(),
        role: "assistant",
        text: t(
          locale,
          "I couldn’t reach the assistant right now. You can still create a support ticket and the team will follow up.",
          "تعذر الوصول إلى المساعد الآن. يمكنك مع ذلك إنشاء تذكرة دعم وسيتابعها الفريق.",
        ),
        createdAt: new Date().toISOString(),
      };

      updateThread(thread.id, (current) => ({
        ...current,
        updatedAt: assistantMessage.createdAt,
        messages: [...current.messages, assistantMessage],
      }));
    } finally {
      setIsSending(false);
    }
  };

  const downloadTranscript = () => {
    if (!activeThread) return;

    const transcript = activeThread.messages
      .map((message) => {
        const speaker = message.role === "user" ? "Customer" : "Univert Support";
        return `[${new Date(message.createdAt).toLocaleString()}] ${speaker}\n${message.text}`;
      })
      .join("\n\n");

    const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeThread.title.replace(/[^a-z0-9-]+/gi, "-").toLowerCase() || "support-transcript"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const navItems: Array<{ id: WidgetTab; label: string; icon: typeof Home }> = [
    { id: "home", label: t(locale, "Home", "الرئيسية"), icon: Home },
    { id: "messages", label: t(locale, "Messages", "المحادثات"), icon: MessageSquare },
    { id: "news", label: t(locale, "News", "الأخبار"), icon: Newspaper },
    { id: "tickets", label: t(locale, "Tickets", "التذاكر"), icon: Ticket },
  ];

  const ticketStats = {
    open: tickets.filter((ticket) => ticket.status === "open").length,
    inProgress: tickets.filter((ticket) => ticket.status === "in_progress").length,
    resolved: tickets.filter((ticket) => ticket.status === "resolved").length,
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-16 items-center justify-center gap-2 rounded-[22px] border border-[#5fe3d2]/35 bg-[radial-gradient(circle_at_top_left,#9bf7e4_0%,#41d4c7_40%,#102d32_100%)] px-4 text-slate-950 shadow-[0_24px_70px_-18px_rgba(32,211,191,0.75)] transition-all duration-300",
          "hover:-translate-y-1 hover:shadow-[0_30px_90px_-18px_rgba(32,211,191,0.82)]",
          isOpen ? "w-16 scale-95 px-0" : "w-auto",
        )}
        aria-label={isOpen ? t(locale, "Close support", "إغلاق الدعم") : t(locale, "Open support", "فتح الدعم")}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6" />
            <div className="hidden text-left sm:block">
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-950/60">
                {t(locale, "Support", "الدعم")}
              </p>
              <p className="text-sm font-semibold leading-none">
                {t(locale, "Ask Univert", "اسأل Univert")}
              </p>
            </div>
            {(hasUnread || createdTicket) && (
              <span className="absolute right-2 top-2 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-[#8bf1df]" />
            )}
          </>
        )}
      </button>

      {isOpen && (
        <div
          className={cn(
            "fixed z-50 overflow-hidden rounded-[32px] border border-white/10 bg-[#11161d] text-white shadow-[0_40px_120px_-40px_rgba(6,22,26,0.85)] backdrop-blur-xl",
            isExpanded
              ? "inset-4"
              : "bottom-24 right-4 h-[min(82vh,820px)] w-[min(455px,calc(100vw-2rem))] sm:right-6",
          )}
        >
          <div className="flex h-full flex-col bg-[linear-gradient(180deg,rgba(19,27,34,0.98)_0%,rgba(14,18,24,0.99)_100%)]">
            <div className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(19,28,35,0.98)_0%,rgba(17,22,29,0.96)_100%)] px-4 py-4">
              <div className="flex items-center gap-3">
              {(messageView === "thread" && activeTab === "messages") ||
              (newsView === "detail" && activeTab === "news") ||
              (selectedTicket && activeTab === "tickets") ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === "messages") {
                      setMessageView("list");
                    } else if (activeTab === "news") {
                      setNewsView("feed");
                      setSelectedNewsId(null);
                    } else if (activeTab === "tickets") {
                      setSelectedTicketId(null);
                    }
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
                  aria-label={t(locale, "Back", "رجوع")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {supportAgents.map((agent, index) => (
                    <Avatar
                      key={agent.name}
                      className={cn(
                        "h-10 w-10 border-2 border-[#11161d] shadow-lg ring-1 ring-white/10",
                        index === 1 && "translate-y-1",
                      )}
                    >
                      <AvatarFallback className={cn("bg-gradient-to-br text-[11px] font-semibold text-slate-950", agent.hue)}>
                        {agent.initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-[1.2rem] font-semibold tracking-tight">
                    {activeTab === "home" && t(locale, "Univert Support", "دعم Univert")}
                    {activeTab === "messages" &&
                      (messageView === "thread"
                        ? t(locale, "Messages", "المحادثات")
                        : t(locale, "Messages", "المحادثات"))}
                    {activeTab === "news" && t(locale, "News", "الأخبار")}
                    {activeTab === "tickets" && t(locale, "Tickets", "التذاكر")}
                  </h3>
                  <span
                    className={cn(
                      "inline-flex h-2.5 w-2.5 rounded-full",
                      availability.isLive ? "bg-[#8bf1df]" : "bg-amber-300",
                    )}
                  />
                </div>
                <p className="truncate text-xs text-white/55">
                  {messageView === "thread" && activeTab === "messages"
                    ? t(
                        locale,
                        "Managed launch, domains, ownership, and account support",
                        "الإطلاق المُدار والدومين والملكية والدعم المرتبط بحسابك",
                      )
                    : availability.title}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {activeTab === "messages" && messageView === "thread" && activeMessages.length > 1 && (
                  <button
                    type="button"
                    onClick={downloadTranscript}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
                    aria-label={t(locale, "Download transcript", "تنزيل المحادثة")}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsExpanded((previous) => !previous)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
                  aria-label={isExpanded ? t(locale, "Collapse", "تصغير") : t(locale, "Expand", "توسيع")}
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
                  aria-label={t(locale, "Close", "إغلاق")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              </div>

              {!(messageView === "thread" && activeTab === "messages") &&
              !(newsView === "detail" && activeTab === "news") &&
              !(selectedTicket && activeTab === "tickets") ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full border border-[#5de5d2]/15 bg-[#163238] px-3 py-1 text-[#8bf1df] hover:bg-[#163238]">
                    <span className="mr-2 h-2 w-2 rounded-full bg-[#8bf1df]" />
                    {availability.isLive
                      ? t(locale, "Team online", "الفريق متصل")
                      : t(locale, "Guided support", "دعم موجّه")}
                  </Badge>
                  <Badge className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-white/75 hover:bg-white/[0.04]">
                    {t(locale, "AI + human follow-up", "ذكاء اصطناعي + متابعة بشرية")}
                  </Badge>
                  <Badge className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-white/75 hover:bg-white/[0.04]">
                    {t(locale, "Tickets, news, and chat in one place", "التذاكر والأخبار والمحادثة في مكان واحد")}
                  </Badge>
                </div>
              ) : null}
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              {activeTab === "home" && (
                <ScrollArea className="h-full">
                  <div className="space-y-5 p-4">
                    <div className="overflow-hidden rounded-[30px] border border-[#5de5d2]/20 bg-[radial-gradient(circle_at_top_left,#baf8e7_0%,#8ef1de_20%,#69dece_42%,#183238_100%)] p-6 text-slate-950 shadow-[0_18px_70px_-24px_rgba(79,231,214,0.42)]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex -space-x-2 rtl:space-x-reverse">
                          {supportAgents.map((agent) => (
                            <Avatar key={agent.name} className="h-11 w-11 border-2 border-white/70 shadow-sm">
                              <AvatarFallback className={cn("bg-gradient-to-br text-xs font-semibold text-slate-950", agent.hue)}>
                                {agent.initials}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <Badge className="rounded-full bg-slate-950/10 px-3 py-1 text-[11px] text-slate-950 hover:bg-slate-950/10">
                          <Clock3 className="mr-1 h-3.5 w-3.5" />
                          {availability.isLive
                            ? t(locale, "Live support", "الدعم متصل")
                            : t(locale, "Guided support", "دعم موجّه")}
                        </Badge>
                      </div>

                      <div className="mt-8 max-w-[310px]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-950/55">
                          {t(locale, "Customer support workspace", "مساحة دعم العملاء")}
                        </p>
                        <h4 className="mt-3 text-[2.55rem] font-semibold leading-[0.98] tracking-tight">
                          {t(locale, "Hi there.\nHow can we help?", "مرحبًا.\nكيف يمكننا مساعدتك؟")}
                        </h4>
                        <p className="mt-4 text-sm leading-6 text-slate-950/75">
                          {t(
                            locale,
                            "Get practical help with launch, domains, credentials, billing, and ownership without leaving your dashboard.",
                            "احصل على مساعدة عملية في الإطلاق والدومين وبيانات الدخول والفوترة والملكية بدون مغادرة الداشبورد.",
                          )}
                        </p>
                      </div>

                      <div className="mt-6 space-y-3">
                        <button
                          type="button"
                          onClick={openConversation}
                          className="flex w-full items-center justify-between rounded-[22px] bg-[#11161d] px-5 py-4 text-left text-white shadow-[0_18px_45px_-20px_rgba(0,0,0,0.55)] transition hover:translate-y-[-1px] hover:bg-[#0d141b]"
                        >
                          <span className="text-base font-medium">
                            {t(locale, "Send us a message", "أرسل لنا رسالة")}
                          </span>
                          <Send className="h-5 w-5 text-[#8bf1df]" />
                        </button>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <Link
                            href="/help-center"
                            className="rounded-[20px] border border-slate-950/10 bg-[#11161d]/92 px-4 py-4 text-sm font-medium text-white transition hover:bg-[#0f151a]"
                          >
                            <span className="flex items-center justify-between gap-3">
                              <span>{t(locale, "Open Help Center", "فتح مركز المساعدة")}</span>
                              <ArrowUpRight className="h-4 w-4 text-[#8bf1df]" />
                            </span>
                          </Link>
                          <Link
                            href="/about/ownership"
                            className="rounded-[20px] border border-slate-950/10 bg-[#11161d]/92 px-4 py-4 text-sm font-medium text-white transition hover:bg-[#0f151a]"
                          >
                            <span className="flex items-center justify-between gap-3">
                              <span>{t(locale, "Ownership & export", "الملكية والتصدير")}</span>
                              <ArrowUpRight className="h-4 w-4 text-[#8bf1df]" />
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase tracking-[0.24em] text-white/40">
                            {t(locale, "Status", "الحالة")}
                          </span>
                          <span className="flex items-center gap-2 text-xs text-[#8bf1df]">
                            <span className="h-2 w-2 rounded-full bg-[#8bf1df]" />
                            {t(locale, "All systems ready", "كل الأنظمة جاهزة")}
                          </span>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-white/75">{availability.subtitle}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Badge className="rounded-full bg-white/[0.05] text-white/80 hover:bg-white/[0.05]">
                            {t(locale, "Launch guidance", "إرشاد الإطلاق")}
                          </Badge>
                          <Badge className="rounded-full bg-white/[0.05] text-white/80 hover:bg-white/[0.05]">
                            {t(locale, "Domain help", "مساعدة الدومين")}
                          </Badge>
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/40">
                          <Sparkles className="h-3.5 w-3.5 text-[#8bf1df]" />
                          {t(locale, "Current workspace", "العمل الحالي")}
                        </div>
                        <p className="mt-4 text-sm font-medium text-white">
                          {pageContext.websiteName || t(locale, "General dashboard assistance", "مساعدة عامة داخل الداشبورد")}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/70">
                          {pageContext.templateName
                            ? `${pageContext.templateName} · ${pageContext.templateStack || t(locale, "Managed setup", "إعداد مُدار")}`
                            : t(locale, "Ask about templates, launch timing, and what happens after checkout.", "اسأل عن القوالب ووقت الإطلاق وما يحدث بعد الطلب.")}
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs text-white/45">
                          <Headphones className="h-4 w-4 text-[#8bf1df]" />
                          {t(locale, "Context-aware support inside the dashboard", "دعم مرتبط بالسياق داخل الداشبورد")}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                            {t(locale, "Quick topics", "مواضيع سريعة")}
                          </p>
                          <h4 className="mt-2 text-lg font-semibold text-white">
                            {t(locale, "What can we help with today?", "بماذا يمكننا مساعدتك اليوم؟")}
                          </h4>
                        </div>
                        <Megaphone className="h-5 w-5 text-[#8bf1df]" />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {quickTopics[locale].map((topic) => {
                          const Icon = topic.icon;
                          return (
                            <button
                              key={topic.label}
                              type="button"
                              onClick={() => {
                                openConversation();
                                setInput(topic.label);
                              }}
                              className="rounded-[20px] border border-white/8 bg-[#151d25] p-4 text-left transition hover:border-[#5de5d2]/30 hover:bg-[#19232c]"
                            >
                              <Icon className="h-5 w-5 text-[#8bf1df]" />
                              <p className="mt-3 text-sm font-medium text-white">{topic.label}</p>
                              <p className="mt-2 text-xs leading-5 text-white/48">
                                {t(locale, "Open a guided reply or escalate to a ticket when needed.", "ابدأ ردًا موجهًا أو حوّلها إلى تذكرة عند الحاجة.")}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[1.35fr_0.9fr]">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("news");
                          setNewsView("detail");
                          setSelectedNewsId(newsArticles[0].id);
                        }}
                        className="w-full rounded-[28px] border border-white/8 bg-white/[0.03] p-4 text-left transition hover:border-[#5de5d2]/25 hover:bg-white/[0.045]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                              {t(locale, "Latest update", "آخر تحديث")}
                            </p>
                            <h4 className="mt-2 text-lg font-semibold text-white">
                              {newsArticles[0].title[locale]}
                            </h4>
                            <p className="mt-2 text-sm leading-6 text-white/70">
                              {newsArticles[0].excerpt[locale]}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-[#8bf1df]" />
                        </div>
                        <div className="mt-4">{buildNewsArtwork(newsArticles[0].theme)}</div>
                      </button>

                      <div className="rounded-[28px] border border-white/8 bg-[#12181f] p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                          {t(locale, "Support paths", "مسارات الدعم")}
                        </p>
                        <div className="mt-4 space-y-3">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("tickets");
                              setSelectedTicketId(null);
                            }}
                            className="flex w-full items-center justify-between rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4 text-left transition hover:border-[#5de5d2]/25 hover:bg-white/[0.05]"
                          >
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {t(locale, "Ticket inbox", "صندوق التذاكر")}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-white/55">
                                {t(locale, "Review support requests and follow-ups in one place.", "راجع طلبات الدعم والمتابعات في مكان واحد.")}
                              </p>
                            </div>
                            <Ticket className="h-5 w-5 text-[#8bf1df]" />
                          </button>
                          <button
                            type="button"
                            onClick={buildTicketDraft}
                            className="flex w-full items-center justify-between rounded-[20px] bg-[#8bf1df] px-4 py-4 text-left text-slate-950 transition hover:bg-[#9df5e5]"
                          >
                            <div>
                              <p className="text-sm font-semibold">
                                {t(locale, "Create a request", "إنشاء طلب")}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-slate-950/65">
                                {t(locale, "Turn the current issue into a tracked support ticket.", "حوّل المشكلة الحالية إلى تذكرة دعم قابلة للمتابعة.")}
                              </p>
                            </div>
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              )}

              {activeTab === "messages" && messageView === "list" && (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="border-b border-white/8 px-4 py-4">
                    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                            {t(locale, "Message inbox", "صندوق الرسائل")}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-white/65">
                            {t(locale, "Keep customer-facing questions, launch guidance, and follow-up conversations in one place.", "احتفظ بأسئلة العميل وتوجيهات الإطلاق والمتابعات في مكان واحد.")}
                          </p>
                        </div>
                        <Badge className="rounded-full bg-[#17333a] px-3 py-1 text-[#8bf1df] hover:bg-[#17333a]">
                          {sortedThreads.length} {t(locale, "threads", "محادثات")}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="h-full">
                    <div className="space-y-3 p-4">
                      {sortedThreads.length === 0 ? (
                        <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-5 py-8 text-center">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
                            <MessageSquare className="h-6 w-6 text-[#8bf1df]" />
                          </div>
                          <h4 className="mt-4 text-lg font-semibold text-white">
                            {t(locale, "No conversations yet", "لا توجد محادثات بعد")}
                          </h4>
                          <p className="mt-2 text-sm leading-6 text-white/65">
                            {t(locale, "Start a guided conversation and your support history will appear here.", "ابدأ محادثة موجهة وستظهر هنا كل محادثاتك مع الدعم.")}
                          </p>
                          <Button
                            type="button"
                            className="mt-5 rounded-full bg-[#8bf1df] px-5 text-slate-950 hover:bg-[#9df5e5]"
                            onClick={openConversation}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            {t(locale, "Start conversation", "بدء محادثة")}
                          </Button>
                        </div>
                      ) : (
                        sortedThreads.map((thread) => {
                          const lastMessage = thread.messages[thread.messages.length - 1];
                          return (
                            <button
                              key={thread.id}
                              type="button"
                              onClick={() => {
                                setActiveThreadId(thread.id);
                                setMessageView("thread");
                              }}
                              className="w-full rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.03)_100%)] px-4 py-4 text-left transition hover:border-[#5de5d2]/30 hover:bg-white/[0.06]"
                            >
                              <div className="flex items-start gap-3">
                                <Avatar className="h-11 w-11 border border-white/10">
                                  <AvatarFallback className="bg-gradient-to-br from-[#9ff5e0] to-[#41d4c7] text-sm font-semibold text-slate-950">
                                    {lastMessage?.role === "user" ? "YO" : "US"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-3">
                                    <h4 className="truncate text-sm font-semibold text-white">{thread.title}</h4>
                                    <span className="shrink-0 text-[11px] text-white/45">
                                      {formatRelativeTime(thread.updatedAt, locale)}
                                    </span>
                                  </div>
                                  <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <Badge className="rounded-full bg-white/[0.05] text-white/75 hover:bg-white/[0.05]">
                                      {thread.messages.length} {t(locale, "messages", "رسائل")}
                                    </Badge>
                                    <Badge className="rounded-full bg-[#17333a] text-[#8bf1df] hover:bg-[#17333a]">
                                      {lastMessage?.role === "user"
                                        ? t(locale, "Awaiting reply", "بانتظار الرد")
                                        : t(locale, "Updated by support", "تم التحديث من الدعم")}
                                    </Badge>
                                  </div>
                                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-white/65">
                                    {lastMessage?.text || t(locale, "New support conversation", "محادثة دعم جديدة")}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>

                  <div className="border-t border-white/8 p-4">
                    <Button
                      type="button"
                      className="w-full rounded-full bg-[#8bf1df] text-slate-950 hover:bg-[#9df5e5]"
                      onClick={startFreshConversation}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t(locale, "New conversation", "محادثة جديدة")}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "messages" && messageView === "thread" && (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="border-b border-white/8 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11 border border-white/10">
                          <AvatarFallback className="bg-gradient-to-br from-[#9ff5e0] to-[#41d4c7] text-sm font-semibold text-slate-950">
                            RA
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-white">
                              {t(locale, "Univert support team", "فريق دعم Univert")}
                            </p>
                            <span className="flex items-center gap-1 rounded-full bg-[#8bf1df]/10 px-2 py-0.5 text-[11px] text-[#8bf1df]">
                              <span className="h-2 w-2 rounded-full bg-[#8bf1df]" />
                              {availability.isLive
                                ? t(locale, "Active now", "نشط الآن")
                                : t(locale, "Guided mode", "وضع موجّه")}
                            </span>
                          </div>
                          <p className="text-xs text-white/50">
                            {t(locale, "Launch, domains, ownership, and billing guidance", "إرشاد في الإطلاق والدومين والملكية والفوترة")}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge className="rounded-full bg-white/[0.05] text-white/75 hover:bg-white/[0.05]">
                              {t(locale, "Conversation", "محادثة")}
                            </Badge>
                            <Badge className="rounded-full bg-[#17333a] text-[#8bf1df] hover:bg-[#17333a]">
                              {availability.isLive
                                ? t(locale, "Agent active now", "وكيل نشط الآن")
                                : t(locale, "AI assistant active", "المساعد الذكي نشط")}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={downloadTranscript}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
                          aria-label={t(locale, "Download transcript", "تنزيل المحادثة")}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={buildTicketDraft}
                          className="inline-flex items-center gap-2 rounded-full bg-[#8bf1df] px-3 py-2 text-xs font-medium text-slate-950 transition hover:bg-[#9df5e5]"
                        >
                          <LifeBuoy className="h-4 w-4" />
                          {t(locale, "Create ticket", "إنشاء تذكرة")}
                        </button>
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="space-y-4 px-4 py-4">
                      {pageContext.websiteName && (
                        <div className="rounded-[22px] border border-[#5de5d2]/15 bg-[#162129] px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                            {t(locale, "Current website context", "سياق الموقع الحالي")}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Badge className="bg-white/6 text-white hover:bg-white/6">
                              {pageContext.websiteName}
                            </Badge>
                            {pageContext.templateStack && (
                              <Badge className="bg-white/6 text-white hover:bg-white/6">
                                {pageContext.templateStack}
                              </Badge>
                            )}
                            {pageContext.setupStatus && (
                              <Badge className="bg-white/6 text-white hover:bg-white/6">
                                {pageContext.setupStatus}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {activeMessages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex gap-3",
                            message.role === "user" ? "justify-end" : "justify-start",
                          )}
                        >
                          {message.role === "assistant" && (
                            <Avatar className="mt-1 h-9 w-9 border border-white/10">
                              <AvatarFallback className="bg-white/6 text-xs font-semibold text-[#8bf1df]">
                                US
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div
                            className={cn(
                              "max-w-[82%] rounded-[24px] px-4 py-3 text-sm leading-7 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.6)]",
                              message.role === "user"
                                ? "rounded-br-md bg-[#9bf5e4] text-slate-950"
                                : "rounded-bl-md border border-white/8 bg-[#22272f] text-white",
                            )}
                          >
                            <div className="mb-2 flex items-center gap-2 text-[11px]">
                              <span
                                className={cn(
                                  "inline-flex rounded-full px-2 py-0.5 font-medium",
                                  message.role === "user"
                                    ? "bg-slate-950/10 text-slate-950/75"
                                    : "bg-white/[0.06] text-white/55",
                                )}
                              >
                                {message.role === "user"
                                  ? t(locale, "You", "أنت")
                                  : t(locale, "Univert Support", "دعم Univert")}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap">{message.text}</p>
                            <p
                              className={cn(
                                "mt-2 text-[11px]",
                                message.role === "user" ? "text-slate-950/65" : "text-white/40",
                              )}
                            >
                              {formatRelativeTime(message.createdAt, locale)}
                            </p>
                          </div>

                          {message.role === "user" && (
                            <Avatar className="mt-1 h-9 w-9 border border-[#8bf1df]/30">
                              <AvatarFallback className="bg-[#18363c] text-xs font-semibold text-[#8bf1df]">
                                YO
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}

                      {activeMessages.length <= 1 && (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {starterQuestions[locale].map((question) => (
                            <button
                              key={question}
                              type="button"
                              onClick={() => sendStarterQuestion(question)}
                              className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm text-white/80 transition hover:border-[#5de5d2]/25 hover:bg-white/[0.05]"
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      )}

                      {isSending && (
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-white/10">
                            <AvatarFallback className="bg-white/6 text-xs font-semibold text-[#8bf1df]">
                              US
                            </AvatarFallback>
                          </Avatar>
                          <div className="rounded-[22px] rounded-bl-md border border-white/8 bg-[#22272f] px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="h-2 w-2 animate-pulse rounded-full bg-[#8bf1df]" />
                              <span className="h-2 w-2 animate-pulse rounded-full bg-[#8bf1df]/80 [animation-delay:120ms]" />
                              <span className="h-2 w-2 animate-pulse rounded-full bg-[#8bf1df]/60 [animation-delay:240ms]" />
                            </div>
                          </div>
                        </div>
                      )}

                      {createdTicket && (
                        <div className="rounded-[22px] border border-[#5de5d2]/18 bg-[#152126] p-4">
                          <p className="flex items-center gap-2 text-sm font-medium text-white">
                            <CheckCircle2 className="h-4 w-4 text-[#8bf1df]" />
                            {createdTicket.ticketNumber
                              ? t(locale, `Ticket ${createdTicket.ticketNumber} created`, `تم إنشاء التذكرة ${createdTicket.ticketNumber}`)
                              : t(locale, "Support ticket created", "تم إنشاء تذكرة الدعم")}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-white/65">
                            {t(locale, "Your request is now in the support queue. You can continue chatting or review it from the Tickets tab.", "طلبك أصبح الآن في قائمة المتابعة. يمكنك مواصلة المحادثة أو مراجعته من تبويب التذاكر.")}
                          </p>
                        </div>
                      )}

                      {showEscalationPrompt && !ticketDialogOpen && (
                        <div className="rounded-[22px] border border-amber-300/18 bg-amber-300/[0.08] p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-300/15 text-amber-200">
                              <AlertCircle className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-white">
                                {escalationPromptArabic
                                  ? "يبدو أن طلبك يحتاج متابعة من فريق الدعم"
                                  : "This looks like it needs support follow-up"}
                              </p>
                              <p className="mt-1 text-sm leading-6 text-white/60">
                                {escalationPromptArabic
                                  ? "يمكننا تجهيز تذكرة دعم الآن مع تعبئة آخر سياق من المحادثة تلقائيًا."
                                  : "We can create a support ticket now and attach the latest conversation context automatically."}
                              </p>
                              <Button
                                type="button"
                                onClick={buildTicketDraft}
                                className="mt-3 rounded-full bg-[#8bf1df] px-4 text-slate-950 hover:bg-[#9df5e5]"
                              >
                                <LifeBuoy className="mr-2 h-4 w-4" />
                                {t(locale, "Create support ticket", "إنشاء تذكرة دعم")}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <form
                    id="support-widget-form"
                    onSubmit={handleSendMessage}
                    className="border-t border-white/8 bg-[#11161d] p-4"
                  >
                    <div className="flex items-end gap-3 rounded-[22px] border border-white/8 bg-white/[0.04] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                      <div className="flex-1 px-2">
                        <p className="mb-2 text-[11px] uppercase tracking-[0.24em] text-white/35">
                          {t(locale, "Message", "رسالة")}
                        </p>
                        <textarea
                          value={input}
                          onChange={(event) => setInput(event.target.value)}
                          placeholder={t(locale, "Ask about launch, domains, credentials, or ownership...", "اسأل عن الإطلاق أو الدومين أو بيانات الدخول أو الملكية...")}
                          rows={2}
                          disabled={isSending}
                          className="min-h-[56px] w-full resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-white/28"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={!input.trim() || isSending}
                        className="h-12 w-12 rounded-[18px] bg-[#8bf1df] p-0 text-slate-950 hover:bg-[#9df5e5]"
                      >
                        {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "news" && newsView === "feed" && (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="border-b border-white/8 px-4 py-4">
                    <div className="flex items-center justify-between gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                          {t(locale, "Updates & announcements", "التحديثات والإعلانات")}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/65">
                          {t(locale, "Product updates, support notes, and rollout guidance for Univert customers.", "تحديثات المنتج وملاحظات الدعم وإرشادات الإطلاق لعملاء Univert.")}
                        </p>
                      </div>
                      <div className="flex -space-x-2 rtl:space-x-reverse">
                        {supportAgents.map((agent) => (
                          <Avatar key={agent.name} className="h-10 w-10 border-2 border-[#11161d]">
                            <AvatarFallback className={cn("bg-gradient-to-br text-[11px] font-semibold text-slate-950", agent.hue)}>
                              {agent.initials}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="h-full">
                    <div className="space-y-4 p-4">
                      {newsArticles.map((article) => (
                        <button
                          key={article.id}
                          type="button"
                          onClick={() => {
                            setSelectedNewsId(article.id);
                            setNewsView("detail");
                          }}
                          className="w-full rounded-[26px] border border-white/8 bg-white/[0.03] p-4 text-left transition hover:border-[#5de5d2]/25 hover:bg-white/[0.045]"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                                {t(locale, "Latest", "الأحدث")}
                              </p>
                              <p className="mt-1 text-sm text-white/65">
                                {t(locale, "From Team Univert", "من فريق Univert")} · {article.publishedAgo}
                              </p>
                            </div>
                            <div className="flex -space-x-2 rtl:space-x-reverse">
                              {supportAgents.map((agent) => (
                                <Avatar key={agent.name} className="h-10 w-10 border-2 border-[#11161d]">
                                  <AvatarFallback className={cn("bg-gradient-to-br text-[11px] font-semibold text-slate-950", agent.hue)}>
                                    {agent.initials}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4">{buildNewsArtwork(article.theme)}</div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {article.tags.map((tag) => (
                              <Badge key={tag} className="bg-[#17333a] text-[#8bf1df] hover:bg-[#17333a]">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <h4 className="mt-4 text-xl font-semibold leading-tight text-white">
                            {article.title[locale]}
                          </h4>
                          <p className="mt-3 line-clamp-3 text-sm leading-7 text-white/65">
                            {article.excerpt[locale]}
                          </p>
                          <div className="mt-4 flex items-center justify-between text-sm text-[#8bf1df]">
                            <span>{article.preview[locale]}</span>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {activeTab === "news" && newsView === "detail" && selectedNews && (
                <div className="flex min-h-0 flex-1 flex-col">
                  <ScrollArea className="h-full">
                    <div className="space-y-5 p-4">
                      {buildNewsArtwork(selectedNews.theme)}

                      <div className="flex flex-wrap gap-2">
                        {selectedNews.tags.map((tag) => (
                          <Badge key={tag} className="bg-[#17333a] text-[#8bf1df] hover:bg-[#17333a]">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div>
                        <h4 className="text-[1.95rem] font-semibold leading-[1.05] text-white">
                          {selectedNews.title[locale]}
                        </h4>
                        <p className="mt-4 text-sm leading-7 text-white/65">
                          {selectedNews.excerpt[locale]}
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-sm text-white/45">
                          <Megaphone className="h-4 w-4 text-[#8bf1df]" />
                          {t(locale, "Shared by Team Univert", "من فريق Univert")} · {selectedNews.publishedAgo}
                        </div>
                      </div>

                      <Separator className="bg-white/8" />

                      <div className="space-y-4 text-sm leading-8 text-white/78">
                        {selectedNews.body[locale].map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>

                      <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                          {t(locale, "Next step", "الخطوة التالية")}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-white/70">
                          {t(locale, "Move from this update directly into the relevant workflow inside Univert.", "انتقل من هذا التحديث مباشرة إلى المسار المناسب داخل Univert.")}
                        </p>
                        <Button asChild className="mt-4 rounded-full bg-[#8bf1df] text-slate-950 hover:bg-[#9df5e5]">
                          <Link href={selectedNews.ctaHref}>
                            {selectedNews.ctaLabel[locale]}
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>

                      <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                        <p className="text-sm font-medium text-white">
                          {t(locale, "Was this useful?", "هل كان هذا مفيدًا؟")}
                        </p>
                        <div className="mt-4 flex gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                          >
                            {t(locale, "Helpful", "مفيد")}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                          >
                            {t(locale, "Need more detail", "أحتاج تفاصيل أكثر")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              )}

              {activeTab === "tickets" && !selectedTicket && (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="grid grid-cols-3 gap-3 border-b border-white/8 px-4 py-4">
                    <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                        {t(locale, "Open", "مفتوحة")}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">{ticketStats.open}</p>
                    </div>
                    <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                        {t(locale, "In progress", "قيد المتابعة")}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">{ticketStats.inProgress}</p>
                    </div>
                    <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                        {t(locale, "Resolved", "تم حلها")}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">{ticketStats.resolved}</p>
                    </div>
                  </div>

                  <ScrollArea className="h-full">
                    <div className="space-y-3 p-4">
                      <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                              {t(locale, "Ticket inbox", "صندوق التذاكر")}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-white/65">
                              {t(locale, "Track anything that needs account-specific action, from domains to credentials and billing.", "تابع كل ما يحتاج إجراء مرتبطًا بحسابك، من الدومينات إلى بيانات الدخول والفوترة.")}
                            </p>
                          </div>
                          <Badge className="rounded-full bg-[#17333a] px-3 py-1 text-[#8bf1df] hover:bg-[#17333a]">
                            {tickets.length} {t(locale, "tickets", "تذاكر")}
                          </Badge>
                        </div>
                      </div>

                      {ticketsLoading ? (
                        <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-10 text-center text-white/55">
                          {t(locale, "Loading tickets...", "جارٍ تحميل التذاكر...")}
                        </div>
                      ) : ticketsError ? (
                        <div className="rounded-[24px] border border-amber-300/15 bg-amber-300/[0.06] px-5 py-6 text-sm leading-6 text-white/72">
                          {ticketsError}
                        </div>
                      ) : tickets.length === 0 ? (
                        <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-5 py-10 text-center">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
                            <Ticket className="h-6 w-6 text-[#8bf1df]" />
                          </div>
                          <h4 className="mt-4 text-lg font-semibold text-white">
                            {t(locale, "No support tickets yet", "لا توجد تذاكر دعم بعد")}
                          </h4>
                          <p className="mt-2 text-sm leading-6 text-white/65">
                            {t(locale, "When you need account-specific help, create a ticket from the conversation or the support page.", "عندما تحتاج إلى مساعدة مرتبطة بحسابك يمكنك إنشاء تذكرة من المحادثة أو من صفحة الدعم.")}
                          </p>
                          <Button
                            type="button"
                            className="mt-5 rounded-full bg-[#8bf1df] px-5 text-slate-950 hover:bg-[#9df5e5]"
                            onClick={buildTicketDraft}
                          >
                            <LifeBuoy className="mr-2 h-4 w-4" />
                            {t(locale, "Create ticket", "إنشاء تذكرة")}
                          </Button>
                        </div>
                      ) : (
                        tickets.map((ticket) => (
                          <button
                            key={ticket.id}
                            type="button"
                            onClick={() => setSelectedTicketId(ticket.id)}
                            className="w-full rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.03)_100%)] px-4 py-4 text-left transition hover:border-[#5de5d2]/25 hover:bg-white/[0.05]"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#17333a] text-[#8bf1df] shadow-[0_10px_24px_-16px_rgba(95,227,210,0.5)]">
                                <Ticket className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                  <h4 className="truncate text-sm font-semibold text-white">
                                    {ticket.subject}
                                  </h4>
                                  <span className="shrink-0 text-[11px] text-white/45">
                                    {formatRelativeTime(ticket.updatedAt, locale)}
                                  </span>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <Badge className="bg-white/6 text-white hover:bg-white/6">
                                    {ticket.ticketNumber}
                                  </Badge>
                                  <Badge className="bg-white/6 text-white hover:bg-white/6">
                                    {labelMaps.category[ticket.category][locale]}
                                  </Badge>
                                  <Badge className="bg-[#17333a] text-[#8bf1df] hover:bg-[#17333a]">
                                    {labelMaps.priority[ticket.priority][locale]}
                                  </Badge>
                                </div>
                                <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/65">
                                  {ticket.description}
                                </p>
                              </div>
                              <ChevronRight className="mt-1 h-4 w-4 text-[#8bf1df]" />
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </ScrollArea>

                  <div className="border-t border-white/8 p-4">
                    <Button
                      type="button"
                      className="w-full rounded-full bg-[#8bf1df] text-slate-950 hover:bg-[#9df5e5]"
                      onClick={buildTicketDraft}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t(locale, "New ticket", "تذكرة جديدة")}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "tickets" && selectedTicket && (
                <div className="flex min-h-0 flex-1 flex-col">
                  <ScrollArea className="h-full">
                    <div className="space-y-4 p-4">
                      <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className="bg-white/6 text-white hover:bg-white/6">
                                {selectedTicket.ticketNumber}
                              </Badge>
                              <Badge className="bg-[#17333a] text-[#8bf1df] hover:bg-[#17333a]">
                                {labelMaps.priority[selectedTicket.priority][locale]}
                              </Badge>
                            </div>
                            <h4 className="mt-4 text-xl font-semibold text-white">
                              {selectedTicket.subject}
                            </h4>
                            <p className="mt-2 text-sm leading-7 text-white/70">
                              {selectedTicket.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                            {t(locale, "Status", "الحالة")}
                          </p>
                          <p className="mt-3 text-sm font-medium text-white">{selectedTicket.status}</p>
                        </div>
                        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                            {t(locale, "Responses", "الردود")}
                          </p>
                          <p className="mt-3 text-sm font-medium text-white">{selectedTicket.responsesCount}</p>
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                          {t(locale, "Next step", "الخطوة التالية")}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-white/70">
                          {t(locale, "Continue the ticket from the dedicated support page if you need full history and threaded replies.", "تابع التذكرة من صفحة الدعم المخصصة إذا كنت تريد السجل الكامل والردود المتتابعة.")}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <Button asChild className="rounded-full bg-[#8bf1df] text-slate-950 hover:bg-[#9df5e5]">
                            <Link href="/dashboard/support">
                              {t(locale, "Open support page", "فتح صفحة الدعم")}
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                            onClick={openConversation}
                          >
                            {t(locale, "Return to chat", "العودة للمحادثة")}
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                          {t(locale, "Support note", "ملاحظة الدعم")}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-white/70">
                          {t(locale, "For deeper troubleshooting, delivery changes, or threaded updates, continue from the dedicated support page where the full ticket history lives.", "للمتابعة الأعمق أو تغييرات التسليم أو الردود المتتابعة، أكمل من صفحة الدعم المخصصة حيث يظهر السجل الكامل للتذكرة.")}
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>

            <nav className="grid grid-cols-4 border-t border-white/8 bg-[#0f141a] px-2 py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.id === activeTab;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.id === "messages" && activeThreadId) {
                        setMessageView("thread");
                      } else if (item.id === "messages") {
                        setMessageView("list");
                      }
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 rounded-[18px] px-2 py-3 text-xs transition",
                      active
                        ? "bg-[linear-gradient(180deg,rgba(95,227,210,0.12)_0%,rgba(95,227,210,0.04)_100%)] text-[#8bf1df]"
                        : "text-white/50 hover:text-white/80",
                    )}
                  >
                    <div className="relative">
                      <Icon className="h-5 w-5" />
                      {item.id === "messages" && hasUnread && (
                        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#8bf1df]" />
                      )}
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
            <DialogContent className="max-w-[620px] border-white/10 bg-[#11161d] text-white shadow-[0_40px_120px_-40px_rgba(6,22,26,0.85)]">
              <DialogHeader>
                <DialogTitle>{t(locale, "Create a support ticket", "إنشاء تذكرة دعم")}</DialogTitle>
                <DialogDescription className="text-white/55">
                  {t(
                    locale,
                    "Use this when your request needs account-specific help, launch troubleshooting, domain support, or credential follow-up.",
                    "استخدم هذا عندما يحتاج طلبك إلى مساعدة مرتبطة بحسابك أو إلى متابعة في الإطلاق أو الدومين أو بيانات الدخول.",
                  )}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white" htmlFor="ticket-subject">
                    {t(locale, "Subject", "الموضوع")}
                  </label>
                  <Input
                    id="ticket-subject"
                    value={ticketSubject}
                    onChange={(event) => setTicketSubject(event.target.value)}
                    placeholder={t(locale, "For example: I have not received my website credentials", "مثال: لم أستلم بيانات دخول موقعي")}
                    disabled={isSubmittingTicket}
                    maxLength={191}
                    className="border-white/10 bg-white/[0.04] text-white placeholder:text-white/30"
                  />
                </div>

                {ticketSuggestion && (
                  <div className="rounded-[20px] border border-[#5de5d2]/18 bg-[#152126] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs uppercase tracking-[0.24em] text-white/40">
                        {t(locale, "Smart suggestion", "اقتراح ذكي")}
                      </span>
                      <Badge className="bg-white/6 text-white hover:bg-white/6">
                        {t(locale, "Category", "الفئة")}: {labelMaps.category[ticketSuggestion.category][locale]}
                      </Badge>
                      <Badge className="bg-[#17333a] text-[#8bf1df] hover:bg-[#17333a]">
                        {t(locale, "Priority", "الأولوية")}: {labelMaps.priority[ticketSuggestion.priority][locale]}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/65">
                      {labelMaps.reason[ticketSuggestion.reason][locale]}
                    </p>
                  </div>
                )}

                {(pageContext.websiteId || pageContext.websiteName) && (
                  <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs uppercase tracking-[0.24em] text-white/40">
                        {t(locale, "Attached context", "السياق المرفق")}
                      </span>
                      {pageContext.websiteName && (
                        <Badge className="bg-white/6 text-white hover:bg-white/6">
                          {pageContext.websiteName}
                        </Badge>
                      )}
                      {pageContext.templateStack && (
                        <Badge className="bg-white/6 text-white hover:bg-white/6">
                          {pageContext.templateStack}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/65">
                      {t(locale, "The widget will attach the current dashboard path and any available website details to this ticket.", "سيقوم الـ widget بإرفاق مسار الداشبورد الحالي وأي تفاصيل متاحة عن الموقع داخل هذه التذكرة.")}
                    </p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">{t(locale, "Category", "الفئة")}</label>
                    <Select value={ticketCategory} onValueChange={(value: TicketCategory) => setTicketCategory(value)}>
                      <SelectTrigger className="border-white/10 bg-white/[0.04] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">{labelMaps.category.technical[locale]}</SelectItem>
                        <SelectItem value="domain">{labelMaps.category.domain[locale]}</SelectItem>
                        <SelectItem value="billing">{labelMaps.category.billing[locale]}</SelectItem>
                        <SelectItem value="other">{labelMaps.category.other[locale]}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">{t(locale, "Priority", "الأولوية")}</label>
                    <Select value={ticketPriority} onValueChange={(value: TicketPriority) => setTicketPriority(value)}>
                      <SelectTrigger className="border-white/10 bg-white/[0.04] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{labelMaps.priority.low[locale]}</SelectItem>
                        <SelectItem value="medium">{labelMaps.priority.medium[locale]}</SelectItem>
                        <SelectItem value="high">{labelMaps.priority.high[locale]}</SelectItem>
                        <SelectItem value="urgent">{labelMaps.priority.urgent[locale]}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white" htmlFor="ticket-description">
                    {t(locale, "Description", "الوصف")}
                  </label>
                  <Textarea
                    id="ticket-description"
                    value={ticketDescription}
                    onChange={(event) => setTicketDescription(event.target.value)}
                    placeholder={t(locale, "Describe the issue and what you need help with.", "اشرح المشكلة وما الذي تحتاج مساعدة فيه.")}
                    disabled={isSubmittingTicket}
                    className="min-h-40 border-white/10 bg-white/[0.04] text-white placeholder:text-white/30"
                  />
                  <p className="text-xs text-white/40">
                    {t(locale, "We prefill the recent conversation so you do not need to repeat everything from scratch.", "نحن نملأ آخر سياق من المحادثة حتى لا تضطر لإعادة كل شيء من البداية.")}
                  </p>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTicketDialogOpen(false)}
                    disabled={isSubmittingTicket}
                    className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                  >
                    {t(locale, "Cancel", "إلغاء")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isSubmittingTicket ||
                      ticketSubject.trim().length < 3 ||
                      ticketDescription.trim().length < 10
                    }
                    className="rounded-full bg-[#8bf1df] text-slate-950 hover:bg-[#9df5e5]"
                  >
                    {isSubmittingTicket ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t(locale, "Creating...", "جارٍ الإنشاء...")}
                      </>
                    ) : (
                      t(locale, "Create ticket", "إنشاء التذكرة")
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
}
