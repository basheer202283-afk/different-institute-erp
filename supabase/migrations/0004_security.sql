-- ============================================================
-- Different Institute ERP Platform
-- Migration 0004: Security
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Get current user's tenant_id
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Check if current user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(role_slug VARCHAR)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
          AND r.slug = role_slug
          AND ur.is_active = TRUE
          AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
          AND r.deleted_at IS NULL
    );
$$;

-- Check if current user has a specific permission
CREATE OR REPLACE FUNCTION public.has_permission(permission_slug VARCHAR)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON rp.role_id = ur.role_id
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE ur.user_id = auth.uid()
          AND p.slug = permission_slug
          AND ur.is_active = TRUE
          AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
          AND rp.effect = 'allow'
          AND p.deleted_at IS NULL
    ) AND NOT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON rp.role_id = ur.role_id
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE ur.user_id = auth.uid()
          AND p.slug = permission_slug
          AND ur.is_active = TRUE
          AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
          AND rp.effect = 'deny'
          AND p.deleted_at IS NULL
    );
$$;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
          AND r.slug = 'super_admin'
          AND ur.is_active = TRUE
    );
$$;

-- Check if user is tenant admin
CREATE OR REPLACE FUNCTION public.is_tenant_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
          AND r.slug IN ('super_admin', 'tenant_admin')
          AND ur.is_active = TRUE
    );
$$;

-- Check if user belongs to tenant
CREATE OR REPLACE FUNCTION public.user_belongs_to_tenant(target_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND tenant_id = target_tenant_id
          AND deleted_at IS NULL
    );
$$;

-- ============================================================
-- AUDIT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    action_type public.audit_action;
    resource_id_val UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        action_type := 'create';
        new_data := to_jsonb(NEW);
        resource_id_val := NEW.id;
        old_data := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        action_type := 'update';
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        resource_id_val := NEW.id;
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'delete';
        old_data := to_jsonb(OLD);
        new_data := NULL;
        resource_id_val := OLD.id;
    END IF;

    INSERT INTO public.audit_logs (
        tenant_id,
        user_id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values,
        created_at
    ) VALUES (
        COALESCE(
            NEW.tenant_id,
            OLD.tenant_id,
            public.get_user_tenant_id()
        ),
        auth.uid(),
        action_type,
        TG_TABLE_NAME,
        resource_id_val,
        old_data,
        new_data,
        NOW()
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        first_name,
        last_name,
        display_name,
        avatar_url,
        status,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            CONCAT(
                COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
                ' ',
                COALESCE(NEW.raw_user_meta_data->>'last_name', '')
            )
        ),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        'pending',
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- APPLY UPDATED_AT TRIGGERS
-- ============================================================
CREATE TRIGGER set_updated_at_organizations
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_tenants
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_roles
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_permissions
    BEFORE UPDATE ON public.permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_user_roles
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_contacts
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_addresses
    BEFORE UPDATE ON public.addresses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_system_settings
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_notifications
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_announcements
    BEFORE UPDATE ON public.announcements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_calendar_events
    BEFORE UPDATE ON public.calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_calendar_event_attendees
    BEFORE UPDATE ON public.calendar_event_attendees
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_tasks
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_documents
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_messages
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_conversations
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_conversation_participants
    BEFORE UPDATE ON public.conversation_participants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_reports
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

-- ============================================================
-- APPLY AUDIT TRIGGERS
-- ============================================================
CREATE TRIGGER audit_organizations
    AFTER INSERT OR UPDATE OR DELETE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_tenants
    AFTER INSERT OR UPDATE OR DELETE ON public.tenants
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_profiles
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_roles
    AFTER INSERT OR UPDATE OR DELETE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_permissions
    AFTER INSERT OR UPDATE OR DELETE ON public.permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_user_roles
    AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_system_settings
    AFTER INSERT OR UPDATE OR DELETE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_tasks
    AFTER INSERT OR UPDATE OR DELETE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_documents
    AFTER INSERT OR UPDATE OR DELETE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES - ORGANIZATIONS
-- ============================================================
CREATE POLICY "Super admins can view all organizations"
    ON public.organizations FOR SELECT
    TO authenticated
    USING (public.is_super_admin());

CREATE POLICY "Tenant admins can view their organization"
    ON public.organizations FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT t.organization_id
            FROM public.tenants t
            JOIN public.profiles p ON p.tenant_id = t.id
            WHERE p.id = auth.uid()
              AND p.deleted_at IS NULL
        )
    );

CREATE POLICY "Super admins can insert organizations"
    ON public.organizations FOR INSERT
    TO authenticated
    WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admins can update organizations"
    ON public.organizations FOR UPDATE
    TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admins can delete organizations"
    ON public.organizations FOR DELETE
    TO authenticated
    USING (public.is_super_admin());

-- ============================================================
-- RLS POLICIES - TENANTS
-- ============================================================
CREATE POLICY "Super admins can manage all tenants"
    ON public.tenants FOR ALL
    TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

CREATE POLICY "Tenant admins can view their tenant"
    ON public.tenants FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(id));

CREATE POLICY "Tenant admins can update their tenant"
    ON public.tenants FOR UPDATE
    TO authenticated
    USING (public.user_belongs_to_tenant(id) AND public.is_tenant_admin())
    WITH CHECK (public.user_belongs_to_tenant(id));

-- ============================================================
-- RLS POLICIES - PROFILES
-- ============================================================
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Tenant members can view profiles in their tenant"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Tenant admins can update profiles in their tenant"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id) AND public.is_tenant_admin())
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Super admins can manage all profiles"
    ON public.profiles FOR ALL
    TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- ============================================================
-- RLS POLICIES - ROLES
-- ============================================================
CREATE POLICY "Users can view roles in their tenant"
    ON public.roles FOR SELECT
    TO authenticated
    USING (
        tenant_id IS NULL OR
        public.user_belongs_to_tenant(tenant_id)
    );

CREATE POLICY "Tenant admins can manage roles in their tenant"
    ON public.roles FOR ALL
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id) AND public.is_tenant_admin())
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Super admins can manage all roles"
    ON public.roles FOR ALL
    TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- ============================================================
-- RLS POLICIES - PERMISSIONS
-- ============================================================
CREATE POLICY "Users can view permissions in their tenant"
    ON public.permissions FOR SELECT
    TO authenticated
    USING (
        tenant_id IS NULL OR
        public.user_belongs_to_tenant(tenant_id)
    );

CREATE POLICY "Tenant admins can manage permissions in their tenant"
    ON public.permissions FOR ALL
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id) AND public.is_tenant_admin())
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Super admins can manage all permissions"
    ON public.permissions FOR ALL
    TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- ============================================================
-- RLS POLICIES - ROLE_PERMISSIONS
-- ============================================================
CREATE POLICY "Users can view role permissions in their tenant"
    ON public.role_permissions FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Tenant admins can manage role permissions"
    ON public.role_permissions FOR ALL
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id) AND public.is_tenant_admin())
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - USER_ROLES
-- ============================================================
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Tenant admins can view user roles in their tenant"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Tenant admins can manage user roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id) AND public.is_tenant_admin())
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - CONTACTS
-- ============================================================
CREATE POLICY "Tenant members can view contacts in their tenant"
    ON public.contacts FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Tenant members can manage contacts in their tenant"
    ON public.contacts FOR ALL
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id))
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - ADDRESSES
-- ============================================================
CREATE POLICY "Tenant members can view addresses in their tenant"
    ON public.addresses FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Tenant members can manage addresses in their tenant"
    ON public.addresses FOR ALL
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id))
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - AUDIT_LOGS
-- ============================================================
CREATE POLICY "Tenant admins can view audit logs in their tenant"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id) AND public.is_tenant_admin());

CREATE POLICY "Super admins can view all audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.is_super_admin());

CREATE POLICY "System can insert audit logs"
    ON public.audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (TRUE);

-- ============================================================
-- RLS POLICIES - SYSTEM_SETTINGS
-- ============================================================
CREATE POLICY "Tenant members can view public settings"
    ON public.system_settings FOR SELECT
    TO authenticated
    USING (
        (is_public = TRUE AND public.user_belongs_to_tenant(tenant_id))
        OR public.is_tenant_admin()
    );

CREATE POLICY "Tenant admins can manage settings"
    ON public.system_settings FOR ALL
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id) AND public.is_tenant_admin())
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - NOTIFICATIONS
-- ============================================================
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - ANNOUNCEMENTS
-- ============================================================
CREATE POLICY "Tenant members can view published announcements"
    ON public.announcements FOR SELECT
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (is_published = TRUE OR public.is_tenant_admin())
    );

CREATE POLICY "Tenant admins can manage announcements"
    ON public.announcements FOR ALL
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id) AND public.is_tenant_admin())
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - CALENDAR_EVENTS
-- ============================================================
CREATE POLICY "Tenant members can view public calendar events"
    ON public.calendar_events FOR SELECT
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (is_public = TRUE OR organizer_id = auth.uid())
    );

CREATE POLICY "Users can manage their own calendar events"
    ON public.calendar_events FOR ALL
    TO authenticated
    USING (organizer_id = auth.uid())
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Tenant admins can manage all calendar events"
    ON public.calendar_events FOR ALL
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id) AND public.is_tenant_admin())
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - CALENDAR_EVENT_ATTENDEES
-- ============================================================
CREATE POLICY "Users can view attendees of events they can see"
    ON public.calendar_event_attendees FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Event organizers can manage attendees"
    ON public.calendar_event_attendees FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.calendar_events ce
            WHERE ce.id = event_id AND ce.organizer_id = auth.uid()
        )
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - TASKS
-- ============================================================
CREATE POLICY "Users can view tasks assigned to them or created by them"
    ON public.tasks FOR SELECT
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (
            assigned_to = auth.uid()
            OR created_by = auth.uid()
            OR public.is_tenant_admin()
        )
    );

CREATE POLICY "Users can create tasks in their tenant"
    ON public.tasks FOR INSERT
    TO authenticated
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Users can update tasks assigned to them"
    ON public.tasks FOR UPDATE
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (assigned_to = auth.uid() OR created_by = auth.uid() OR public.is_tenant_admin())
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Tenant admins can delete tasks"
    ON public.tasks FOR DELETE
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id) AND public.is_tenant_admin());

-- ============================================================
-- RLS POLICIES - DOCUMENTS
-- ============================================================
CREATE POLICY "Tenant members can view documents in their tenant"
    ON public.documents FOR SELECT
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (is_public = TRUE OR uploaded_by = auth.uid() OR public.is_tenant_admin())
    );

CREATE POLICY "Users can upload documents to their tenant"
    ON public.documents FOR INSERT
    TO authenticated
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Users can update their own documents"
    ON public.documents FOR UPDATE
    TO authenticated
    USING (uploaded_by = auth.uid() OR public.is_tenant_admin())
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - MESSAGES
-- ============================================================
CREATE POLICY "Users can view messages sent to or by them"
    ON public.messages FOR SELECT
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (
            sender_id = auth.uid()
            OR recipient_id = auth.uid()
            OR is_broadcast = TRUE
            OR conversation_id IN (
                SELECT conversation_id FROM public.conversation_participants
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can send messages in their tenant"
    ON public.messages FOR INSERT
    TO authenticated
    WITH CHECK (public.user_belongs_to_tenant(tenant_id) AND sender_id = auth.uid());

-- ============================================================
-- RLS POLICIES - CONVERSATIONS
-- ============================================================
CREATE POLICY "Users can view conversations they participate in"
    ON public.conversations FOR SELECT
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (
            id IN (
                SELECT conversation_id FROM public.conversation_participants
                WHERE user_id = auth.uid()
            )
            OR public.is_tenant_admin()
        )
    );

CREATE POLICY "Users can create conversations in their tenant"
    ON public.conversations FOR INSERT
    TO authenticated
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - CONVERSATION_PARTICIPANTS
-- ============================================================
CREATE POLICY "Users can view participants of their conversations"
    ON public.conversation_participants FOR SELECT
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (
            user_id = auth.uid()
            OR conversation_id IN (
                SELECT conversation_id FROM public.conversation_participants
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can join conversations"
    ON public.conversation_participants FOR INSERT
    TO authenticated
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - REPORTS
-- ============================================================
CREATE POLICY "Tenant members can view reports in their tenant"
    ON public.reports FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Users can create reports in their tenant"
    ON public.reports FOR INSERT
    TO authenticated
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Users can update their own reports"
    ON public.reports FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid() OR public.is_tenant_admin())
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Tenant admins can delete reports"
    ON public.reports FOR DELETE
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id) AND public.is_tenant_admin());

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
