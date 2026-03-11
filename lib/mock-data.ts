import type {
  Template,
  Website,
  Domain,
  Plan,
  Subscription,
  Invoice,
  User,
  Ticket,
  AdminStats,
  Activity,
  Notification,
  ProvisioningProgress,
} from "./types";

// ============================================================================
// TEMPLATES - Premium website templates with realistic pricing and features
// ============================================================================

export const templates: Template[] = [
  {
    id: "tpl-luxe-corporate",
    name: "Luxe Corporate",
    description: "Premium corporate website with modern design, enterprise features, and multi-language support for global organizations.",
    category: "corporate",
    stack: "Next.js",
    previewImage: "/templates/corporate-1.jpg",
    liveDemo: "https://demo.luxe-corporate.com",
    startingPrice: 49,
    featured: true,
    features: ["Responsive Design", "SEO Optimized", "Contact Forms", "Analytics Dashboard", "Blog Section", "Team Management", "Client Portal", "Multi-language"],
    performanceScore: 98,
    businessType: ["Enterprise", "B2B", "Fortune 500"],
  },
  {
    id: "tpl-agency-pro",
    name: "Agency Pro",
    description: "Creative agency template featuring portfolio showcase, case studies, team collaboration, and proposal generation tools.",
    category: "agency",
    stack: "Next.js",
    previewImage: "/templates/agency-1.jpg",
    liveDemo: "https://demo.agency-pro.com",
    startingPrice: 59,
    featured: true,
    features: ["Portfolio Grid", "Case Studies", "Team Profiles", "Client Testimonials", "Service Pages", "Project Timeline", "Proposal Generator", "CRM Integration"],
    performanceScore: 96,
    businessType: ["Creative Agency", "Design Studio", "Consulting"],
  },
  {
    id: "tpl-starter-portfolio",
    name: "Starter Portfolio",
    description: "Clean and minimal portfolio template for creatives, developers, and freelancers to showcase their best work.",
    category: "portfolio",
    stack: "Next.js",
    previewImage: "/templates/portfolio-1.jpg",
    liveDemo: "https://demo.starter-portfolio.com",
    startingPrice: 29,
    featured: false,
    features: ["Project Showcase", "About Section", "Contact Form", "Social Links", "Dark Mode", "Smooth Animations", "Mobile Optimized", "Resume Download"],
    performanceScore: 99,
    businessType: ["Freelancer", "Developer", "Designer"],
  },
  {
    id: "tpl-commerce-elite",
    name: "Commerce Elite",
    description: "Full-featured ecommerce template with shopping cart, secure checkout, inventory management, and analytics.",
    category: "ecommerce",
    stack: "Laravel",
    previewImage: "/templates/ecommerce-1.jpg",
    liveDemo: "https://demo.commerce-elite.com",
    startingPrice: 79,
    featured: true,
    features: ["Product Catalog", "Shopping Cart", "Secure Checkout", "Inventory Management", "Order Tracking", "Payment Gateway", "Customer Reviews", "Wishlist"],
    performanceScore: 94,
    businessType: ["Retail", "DTC", "Fashion"],
  },
  {
    id: "tpl-bistro-deluxe",
    name: "Bistro Deluxe",
    description: "Restaurant and cafe template with digital menu, table reservations, online ordering, and loyalty program integration.",
    category: "restaurant",
    stack: "WordPress",
    previewImage: "/templates/restaurant-1.jpg",
    liveDemo: "https://demo.bistro-deluxe.com",
    startingPrice: 39,
    featured: false,
    features: ["Digital Menu", "Table Reservations", "Online Ordering", "Gallery", "Location Map", "Staff Management", "Loyalty Program", "Delivery Integration"],
    performanceScore: 92,
    businessType: ["Restaurant", "Cafe", "Bar"],
  },
  {
    id: "tpl-saas-launch",
    name: "SaaS Launch",
    description: "Modern SaaS landing page template with pricing tables, feature sections, documentation portal, and changelog.",
    category: "saas",
    stack: "Next.js",
    previewImage: "/templates/saas-1.jpg",
    liveDemo: "https://demo.saas-launch.com",
    startingPrice: 69,
    featured: true,
    features: ["Pricing Tables", "Feature Sections", "Documentation", "Blog", "Newsletter", "API Docs", "User Dashboard", "Changelog"],
    performanceScore: 97,
    businessType: ["SaaS", "Startup", "Tech"],
  },
  {
    id: "tpl-marketplace-hub",
    name: "Marketplace Hub",
    description: "Digital marketplace template with vendor management, product listings, commission handling, and dispute resolution.",
    category: "marketplace",
    stack: "Laravel",
    previewImage: "/templates/marketplace-1.jpg",
    liveDemo: "https://demo.marketplace-hub.com",
    startingPrice: 99,
    featured: false,
    features: ["Vendor Dashboard", "Product Listings", "Reviews System", "Payment Gateway", "Admin Panel", "Commission Management", "Dispute Resolution", "Analytics"],
    performanceScore: 91,
    businessType: ["Marketplace", "Platform", "B2C"],
  },
  {
    id: "tpl-corporate-edge",
    name: "Corporate Edge",
    description: "Enterprise-grade corporate template with multi-language support, CRM integration, career portal, and investor relations.",
    category: "corporate",
    stack: "Next.js",
    previewImage: "/templates/corporate-2.jpg",
    liveDemo: "https://demo.corporate-edge.com",
    startingPrice: 89,
    featured: false,
    features: ["Multi-language", "CRM Integration", "Career Portal", "News Section", "Investor Relations", "Event Management", "Internal Communication", "Board Portal"],
    performanceScore: 95,
    businessType: ["Enterprise", "Public Company", "Global"],
  },
  {
    id: "tpl-realestate-showcase",
    name: "Real Estate Showcase",
    description: "Professional real estate website with property listings, virtual tours, agent directories, and mortgage calculators.",
    category: "corporate",
    stack: "Next.js",
    previewImage: "/templates/realestate-1.jpg",
    liveDemo: "https://demo.realestate-showcase.com",
    startingPrice: 79,
    featured: true,
    features: ["Property Listings", "Virtual Tours", "Agent Directory", "Mortgage Calculator", "Lead Capture", "CRM Integration", "Advanced Search", "IDX Integration"],
    performanceScore: 96,
    businessType: ["Real Estate", "Brokerage", "Property Management"],
  },
  {
    id: "tpl-landing-plus",
    name: "Landing Page Plus",
    description: "High-converting landing page template optimized for lead generation, A/B testing, and sales funnel conversion.",
    category: "ecommerce",
    stack: "Next.js",
    previewImage: "/templates/landing-1.jpg",
    liveDemo: "https://demo.landing-page-plus.com",
    startingPrice: 34,
    featured: false,
    features: ["Lead Forms", "Video Integration", "Email Capture", "Social Proof", "Heat Maps", "A/B Testing", "Conversion Tracking", "Popup Builder"],
    performanceScore: 98,
    businessType: ["Marketing", "Startup", "Product Launch"],
  },
  {
    id: "tpl-medical-practice",
    name: "Medical Practice",
    description: "HIPAA-compliant medical practice website with appointment booking, patient portal, and telemedicine integration.",
    category: "corporate",
    stack: "Next.js",
    previewImage: "/templates/medical-1.jpg",
    liveDemo: "https://demo.medical-practice.com",
    startingPrice: 119,
    featured: false,
    features: ["Appointment Booking", "Patient Portal", "Telemedicine", "HIPAA Compliant", "Insurance Verification", "Medical Records", "Lab Results", "Prescription Refills"],
    performanceScore: 94,
    businessType: ["Healthcare", "Medical Practice", "Clinic"],
  },
  {
    id: "tpl-law-firm",
    name: "Law Firm Pro",
    description: "Professional law firm website with practice areas, attorney profiles, case results, and client intake forms.",
    category: "corporate",
    stack: "Next.js",
    previewImage: "/templates/lawfirm-1.jpg",
    liveDemo: "https://demo.law-firm-pro.com",
    startingPrice: 89,
    featured: false,
    features: ["Practice Areas", "Attorney Profiles", "Case Results", "Client Intake", "Blog", "FAQ Section", "Contact Forms", "Live Chat"],
    performanceScore: 97,
    businessType: ["Law Firm", "Legal Services", "Attorney"],
  },
];

// ============================================================================
// CURRENT USER - Authenticated user context
// ============================================================================

export const currentUser: User = {
  id: "usr_2kX9mP4vL8nQ",
  name: "Alex Johnson",
  email: "alex.johnson@techventures.com",
  avatar: "/avatars/alex-johnson.jpg",
  role: "user",
  createdAt: "2024-01-15T10:30:00Z",
};

// ============================================================================
// WEBSITES - User's deployed websites with various statuses
// ============================================================================

export const websites: Website[] = [
  {
    id: "ws_8kL2mN9pQ4vX",
    projectName: "TechVentures Corp",
    templateId: "tpl-luxe-corporate",
    templateName: "Luxe Corporate",
    status: "ready",
    liveUrl: "https://techventures.ovmon.app",
    dashboardUrl: "https://dash.ovmon.app/ws_8kL2mN9pQ4vX",
    subdomain: "techventures",
    customDomain: "techventures.com",
    createdAt: "2024-02-01T10:00:00Z",
    renewalDate: "2025-02-01T10:00:00Z",
  },
  {
    id: "ws_3jK7bN2mP9qR",
    projectName: "Creative Studio NYC",
    templateId: "tpl-agency-pro",
    templateName: "Agency Pro",
    status: "ready",
    liveUrl: "https://creativestudionyc.ovmon.app",
    dashboardUrl: "https://dash.ovmon.app/ws_3jK7bN2mP9qR",
    subdomain: "creativestudionyc",
    customDomain: "creativestudio.nyc",
    createdAt: "2024-03-15T14:30:00Z",
    renewalDate: "2025-03-15T14:30:00Z",
  },
  {
    id: "ws_5pL9kM4nQ2vX",
    projectName: "FoodieSpot Restaurant",
    templateId: "tpl-bistro-deluxe",
    templateName: "Bistro Deluxe",
    status: "provisioning",
    liveUrl: "https://foodiespot.ovmon.app",
    dashboardUrl: "https://dash.ovmon.app/ws_5pL9kM4nQ2vX",
    subdomain: "foodiespot",
    createdAt: "2024-11-20T09:00:00Z",
    renewalDate: "2025-11-20T09:00:00Z",
    provisioningProgress: {
      websiteId: "ws_5pL9kM4nQ2vX",
      currentStep: "database_created",
      steps: [
        { step: "payment_received", status: "completed", timestamp: "2024-11-20T09:00:00Z" },
        { step: "template_selected", status: "completed", timestamp: "2024-11-20T09:00:15Z" },
        { step: "server_provisioning", status: "completed", timestamp: "2024-11-20T09:02:30Z" },
        { step: "database_created", status: "in_progress" },
        { step: "domain_linked", status: "pending" },
        { step: "ssl_enabled", status: "pending" },
        { step: "ready", status: "pending" },
      ],
    },
  },
  {
    id: "ws_7nM3kP8qL2vR",
    projectName: "ShopMaxx Boutique",
    templateId: "tpl-commerce-elite",
    templateName: "Commerce Elite",
    status: "pending",
    liveUrl: "https://shopmaxx.ovmon.app",
    dashboardUrl: "https://dash.ovmon.app/ws_7nM3kP8qL2vR",
    subdomain: "shopmaxx",
    createdAt: "2024-11-22T11:00:00Z",
    renewalDate: "2025-11-22T11:00:00Z",
    provisioningProgress: {
      websiteId: "ws_7nM3kP8qL2vR",
      currentStep: "payment_received",
      steps: [
        { step: "payment_received", status: "completed", timestamp: "2024-11-22T11:00:00Z" },
        { step: "template_selected", status: "in_progress" },
        { step: "server_provisioning", status: "pending" },
        { step: "database_created", status: "pending" },
        { step: "domain_linked", status: "pending" },
        { step: "ssl_enabled", status: "pending" },
        { step: "ready", status: "pending" },
      ],
    },
  },
  {
    id: "ws_9kL5mN7pQ3vX",
    projectName: "Acme SaaS Platform",
    templateId: "tpl-saas-launch",
    templateName: "SaaS Launch",
    status: "ready",
    liveUrl: "https://acme-saas.ovmon.app",
    dashboardUrl: "https://dash.ovmon.app/ws_9kL5mN7pQ3vX",
    subdomain: "acme-saas",
    customDomain: "acmesaas.io",
    createdAt: "2024-06-10T08:15:00Z",
    renewalDate: "2025-06-10T08:15:00Z",
  },
  {
    id: "ws_2jK8bN4mP6qR",
    projectName: "Downtown Realty Group",
    templateId: "tpl-realestate-showcase",
    templateName: "Real Estate Showcase",
    status: "ready",
    liveUrl: "https://downtownrealty.ovmon.app",
    dashboardUrl: "https://dash.ovmon.app/ws_2jK8bN4mP6qR",
    subdomain: "downtownrealty",
    createdAt: "2024-08-22T13:45:00Z",
    renewalDate: "2025-08-22T13:45:00Z",
  },
  {
    id: "ws_4pL1kM9nQ5vX",
    projectName: "Portfolio Site",
    templateId: "tpl-starter-portfolio",
    templateName: "Starter Portfolio",
    status: "suspended",
    liveUrl: "https://alexjohnson.ovmon.app",
    dashboardUrl: "https://dash.ovmon.app/ws_4pL1kM9nQ5vX",
    subdomain: "alexjohnson",
    createdAt: "2024-01-20T16:00:00Z",
    renewalDate: "2024-10-20T16:00:00Z",
  },
];

// ============================================================================
// DOMAINS - Custom domains and DNS configuration
// ============================================================================

export const domains: Domain[] = [
  {
    id: "dom_8kL2mN9pQ4vX",
    websiteId: "ws_8kL2mN9pQ4vX",
    subdomain: "techventures.ovmon.app",
    customDomain: "techventures.com",
    verificationStatus: "verified",
    sslStatus: "active",
    isPrimary: true,
    dnsRecords: [
      { type: "A", name: "@", value: "76.76.21.21" },
      { type: "CNAME", name: "www", value: "cname.ovmon.app" },
      { type: "TXT", name: "_ovmon-verify", value: "ovmon-verify=8kL2mN9pQ4vX" },
    ],
  },
  {
    id: "dom_3jK7bN2mP9qR",
    websiteId: "ws_3jK7bN2mP9qR",
    subdomain: "creativestudionyc.ovmon.app",
    customDomain: "creativestudio.nyc",
    verificationStatus: "verified",
    sslStatus: "active",
    isPrimary: true,
    dnsRecords: [
      { type: "A", name: "@", value: "76.76.21.21" },
      { type: "CNAME", name: "www", value: "cname.ovmon.app" },
      { type: "TXT", name: "_ovmon-verify", value: "ovmon-verify=3jK7bN2mP9qR" },
    ],
  },
  {
    id: "dom_9kL5mN7pQ3vX",
    websiteId: "ws_9kL5mN7pQ3vX",
    subdomain: "acme-saas.ovmon.app",
    customDomain: "acmesaas.io",
    verificationStatus: "verified",
    sslStatus: "active",
    isPrimary: true,
    dnsRecords: [
      { type: "A", name: "@", value: "76.76.21.21" },
      { type: "CNAME", name: "www", value: "cname.ovmon.app" },
    ],
  },
  {
    id: "dom_2jK8bN4mP6qR",
    websiteId: "ws_2jK8bN4mP6qR",
    subdomain: "downtownrealty.ovmon.app",
    verificationStatus: "verified",
    sslStatus: "active",
    isPrimary: true,
  },
  {
    id: "dom_5pL9kM4nQ2vX",
    websiteId: "ws_5pL9kM4nQ2vX",
    subdomain: "foodiespot.ovmon.app",
    verificationStatus: "pending",
    sslStatus: "pending",
    isPrimary: true,
  },
];

// ============================================================================
// PLANS - Subscription tiers with features and limits
// ============================================================================

export const plans: Plan[] = [
  {
    id: "plan_starter",
    name: "Starter",
    tier: "starter",
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      "1 Website",
      "5GB Storage",
      "50GB Bandwidth",
      "Free SSL Certificate",
      "Email Support (48h response)",
      "Basic Analytics",
      "Ovmon Subdomain",
    ],
    websiteLimit: 1,
    storageLimit: "5GB",
    bandwidthLimit: "50GB",
    supportLevel: "email",
  },
  {
    id: "plan_growth",
    name: "Growth",
    tier: "growth",
    monthlyPrice: 59,
    yearlyPrice: 590,
    features: [
      "3 Websites",
      "25GB Storage",
      "200GB Bandwidth",
      "Free SSL Certificate",
      "Priority Email Support (24h)",
      "Advanced Analytics",
      "1 Custom Domain",
      "Weekly Backups",
      "Form Submissions (1,000/mo)",
    ],
    websiteLimit: 3,
    storageLimit: "25GB",
    bandwidthLimit: "200GB",
    supportLevel: "priority_email",
  },
  {
    id: "plan_pro",
    name: "Pro",
    tier: "pro",
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      "10 Websites",
      "100GB Storage",
      "1TB Bandwidth",
      "Free SSL Certificate",
      "24/7 Chat Support",
      "Advanced Analytics + Reports",
      "Unlimited Custom Domains",
      "Daily Backups",
      "Form Submissions (10,000/mo)",
      "API Access",
      "White-label Option",
      "Team Members (5)",
    ],
    websiteLimit: 10,
    storageLimit: "100GB",
    bandwidthLimit: "1TB",
    supportLevel: "chat_24_7",
  },
  {
    id: "plan_premium",
    name: "Premium",
    tier: "premium",
    monthlyPrice: 199,
    yearlyPrice: 1990,
    features: [
      "25 Websites",
      "500GB Storage",
      "5TB Bandwidth",
      "Free SSL Certificate",
      "24/7 Phone Support",
      "Custom Analytics Dashboard",
      "Unlimited Custom Domains",
      "Hourly Backups",
      "Unlimited Form Submissions",
      "Full API Access",
      "White-label",
      "Team Members (Unlimited)",
      "Dedicated Account Manager",
      "99.9% Uptime SLA",
    ],
    websiteLimit: 25,
    storageLimit: "500GB",
    bandwidthLimit: "5TB",
    supportLevel: "phone_24_7",
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    tier: "enterprise",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Unlimited Websites",
      "Unlimited Storage",
      "Unlimited Bandwidth",
      "Free SSL Certificate",
      "Dedicated Support Team",
      "Custom Analytics & BI",
      "Custom Domains + DNS Management",
      "Real-time Backups",
      "Unlimited Everything",
      "Full API Access + Webhooks",
      "White-label + Custom Branding",
      "Unlimited Team Members",
      "Dedicated Success Manager",
      "99.99% Uptime SLA",
      "Custom Integrations",
      "On-premise Option",
    ],
    websiteLimit: -1,
    storageLimit: "Unlimited",
    bandwidthLimit: "Unlimited",
    supportLevel: "dedicated",
  },
];

// ============================================================================
// SUBSCRIPTION - Current user's active subscription
// ============================================================================

export const currentSubscription: Subscription = {
  id: "sub_9mK4nP7qL2vX",
  planId: "plan_pro",
  planName: "Pro",
  status: "active",
  currentPeriodEnd: "2025-01-15T10:00:00Z",
  renewalDate: "2025-01-15T10:00:00Z",
  billingCycle: "monthly",
  websitesUsed: 6,
  storageUsed: "42.8GB",
  bandwidthUsed: "312GB",
};

// ============================================================================
// INVOICES - Billing history
// ============================================================================

export const invoices: Invoice[] = [
  { 
    id: "inv_2024_11_15", 
    amount: 99.00, 
    status: "paid", 
    date: "2024-11-15T10:00:00Z", 
    description: "Pro Plan - Monthly Subscription",
    paymentMethod: "Visa ending in 4242",
  },
  { 
    id: "inv_2024_10_15", 
    amount: 99.00, 
    status: "paid", 
    date: "2024-10-15T10:00:00Z", 
    description: "Pro Plan - Monthly Subscription",
    paymentMethod: "Visa ending in 4242",
  },
  { 
    id: "inv_2024_09_15", 
    amount: 99.00, 
    status: "paid", 
    date: "2024-09-15T10:00:00Z", 
    description: "Pro Plan - Monthly Subscription",
    paymentMethod: "Visa ending in 4242",
  },
  { 
    id: "inv_2024_08_15", 
    amount: 59.00, 
    status: "paid", 
    date: "2024-08-15T10:00:00Z", 
    description: "Growth Plan - Monthly Subscription",
    paymentMethod: "Visa ending in 4242",
  },
  { 
    id: "inv_2024_07_15", 
    amount: 59.00, 
    status: "paid", 
    date: "2024-07-15T10:00:00Z", 
    description: "Growth Plan - Monthly Subscription",
    paymentMethod: "Visa ending in 4242",
  },
  { 
    id: "inv_2024_06_15", 
    amount: 59.00, 
    status: "paid", 
    date: "2024-06-15T10:00:00Z", 
    description: "Growth Plan - Monthly Subscription",
    paymentMethod: "Visa ending in 4242",
  },
  { 
    id: "inv_2024_05_15", 
    amount: 29.00, 
    status: "paid", 
    date: "2024-05-15T10:00:00Z", 
    description: "Starter Plan - Monthly Subscription",
    paymentMethod: "Visa ending in 4242",
  },
  { 
    id: "inv_2024_04_15", 
    amount: 29.00, 
    status: "paid", 
    date: "2024-04-15T10:00:00Z", 
    description: "Starter Plan - Monthly Subscription",
    paymentMethod: "Visa ending in 4242",
  },
];

// ============================================================================
// SUPPORT TICKETS - Customer support history
// ============================================================================

export const tickets: Ticket[] = [
  {
    id: "tkt_8mK3nP9qL2vX",
    userId: "usr_2kX9mP4vL8nQ",
    subject: "Custom domain not connecting - DNS propagation issue",
    description: "I added my custom domain creativestudio.nyc but it shows as pending verification for over 24 hours. I've already updated my DNS records as instructed.",
    priority: "high",
    status: "in_progress",
    createdAt: "2024-11-18T14:00:00Z",
    updatedAt: "2024-11-19T10:00:00Z",
    messages: [
      {
        id: "msg_1",
        ticketId: "tkt_8mK3nP9qL2vX",
        senderId: "usr_2kX9mP4vL8nQ",
        senderName: "Alex Johnson",
        senderRole: "user",
        message: "I added my custom domain creativestudio.nyc but it shows as pending verification for over 24 hours. I've already updated my DNS records as instructed. Can you help?",
        createdAt: "2024-11-18T14:00:00Z",
      },
      {
        id: "msg_2",
        ticketId: "tkt_8mK3nP9qL2vX",
        senderId: "admin_support_1",
        senderName: "Marcus Chen",
        senderRole: "admin",
        message: "Hi Alex, thanks for reaching out! I've checked your DNS configuration and I see the issue. Your CNAME record is pointing to 'cname.ovmon.com' instead of 'cname.ovmon.app'. Could you please update this in your domain registrar's DNS settings? Once updated, propagation should complete within 1-4 hours.",
        createdAt: "2024-11-19T10:00:00Z",
      },
      {
        id: "msg_3",
        ticketId: "tkt_8mK3nP9qL2vX",
        senderId: "usr_2kX9mP4vL8nQ",
        senderName: "Alex Johnson",
        senderRole: "user",
        message: "Thank you Marcus! I've updated the CNAME record. I'll wait for propagation and let you know if it works.",
        createdAt: "2024-11-19T11:30:00Z",
      },
    ],
  },
  {
    id: "tkt_5pL2kM7nQ9vX",
    userId: "usr_2kX9mP4vL8nQ",
    subject: "Request for template customization - color scheme",
    description: "Can I get a custom color scheme for my Luxe Corporate template? I want to match our brand guidelines.",
    priority: "low",
    status: "resolved",
    createdAt: "2024-11-10T09:00:00Z",
    updatedAt: "2024-11-12T16:00:00Z",
    messages: [
      {
        id: "msg_4",
        ticketId: "tkt_5pL2kM7nQ9vX",
        senderId: "usr_2kX9mP4vL8nQ",
        senderName: "Alex Johnson",
        senderRole: "user",
        message: "Can I get a custom color scheme for my Luxe Corporate template? I want to match our brand guidelines (primary: #2563EB, secondary: #10B981).",
        createdAt: "2024-11-10T09:00:00Z",
      },
      {
        id: "msg_5",
        ticketId: "tkt_5pL2kM7nQ9vX",
        senderId: "admin_support_2",
        senderName: "Sarah Williams",
        senderRole: "admin",
        message: "Hi Alex! Great news - as a Pro plan subscriber, you have access to the Theme Customizer in your website dashboard. Go to Settings > Appearance > Theme and you can set custom primary and secondary colors there. Let me know if you need any help!",
        createdAt: "2024-11-10T14:00:00Z",
      },
      {
        id: "msg_6",
        ticketId: "tkt_5pL2kM7nQ9vX",
        senderId: "usr_2kX9mP4vL8nQ",
        senderName: "Alex Johnson",
        senderRole: "user",
        message: "Perfect! I found it. The changes look great. Thank you!",
        createdAt: "2024-11-12T16:00:00Z",
      },
    ],
  },
  {
    id: "tkt_3jK9bN4mP8qR",
    userId: "usr_2kX9mP4vL8nQ",
    subject: "Upgrading from Growth to Pro - feature questions",
    description: "I'm considering upgrading to Pro. Can you clarify what's included in the API access?",
    priority: "medium",
    status: "resolved",
    createdAt: "2024-08-05T11:00:00Z",
    updatedAt: "2024-08-06T09:00:00Z",
    messages: [],
  },
];

// ============================================================================
// ACTIVITIES - Recent user activity feed
// ============================================================================

export const activities: Activity[] = [
  { 
    id: "act_1", 
    type: "website_created", 
    message: "ShopMaxx Boutique website created and queued for provisioning", 
    timestamp: "2024-11-22T11:00:00Z",
    metadata: { websiteId: "ws_7nM3kP8qL2vR", templateName: "Commerce Elite" }
  },
  { 
    id: "act_2", 
    type: "provisioning_complete", 
    message: "FoodieSpot Restaurant is now deploying to servers", 
    timestamp: "2024-11-20T15:00:00Z",
    metadata: { websiteId: "ws_5pL9kM4nQ2vX" }
  },
  { 
    id: "act_3", 
    type: "payment_received", 
    message: "Payment of $99.00 received for Pro Plan", 
    timestamp: "2024-11-15T10:00:00Z",
    metadata: { invoiceId: "inv_2024_11_15", amount: 99.00 }
  },
  { 
    id: "act_4", 
    type: "domain_connected", 
    message: "creativestudio.nyc connected and SSL certificate issued", 
    timestamp: "2024-11-10T14:00:00Z",
    metadata: { domainId: "dom_3jK7bN2mP9qR", domain: "creativestudio.nyc" }
  },
  { 
    id: "act_5", 
    type: "ticket_opened", 
    message: "Support ticket opened: Custom domain not connecting", 
    timestamp: "2024-11-18T14:00:00Z",
    metadata: { ticketId: "tkt_8mK3nP9qL2vX" }
  },
  { 
    id: "act_6", 
    type: "website_created", 
    message: "Downtown Realty Group website deployed successfully", 
    timestamp: "2024-08-22T14:30:00Z",
    metadata: { websiteId: "ws_2jK8bN4mP6qR", templateName: "Real Estate Showcase" }
  },
  { 
    id: "act_7", 
    type: "payment_received", 
    message: "Plan upgraded from Growth to Pro", 
    timestamp: "2024-09-15T10:00:00Z",
    metadata: { planFrom: "Growth", planTo: "Pro" }
  },
  { 
    id: "act_8", 
    type: "domain_connected", 
    message: "acmesaas.io connected to Acme SaaS Platform", 
    timestamp: "2024-06-12T09:00:00Z",
    metadata: { domainId: "dom_9kL5mN7pQ3vX", domain: "acmesaas.io" }
  },
];

// ============================================================================
// NOTIFICATIONS - User notification center
// ============================================================================

export const notifications: Notification[] = [
  { 
    id: "notif_1", 
    title: "Provisioning in Progress", 
    message: "FoodieSpot Restaurant is being set up. Database creation in progress...", 
    read: false, 
    createdAt: "2024-11-20T12:00:00Z",
    type: "info",
    actionUrl: "/dashboard/provisioning",
  },
  { 
    id: "notif_2", 
    title: "New Website Queued", 
    message: "ShopMaxx Boutique has been added to the provisioning queue. We'll notify you when it's ready.", 
    read: false, 
    createdAt: "2024-11-22T11:05:00Z",
    type: "info",
    actionUrl: "/dashboard/provisioning",
  },
  { 
    id: "notif_3", 
    title: "Payment Successful", 
    message: "Your Pro Plan subscription ($99.00) has been renewed for November 2024.", 
    read: true, 
    createdAt: "2024-11-15T10:00:00Z",
    type: "success",
    actionUrl: "/dashboard/billing",
  },
  { 
    id: "notif_4", 
    title: "Support Ticket Update", 
    message: "Marcus Chen replied to your ticket: Custom domain not connecting", 
    read: false, 
    createdAt: "2024-11-19T10:00:00Z",
    type: "info",
    actionUrl: "/dashboard/support",
  },
  { 
    id: "notif_5", 
    title: "New Feature Available", 
    message: "Check out our new advanced analytics dashboard with real-time visitor tracking!", 
    read: false, 
    createdAt: "2024-11-14T09:00:00Z",
    type: "feature",
    actionUrl: "/dashboard/websites",
  },
  { 
    id: "notif_6", 
    title: "SSL Certificate Renewed", 
    message: "SSL certificate for techventures.com has been automatically renewed.", 
    read: true, 
    createdAt: "2024-11-01T00:00:00Z",
    type: "success",
  },
  { 
    id: "notif_7", 
    title: "Website Suspended", 
    message: "Your Portfolio Site (alexjohnson.ovmon.app) has been suspended due to missed payment. Renew to restore.", 
    read: true, 
    createdAt: "2024-10-25T00:00:00Z",
    type: "warning",
    actionUrl: "/dashboard/billing",
  },
];

// ============================================================================
// ADMIN STATS - Platform-wide statistics (for admin dashboard)
// ============================================================================

export const adminStats: AdminStats = {
  totalUsers: 12847,
  totalWebsites: 38921,
  activeSubscriptions: 10892,
  monthlyRevenue: 894250,
  pendingProvisioning: 47,
  failedJobs: 3,
  openTickets: 156,
  avgResponseTime: "2.4 hours",
  customerSatisfaction: 4.8,
  churnRate: 2.1,
};

// ============================================================================
// ALL USERS - User directory (for admin)
// ============================================================================

export const allUsers: User[] = [
  currentUser,
  { 
    id: "usr_4jK8bN2mP9qR", 
    name: "Sarah Miller", 
    email: "sarah@designstudio.co", 
    role: "user", 
    createdAt: "2024-02-20T08:00:00Z",
    subscription: "Premium",
    websiteCount: 8,
  },
  { 
    id: "usr_6pL9kM4nQ2vX", 
    name: "James Wilson", 
    email: "james@startupfoundry.io", 
    role: "user", 
    createdAt: "2024-03-10T12:00:00Z",
    subscription: "Pro",
    websiteCount: 5,
  },
  { 
    id: "usr_8mK3nP7qL5vX", 
    name: "Emma Davis", 
    email: "emma@creativeagency.com", 
    role: "user", 
    createdAt: "2024-04-05T15:00:00Z",
    subscription: "Growth",
    websiteCount: 3,
  },
  { 
    id: "usr_1nL5kM9pQ8vR", 
    name: "Michael Chen", 
    email: "michael@techcorp.com", 
    role: "user", 
    createdAt: "2024-05-12T09:30:00Z",
    subscription: "Enterprise",
    websiteCount: 42,
  },
  { 
    id: "admin_support_1", 
    name: "Marcus Chen", 
    email: "marcus@ovmon.com", 
    role: "admin", 
    createdAt: "2024-01-01T00:00:00Z",
    department: "Support",
  },
  { 
    id: "admin_support_2", 
    name: "Sarah Williams", 
    email: "sarah.w@ovmon.com", 
    role: "admin", 
    createdAt: "2024-01-01T00:00:00Z",
    department: "Support",
  },
];

// ============================================================================
// USAGE METRICS - Detailed usage statistics
// ============================================================================

export const usageMetrics = {
  currentPeriod: {
    startDate: "2024-11-01T00:00:00Z",
    endDate: "2024-11-30T23:59:59Z",
  },
  bandwidth: {
    used: 312,
    limit: 1024,
    unit: "GB",
    trend: "+12%",
  },
  storage: {
    used: 42.8,
    limit: 100,
    unit: "GB",
    trend: "+5%",
  },
  pageViews: {
    total: 245890,
    trend: "+18%",
    byWebsite: [
      { websiteId: "ws_8kL2mN9pQ4vX", name: "TechVentures Corp", views: 89420 },
      { websiteId: "ws_3jK7bN2mP9qR", name: "Creative Studio NYC", views: 67230 },
      { websiteId: "ws_9kL5mN7pQ3vX", name: "Acme SaaS Platform", views: 52180 },
      { websiteId: "ws_2jK8bN4mP6qR", name: "Downtown Realty Group", views: 37060 },
    ],
  },
  visitors: {
    unique: 84320,
    returning: 41290,
    trend: "+15%",
  },
  formSubmissions: {
    used: 2847,
    limit: 10000,
    trend: "+8%",
  },
  apiCalls: {
    used: 12450,
    limit: 100000,
    trend: "+22%",
  },
};

// ============================================================================
// TRAFFIC DATA - Analytics for charts
// ============================================================================

export const trafficData = {
  weekly: [
    { date: "Mon", views: 12400, visits: 4200, conversions: 84 },
    { date: "Tue", views: 11398, visits: 4020, conversions: 76 },
    { date: "Wed", views: 19800, visits: 6290, conversions: 142 },
    { date: "Thu", views: 13908, visits: 4800, conversions: 95 },
    { date: "Fri", views: 14800, visits: 5181, conversions: 108 },
    { date: "Sat", views: 8800, visits: 3500, conversions: 62 },
    { date: "Sun", views: 7300, visits: 2900, conversions: 48 },
  ],
  monthly: [
    { month: "Jun", views: 245000, visits: 82000, revenue: 4200 },
    { month: "Jul", views: 289000, visits: 96000, revenue: 5100 },
    { month: "Aug", views: 312000, visits: 104000, revenue: 5800 },
    { month: "Sep", views: 356000, visits: 118000, revenue: 6400 },
    { month: "Oct", views: 398000, visits: 132000, revenue: 7200 },
    { month: "Nov", views: 425000, visits: 142000, revenue: 7800 },
  ],
  topPages: [
    { path: "/", views: 45230, avgTime: "2:34" },
    { path: "/about", views: 23450, avgTime: "1:45" },
    { path: "/services", views: 18920, avgTime: "3:12" },
    { path: "/contact", views: 12340, avgTime: "1:23" },
    { path: "/blog", views: 9870, avgTime: "4:56" },
  ],
  topReferrers: [
    { source: "Google", visits: 42300, percentage: 52 },
    { source: "Direct", visits: 21500, percentage: 26 },
    { source: "LinkedIn", visits: 8400, percentage: 10 },
    { source: "Twitter", visits: 5200, percentage: 6 },
    { source: "Other", visits: 4920, percentage: 6 },
  ],
};

// ============================================================================
// TEAM MEMBERS - Team collaboration (Pro+ plans)
// ============================================================================

export const teamMembers = [
  {
    id: "team_1",
    userId: "usr_2kX9mP4vL8nQ",
    name: "Alex Johnson",
    email: "alex.johnson@techventures.com",
    role: "owner",
    avatar: "/avatars/alex-johnson.jpg",
    addedAt: "2024-01-15T10:30:00Z",
    lastActive: "2024-11-22T14:30:00Z",
  },
  {
    id: "team_2",
    userId: "usr_team_1",
    name: "Jordan Lee",
    email: "jordan@techventures.com",
    role: "admin",
    addedAt: "2024-03-20T09:00:00Z",
    lastActive: "2024-11-21T16:45:00Z",
  },
  {
    id: "team_3",
    userId: "usr_team_2",
    name: "Taylor Kim",
    email: "taylor@techventures.com",
    role: "editor",
    addedAt: "2024-06-15T11:00:00Z",
    lastActive: "2024-11-22T10:15:00Z",
  },
];

// ============================================================================
// INFRASTRUCTURE - Servers, Provisioning Profiles, and Jobs (Admin)
// ============================================================================

export const servers: import('./types').Server[] = [
  {
    id: "srv_1",
    name: "Primary US-East Cluster",
    region: "US-East (N. Virginia)",
    provider: "aws",
    ipAddress: "76.76.21.21",
    operatingSystem: "ubuntu",
    stackSupport: ["Laravel", "Next.js", "WordPress"],
    status: "healthy",
    metrics: { cpuUsage: 42, ramUsage: 58, diskUsage: 35 },
    websitesCount: 124,
    lastSyncAt: "2024-11-22T14:30:00Z",
    capacity: 200,
    isProvisioning: false,
  },
  {
    id: "srv_2",
    name: "Secondary US-West Cluster",
    region: "US-West (Oregon)",
    provider: "digitalocean",
    ipAddress: "76.76.21.22",
    operatingSystem: "ubuntu",
    stackSupport: ["Laravel", "Next.js", "WordPress"],
    status: "healthy",
    metrics: { cpuUsage: 35, ramUsage: 41, diskUsage: 28 },
    websitesCount: 89,
    lastSyncAt: "2024-11-22T14:28:00Z",
    capacity: 200,
    isProvisioning: false,
  },
  {
    id: "srv_3",
    name: "EU-Central Backup",
    region: "EU (Frankfurt)",
    provider: "linode",
    ipAddress: "76.76.21.23",
    operatingSystem: "debian",
    stackSupport: ["Next.js", "WordPress"],
    status: "degraded",
    metrics: { cpuUsage: 72, ramUsage: 85, diskUsage: 62 },
    websitesCount: 56,
    lastSyncAt: "2024-11-22T14:15:00Z",
    capacity: 150,
    isProvisioning: true,
  },
];

export const provisioningProfiles: import('./types').ProvisioningProfile[] = [
  {
    id: "prof_1",
    name: "Next.js Premium",
    stackType: "Next.js",
    deploymentMethod: "docker",
    targetServerId: "srv_1",
    databaseStrategy: "managed",
    domainStrategy: "auto",
    sslStrategy: "letsencrypt",
    backupProfile: "daily",
    environmentPreset: { NODE_ENV: "production", NEXT_PUBLIC_API_URL: "https://api.ovmon.app" },
    status: "active",
    createdAt: "2024-09-01T00:00:00Z",
  },
  {
    id: "prof_2",
    name: "Laravel Enterprise",
    stackType: "Laravel",
    deploymentMethod: "traditional",
    targetServerId: "srv_1",
    databaseStrategy: "managed",
    domainStrategy: "auto",
    sslStrategy: "letsencrypt",
    backupProfile: "hourly",
    environmentPreset: { APP_ENV: "production", APP_DEBUG: "false" },
    status: "active",
    createdAt: "2024-08-15T00:00:00Z",
  },
  {
    id: "prof_3",
    name: "WordPress Standard",
    stackType: "WordPress",
    deploymentMethod: "traditional",
    targetServerId: "srv_2",
    databaseStrategy: "server",
    domainStrategy: "manual",
    sslStrategy: "letsencrypt",
    backupProfile: "daily",
    environmentPreset: { WP_ENVIRONMENT_TYPE: "production" },
    status: "active",
    createdAt: "2024-07-20T00:00:00Z",
  },
];

export const jobs: import('./types').Job[] = [
  {
    id: "job_1",
    type: "provisioning",
    status: "running",
    serverId: "srv_1",
    websiteId: "ws_5pL9kM4nQ2vX",
    progress: 65,
    createdAt: "2024-11-22T12:00:00Z",
  },
  {
    id: "job_2",
    type: "provisioning",
    status: "running",
    serverId: "srv_1",
    websiteId: "ws_7nM3kP8qL2vR",
    progress: 28,
    createdAt: "2024-11-22T12:15:00Z",
  },
  {
    id: "job_3",
    type: "backup",
    status: "completed",
    websiteId: "ws_8kL2mN9pQ4vX",
    progress: 100,
    createdAt: "2024-11-22T03:00:00Z",
    completedAt: "2024-11-22T03:45:00Z",
  },
  {
    id: "job_4",
    type: "backup",
    status: "failed",
    websiteId: "ws_4pL1kM9nQ5vX",
    progress: 0,
    createdAt: "2024-11-21T18:00:00Z",
    completedAt: "2024-11-21T18:30:00Z",
    error: "Website is suspended. Cannot backup.",
    retryCount: 1,
  },
  {
    id: "job_5",
    type: "maintenance",
    status: "completed",
    serverId: "srv_1",
    progress: 100,
    createdAt: "2024-11-21T00:00:00Z",
    completedAt: "2024-11-21T02:15:00Z",
  },
];

export const backups: import('./types').Backup[] = [
  {
    id: "bkp_1",
    websiteId: "ws_8kL2mN9pQ4vX",
    serverId: "srv_1",
    size: 2.4,
    status: "completed",
    createdAt: "2024-11-22T03:00:00Z",
    retentionExpiry: "2024-12-22T03:00:00Z",
    backupType: "full",
  },
  {
    id: "bkp_2",
    websiteId: "ws_8kL2mN9pQ4vX",
    serverId: "srv_1",
    size: 0.3,
    status: "completed",
    createdAt: "2024-11-21T03:00:00Z",
    retentionExpiry: "2024-11-28T03:00:00Z",
    backupType: "incremental",
  },
  {
    id: "bkp_3",
    websiteId: "ws_3jK7bN2mP9qR",
    serverId: "srv_1",
    size: 1.8,
    status: "completed",
    createdAt: "2024-11-22T03:15:00Z",
    retentionExpiry: "2024-12-22T03:15:00Z",
    backupType: "full",
  },
  {
    id: "bkp_4",
    websiteId: "ws_9kL5mN7pQ3vX",
    serverId: "srv_1",
    size: 3.2,
    status: "pending",
    createdAt: "2024-11-22T14:00:00Z",
    retentionExpiry: "2025-01-22T14:00:00Z",
    backupType: "full",
  },
];

export const alerts: import('./types').Alert[] = [
  {
    id: "alrt_1",
    type: "cpu",
    severity: "critical",
    title: "High CPU Usage on EU-Central",
    description: "Server srv_3 is experiencing 72% CPU usage. Consider scaling or optimizing workloads.",
    createdAt: "2024-11-22T14:15:00Z",
    serverId: "srv_3",
  },
  {
    id: "alrt_2",
    type: "disk",
    severity: "warning",
    title: "Disk Usage Alert",
    description: "EU-Central server disk usage at 62%. Please monitor closely.",
    createdAt: "2024-11-22T12:00:00Z",
    serverId: "srv_3",
  },
  {
    id: "alrt_3",
    type: "ssl",
    severity: "warning",
    title: "SSL Certificate Expiring Soon",
    description: "SSL certificate for techventures.com expires in 7 days. Auto-renewal is configured.",
    createdAt: "2024-11-20T00:00:00Z",
    websiteId: "ws_8kL2mN9pQ4vX",
  },
  {
    id: "alrt_4",
    type: "provisioning",
    severity: "info",
    title: "Provisioning Job Queued",
    description: "ShopMaxx Boutique has been added to the provisioning queue. Expected deployment time: 15 minutes.",
    createdAt: "2024-11-22T11:00:00Z",
    websiteId: "ws_7nM3kP8qL2vR",
  },
  {
    id: "alrt_5",
    type: "uptime",
    severity: "critical",
    title: "Website Offline",
    description: "Portfolio Site (alexjohnson.ovmon.app) is offline due to suspension.",
    createdAt: "2024-10-20T00:00:00Z",
    resolvedAt: "2024-10-21T00:00:00Z",
    websiteId: "ws_4pL1kM9nQ5vX",
  },
];

// ============================================================================
// ADMIN PAGE COMPATIBILITY EXPORTS
// ============================================================================

type AdminUserListItem = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  plan: "starter" | "growth" | "pro" | "premium" | "enterprise";
  totalRevenue: number;
  websitesCount: number;
  status: "active" | "suspended" | "churned";
  createdAt: string;
};

type AdminSupportTicket = {
  id: string;
  subject: string;
  userName: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
};

const mapSubscriptionToPlan = (subscription?: string): AdminUserListItem["plan"] => {
  const normalized = (subscription || "").trim().toLowerCase();
  if (normalized === "starter") return "starter";
  if (normalized === "growth") return "growth";
  if (normalized === "pro") return "pro";
  if (normalized === "premium") return "premium";
  if (normalized === "enterprise") return "enterprise";
  return "starter";
};

export const adminUsers: AdminUserListItem[] = allUsers.map((user, index) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  plan: mapSubscriptionToPlan(user.subscription),
  totalRevenue: (user.websiteCount || 0) * 29 + index * 11,
  websitesCount: user.websiteCount || 0,
  status: user.role === "admin" ? "active" : "active",
  createdAt: user.createdAt,
}));

export const supportTickets: AdminSupportTicket[] = tickets.map((ticket) => {
  const ticketUser = allUsers.find((u) => u.id === ticket.userId);
  return {
    id: ticket.id,
    subject: ticket.subject,
    userName: ticketUser?.name || "Unknown User",
    category: ticket.category || "general",
    priority: ticket.priority,
    status: ticket.status,
    createdAt: ticket.createdAt,
  };
});
