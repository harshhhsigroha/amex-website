-- Create role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is any admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin')
  )
$$;

-- Create trigger for profiles on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updating profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Update existing tables RLS to require admin access
-- Clients table
DROP POLICY IF EXISTS "Allow public read clients" ON public.clients;
DROP POLICY IF EXISTS "Allow public insert clients" ON public.clients;
DROP POLICY IF EXISTS "Allow public update clients" ON public.clients;

CREATE POLICY "Admins can read clients"
  ON public.clients FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert clients"
  ON public.clients FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update clients"
  ON public.clients FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete clients"
  ON public.clients FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Candidates table
DROP POLICY IF EXISTS "Allow public read candidates" ON public.candidates;
DROP POLICY IF EXISTS "Allow public insert candidates" ON public.candidates;
DROP POLICY IF EXISTS "Allow public update candidates" ON public.candidates;
DROP POLICY IF EXISTS "Allow public delete candidates" ON public.candidates;

CREATE POLICY "Admins can read candidates"
  ON public.candidates FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert candidates"
  ON public.candidates FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update candidates"
  ON public.candidates FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete candidates"
  ON public.candidates FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Invoices table
DROP POLICY IF EXISTS "Allow public read invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow public insert invoices" ON public.invoices;

CREATE POLICY "Admins can read invoices"
  ON public.invoices FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- Self-billed invoices table
DROP POLICY IF EXISTS "Allow public read self_billed_invoices" ON public.self_billed_invoices;
DROP POLICY IF EXISTS "Allow public insert self_billed_invoices" ON public.self_billed_invoices;

CREATE POLICY "Admins can read self_billed_invoices"
  ON public.self_billed_invoices FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert self_billed_invoices"
  ON public.self_billed_invoices FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));