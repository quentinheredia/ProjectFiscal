-- ==============================================================================
-- Fiscal Insights - Supabase Schema Migration (v1)
-- ==============================================================================

-- 1. Rule Sets Table
CREATE TABLE IF NOT EXISTS public.rule_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_year INT NOT NULL,
    jurisdiction VARCHAR(4) NOT NULL, -- 'FED', 'ON', 'QC', 'BC', 'AB', etc.
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    rules JSONB NOT NULL,
    source_urls TEXT[] NOT NULL,
    verified_by VARCHAR(100),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (tax_year, jurisdiction)
);

-- Public read access for published rules only
ALTER TABLE public.rule_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published rules" ON public.rule_sets
    FOR SELECT USING (status = 'published');

-- 2. Test Vectors Table
CREATE TABLE IF NOT EXISTS public.test_vectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vector_id VARCHAR(50) NOT NULL UNIQUE,
    tax_year INT NOT NULL,
    jurisdiction VARCHAR(4) NOT NULL,
    inputs JSONB NOT NULL,
    expected_outputs JSONB NOT NULL,
    source_citation TEXT NOT NULL,
    tolerance_cents INT NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.test_vectors ENABLE ROW LEVEL SECURITY;
-- Admin-only policy for test vectors
CREATE POLICY "Admin read test vectors" ON public.test_vectors
    FOR SELECT TO authenticated USING (auth.jwt() ->> 'role' = 'service_role');

-- 3. Federal Spending Table (Public Accounts of Canada)
CREATE TABLE IF NOT EXISTS public.spending (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fiscal_year VARCHAR(10) NOT NULL,
    category_id VARCHAR(50) NOT NULL,
    category_en VARCHAR(200) NOT NULL,
    category_fr VARCHAR(200) NOT NULL,
    percentage NUMERIC(5, 2) NOT NULL,
    amount_billions_cents BIGINT,
    source_document VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.spending ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read spending" ON public.spending
    FOR SELECT USING (true);

-- 4. Subscribers Table (CASL & Law 25 compliant newsletter sign-ups)
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    locale VARCHAR(5) NOT NULL DEFAULT 'en',
    consent_text TEXT NOT NULL,
    consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    confirmed_at TIMESTAMPTZ,
    source_page VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
-- Insert only through server actions (no direct client writes)
CREATE POLICY "Service role insert subscribers" ON public.subscribers
    FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 5. User Profiles and Saved Scenarios
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    locale VARCHAR(5) NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS public.scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    tax_year INT NOT NULL,
    province VARCHAR(4) NOT NULL,
    inputs JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and manage own scenarios" ON public.scenarios
    FOR ALL USING (auth.uid() = user_id);

-- 6. Educators Waitlist Table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email TEXT NOT NULL,
    institution VARCHAR(150) NOT NULL,
    role VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert waitlist" ON public.waitlist
    FOR INSERT WITH CHECK (true);
