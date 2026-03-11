-- Ovmon Database Schema: Templates

CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  stack TEXT NOT NULL CHECK (stack IN ('Laravel', 'Next.js', 'WordPress')),
  thumbnail_url TEXT,
  preview_url TEXT,
  demo_url TEXT,
  features JSONB DEFAULT '[]'::JSONB,
  requirements JSONB DEFAULT '{}'::JSONB,
  performance_score INTEGER DEFAULT 90,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  price_tier TEXT DEFAULT 'free' CHECK (price_tier IN ('free', 'pro', 'business', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (templates are public read, admin write)
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Everyone can read active templates
CREATE POLICY "templates_public_read" ON public.templates 
  FOR SELECT USING (is_active = TRUE);

-- Only admins can modify templates
CREATE POLICY "templates_admin_all" ON public.templates 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default templates
INSERT INTO public.templates (slug, name, description, category, stack, thumbnail_url, features, is_featured, price_tier)
VALUES 
  ('nextjs-saas-starter', 'SaaS Starter Pro', 'Modern SaaS template with authentication, billing, and dashboard', 'SaaS', 'Next.js', '/templates/saas-starter.jpg', '["Authentication", "Stripe Integration", "Dashboard", "API Routes", "Dark Mode"]'::JSONB, TRUE, 'pro'),
  ('laravel-ecommerce', 'E-Commerce Suite', 'Full-featured e-commerce platform with inventory management', 'E-Commerce', 'Laravel', '/templates/ecommerce.jpg', '["Product Management", "Cart System", "Payment Gateway", "Order Tracking", "Admin Panel"]'::JSONB, TRUE, 'business'),
  ('wordpress-business', 'Business starter', 'Professional business website with blog and contact forms', 'Business', 'WordPress', '/templates/business.jpg', '["Blog", "Contact Forms", "SEO Optimized", "Mobile Responsive", "Fast Loading"]'::JSONB, TRUE, 'free'),
  ('nextjs-portfolio', 'Developer Portfolio', 'Stunning portfolio for developers and designers', 'Portfolio', 'Next.js', '/templates/portfolio.jpg', '["Project Showcase", "Blog", "Contact Form", "Analytics", "Dark Mode"]'::JSONB, FALSE, 'free'),
  ('laravel-crm', 'CRM Professional', 'Customer relationship management system', 'Business', 'Laravel', '/templates/crm.jpg', '["Contact Management", "Deal Pipeline", "Email Integration", "Reports", "Team Collaboration"]'::JSONB, FALSE, 'business')
ON CONFLICT (slug) DO NOTHING;

-- Updated at trigger
DROP TRIGGER IF EXISTS templates_updated_at ON public.templates;
CREATE TRIGGER templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
