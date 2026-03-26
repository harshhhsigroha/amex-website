
-- Audit logging function: captures INSERT/UPDATE/DELETE on key tables
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _event_type text;
  _target_id text;
  _metadata jsonb;
  _actor_id uuid;
  _actor_email text;
BEGIN
  _actor_id := auth.uid();

  -- Get actor email
  SELECT email INTO _actor_email FROM public.profiles WHERE id = _actor_id LIMIT 1;

  -- Build event type
  _event_type := TG_TABLE_NAME || '.' || lower(TG_OP);

  IF TG_OP = 'DELETE' THEN
    _target_id := OLD.id::text;
    _metadata := jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME);
  ELSIF TG_OP = 'INSERT' THEN
    _target_id := NEW.id::text;
    _metadata := jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME);
  ELSE
    _target_id := NEW.id::text;
    _metadata := jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME);
  END IF;

  -- Add contextual metadata based on table
  IF TG_TABLE_NAME = 'timesheets' THEN
    IF TG_OP = 'DELETE' THEN
      _metadata := _metadata || jsonb_build_object('candidate_name', OLD.candidate_name, 'emp_id', OLD.emp_id, 'status', OLD.status, 'total_hours', OLD.total_hours, 'total_amount', OLD.total_amount);
    ELSE
      _metadata := _metadata || jsonb_build_object('candidate_name', NEW.candidate_name, 'emp_id', NEW.emp_id, 'status', NEW.status, 'total_hours', NEW.total_hours, 'total_amount', NEW.total_amount);
      IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        _metadata := _metadata || jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status);
      END IF;
    END IF;
  ELSIF TG_TABLE_NAME = 'invoices' THEN
    IF TG_OP != 'DELETE' THEN
      _metadata := _metadata || jsonb_build_object('invoice_number', NEW.invoice_number, 'grand_total', NEW.grand_total, 'financial_week', NEW.financial_week);
    ELSE
      _metadata := _metadata || jsonb_build_object('invoice_number', OLD.invoice_number, 'grand_total', OLD.grand_total);
    END IF;
  ELSIF TG_TABLE_NAME = 'self_billed_invoices' THEN
    IF TG_OP != 'DELETE' THEN
      _metadata := _metadata || jsonb_build_object('remittance_number', NEW.remittance_number, 'emp_id', NEW.emp_id, 'total_to_pay', NEW.total_to_pay);
    ELSE
      _metadata := _metadata || jsonb_build_object('remittance_number', OLD.remittance_number, 'emp_id', OLD.emp_id);
    END IF;
  ELSIF TG_TABLE_NAME = 'candidates' THEN
    IF TG_OP != 'DELETE' THEN
      _metadata := _metadata || jsonb_build_object('candidate_name', NEW.candidate_name, 'emp_id', NEW.emp_id);
    ELSE
      _metadata := _metadata || jsonb_build_object('candidate_name', OLD.candidate_name, 'emp_id', OLD.emp_id);
    END IF;
  ELSIF TG_TABLE_NAME = 'clients' THEN
    IF TG_OP != 'DELETE' THEN
      _metadata := _metadata || jsonb_build_object('company_name', NEW.company_name);
    ELSE
      _metadata := _metadata || jsonb_build_object('company_name', OLD.company_name);
    END IF;
  ELSIF TG_TABLE_NAME = 'support_tickets' THEN
    IF TG_OP != 'DELETE' THEN
      _metadata := _metadata || jsonb_build_object('ticket_number', NEW.ticket_number, 'subject', NEW.subject, 'status', NEW.status, 'priority', NEW.priority::text);
      IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        _metadata := _metadata || jsonb_build_object('old_status', OLD.status::text, 'new_status', NEW.status::text);
      END IF;
    ELSE
      _metadata := _metadata || jsonb_build_object('ticket_number', OLD.ticket_number, 'subject', OLD.subject);
    END IF;
  ELSIF TG_TABLE_NAME = 'time_logs' THEN
    IF TG_OP != 'DELETE' THEN
      _metadata := _metadata || jsonb_build_object('candidate_name', NEW.candidate_name, 'emp_id', NEW.emp_id, 'total_hours', NEW.total_hours);
    ELSE
      _metadata := _metadata || jsonb_build_object('candidate_name', OLD.candidate_name, 'emp_id', OLD.emp_id);
    END IF;
  ELSIF TG_TABLE_NAME = 'announcements' THEN
    IF TG_OP != 'DELETE' THEN
      _metadata := _metadata || jsonb_build_object('title', NEW.title, 'priority', NEW.priority);
    ELSE
      _metadata := _metadata || jsonb_build_object('title', OLD.title);
    END IF;
  END IF;

  INSERT INTO public.audit_log (event_type, actor_id, actor_email, target_type, target_id, metadata)
  VALUES (_event_type, _actor_id, _actor_email, TG_TABLE_NAME, _target_id, _metadata);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Attach triggers to key tables
CREATE TRIGGER audit_timesheets AFTER INSERT OR UPDATE OR DELETE ON public.timesheets FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_invoices AFTER INSERT OR UPDATE OR DELETE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_self_billed_invoices AFTER INSERT OR UPDATE OR DELETE ON public.self_billed_invoices FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_candidates AFTER INSERT OR UPDATE OR DELETE ON public.candidates FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_clients AFTER INSERT OR UPDATE OR DELETE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_support_tickets AFTER INSERT OR UPDATE OR DELETE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_time_logs AFTER INSERT OR UPDATE OR DELETE ON public.time_logs FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_announcements AFTER INSERT OR UPDATE OR DELETE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
