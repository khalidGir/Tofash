-- ============================================================
-- TOFASH — AUTH TRIGGERS
-- Run this AFTER enabling phone auth in Supabase Dashboard
-- ============================================================

-- Handle new user signup: create profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, full_name, role)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer')::public.user_role
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Handle user deletion: clean up profile (cascades to other tables)
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-- ============================================================
-- ADMIN FUNCTION: Approve seller application
-- Call this from Edge Function or admin panel
-- ============================================================
CREATE OR REPLACE FUNCTION public.approve_seller_application(
  p_application_id UUID,
  p_admin_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_store_id UUID;
  v_application RECORD;
BEGIN
  -- Get application
  SELECT * INTO v_application
  FROM public.seller_applications
  WHERE id = p_application_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found or already processed';
  END IF;

  v_user_id := v_application.user_id;

  -- 1. Update application status
  UPDATE public.seller_applications
  SET status = 'approved',
      reviewed_by = p_admin_id,
      reviewed_at = now()
  WHERE id = p_application_id;

  -- 2. Create store
  INSERT INTO public.stores (seller_id, name, slug, description, phone, location, is_active)
  VALUES (
    v_user_id,
    v_application.store_name,
    lower(regexp_replace(v_application.store_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(md5(random()::text), 1, 6),
    NULL,
    v_application.phone,
    v_application.location,
    true
  )
  RETURNING id INTO v_store_id;

  -- 3. Update user role to seller
  UPDATE public.profiles
  SET role = 'seller'
  WHERE id = v_user_id;

  -- 4. Audit log
  INSERT INTO public.admin_audit_logs (admin_id, action, entity_type, entity_id, new_data)
  VALUES (
    p_admin_id,
    'approve_seller',
    'seller_application',
    p_application_id,
    jsonb_build_object('store_id', v_store_id, 'user_id', v_user_id)
  );
END;
$$;

-- ============================================================
-- ADMIN FUNCTION: Reject seller application
-- ============================================================
CREATE OR REPLACE FUNCTION public.reject_seller_application(
  p_application_id UUID,
  p_admin_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.seller_applications
  SET status = 'rejected',
      reviewed_by = p_admin_id,
      reviewed_at = now(),
      review_notes = p_reason
  WHERE id = p_application_id AND status = 'pending';

  INSERT INTO public.admin_audit_logs (admin_id, action, entity_type, entity_id, new_data)
  VALUES (p_admin_id, 'reject_seller', 'seller_application', p_application_id,
    jsonb_build_object('reason', p_reason));
END;
$$;

-- ============================================================
-- ADMIN FUNCTION: Suspend seller
-- ============================================================
CREATE OR REPLACE FUNCTION public.suspend_seller(
  p_seller_id UUID,
  p_admin_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Deactivate store
  UPDATE public.stores SET is_active = false WHERE seller_id = p_seller_id;

  -- Update profile
  UPDATE public.profiles SET is_active = false WHERE id = p_seller_id;

  -- Audit
  INSERT INTO public.admin_audit_logs (admin_id, action, entity_type, entity_id)
  VALUES (p_admin_id, 'suspend_seller', 'profile', p_seller_id);
END;
$$;
