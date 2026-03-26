CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: candidates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.candidates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    emp_id text NOT NULL,
    candidate_name text NOT NULL,
    address text,
    agency text,
    beneficiary_name text,
    account_number text,
    sort_code text,
    bank_name text,
    ni_number text,
    gender text,
    dob text,
    contact_no text,
    email text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    internal_name text,
    has_candidate_id boolean DEFAULT false,
    application boolean DEFAULT false,
    proof_of_address boolean DEFAULT false,
    right_to_work boolean DEFAULT false
);


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_name text NOT NULL,
    address_line_1 text NOT NULL,
    address_line_2 text,
    city text NOT NULL,
    postcode text NOT NULL,
    country text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    invoice_number text NOT NULL,
    invoice_date date NOT NULL,
    financial_year text NOT NULL,
    financial_week integer NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    total_gross numeric(12,2) NOT NULL,
    total_vat numeric(12,2) NOT NULL,
    grand_total numeric(12,2) NOT NULL,
    total_contractors integer NOT NULL,
    pdf_filename text NOT NULL,
    client_snapshot jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: self_billed_invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.self_billed_invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    emp_id text NOT NULL,
    candidate_snapshot jsonb NOT NULL,
    remittance_number text NOT NULL,
    payment_date date NOT NULL,
    financial_year text NOT NULL,
    financial_week integer NOT NULL,
    net_total numeric NOT NULL,
    deductions numeric DEFAULT 0 NOT NULL,
    total_to_pay numeric NOT NULL,
    line_items jsonb NOT NULL,
    pdf_filename text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: candidates candidates_emp_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_emp_id_key UNIQUE (emp_id);


--
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- Name: clients clients_company_name_postcode_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_company_name_postcode_key UNIQUE (company_name, postcode);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: self_billed_invoices self_billed_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.self_billed_invoices
    ADD CONSTRAINT self_billed_invoices_pkey PRIMARY KEY (id);


--
-- Name: self_billed_invoices self_billed_invoices_remittance_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.self_billed_invoices
    ADD CONSTRAINT self_billed_invoices_remittance_number_key UNIQUE (remittance_number);


--
-- Name: idx_candidates_name_account; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_candidates_name_account ON public.candidates USING btree (candidate_name, account_number);


--
-- Name: candidates update_candidates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON public.candidates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: clients update_clients_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: invoices invoices_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE RESTRICT;


--
-- Name: candidates Allow public delete candidates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public delete candidates" ON public.candidates FOR DELETE USING (true);


--
-- Name: candidates Allow public insert candidates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert candidates" ON public.candidates FOR INSERT WITH CHECK (true);


--
-- Name: clients Allow public insert clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert clients" ON public.clients FOR INSERT WITH CHECK (true);


--
-- Name: invoices Allow public insert invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert invoices" ON public.invoices FOR INSERT WITH CHECK (true);


--
-- Name: self_billed_invoices Allow public insert self_billed_invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert self_billed_invoices" ON public.self_billed_invoices FOR INSERT WITH CHECK (true);


--
-- Name: candidates Allow public read candidates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read candidates" ON public.candidates FOR SELECT USING (true);


--
-- Name: clients Allow public read clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read clients" ON public.clients FOR SELECT USING (true);


--
-- Name: invoices Allow public read invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read invoices" ON public.invoices FOR SELECT USING (true);


--
-- Name: self_billed_invoices Allow public read self_billed_invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read self_billed_invoices" ON public.self_billed_invoices FOR SELECT USING (true);


--
-- Name: candidates Allow public update candidates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update candidates" ON public.candidates FOR UPDATE USING (true);


--
-- Name: clients Allow public update clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update clients" ON public.clients FOR UPDATE USING (true);


--
-- Name: candidates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

--
-- Name: clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

--
-- Name: invoices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

--
-- Name: self_billed_invoices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.self_billed_invoices ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


