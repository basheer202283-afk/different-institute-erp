-- ============================================================
-- Different Institute ERP Platform
-- Migration 0003: Core Platform
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

-- ============================================================
-- ORGANIZATIONS TABLE
-- ============================================================
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    legal_name VARCHAR(255),
    registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(500),
    logo_url VARCHAR(500),
    status public.org_status NOT NULL DEFAULT 'active',
    subscription_plan public.subscription_plan NOT NULL DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- ============================================================
-- TENANTS TABLE
-- ============================================================
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    domain VARCHAR(255),
    logo_url VARCHAR(500),
    favicon_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#3B82F6',
    secondary_color VARCHAR(7) DEFAULT '#1E40AF',
    status public.tenant_status NOT NULL DEFAULT 'pending_setup',
    subscription_plan public.subscription_plan NOT NULL DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    max_users INTEGER DEFAULT 10,
    max_students INTEGER DEFAULT 100,
    max_storage_mb INTEGER DEFAULT 1024,
    timezone VARCHAR(50) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'en',
    currency VARCHAR(3) DEFAULT 'USD',
    date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(organization_id, slug)
);

-- ============================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(200),
    avatar_url VARCHAR(500),
    date_of_birth DATE,
    gender public.gender_type,
    bio TEXT,
    locale VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    status public.user_status NOT NULL DEFAULT 'pending',
    last_login_at TIMESTAMPTZ,
    last_active_at TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    preferences JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- ============================================================
-- ROLES TABLE
-- ============================================================
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    level INTEGER DEFAULT 0,
    color VARCHAR(7),
    icon VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, slug)
);

-- ============================================================
-- PERMISSIONS TABLE
-- ============================================================
CREATE TABLE public.permissions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(100),
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    effect public.permission_effect NOT NULL DEFAULT 'allow',
    conditions JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, slug)
);

-- ============================================================
-- ROLE_PERMISSIONS TABLE
-- ============================================================
CREATE TABLE public.role_permissions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    effect public.permission_effect NOT NULL DEFAULT 'allow',
    conditions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    UNIQUE(role_id, permission_id)
);

-- ============================================================
-- USER_ROLES TABLE
-- ============================================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    UNIQUE(user_id, role_id)
);

-- ============================================================
-- CONTACTS TABLE
-- ============================================================
CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    contactable_type VARCHAR(50),
    contactable_id UUID,
    contact_type public.contact_type NOT NULL DEFAULT 'email',
    value VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    label VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- ============================================================
-- ADDRESSES TABLE
-- ============================================================
CREATE TABLE public.addresses (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    addressable_type VARCHAR(50),
    addressable_id UUID,
    address_type public.address_type NOT NULL DEFAULT 'home',
    line1 VARCHAR(255),
    line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(2) DEFAULT 'US',
    is_primary BOOLEAN DEFAULT FALSE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- ============================================================
-- AUDIT_LOGS TABLE
-- ============================================================
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action public.audit_action NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SYSTEM_SETTINGS TABLE
-- ============================================================
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    key VARCHAR(200) NOT NULL,
    value TEXT,
    value_type public.setting_type NOT NULL DEFAULT 'string',
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    is_encrypted BOOLEAN DEFAULT FALSE,
    validation_rules JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, key)
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type public.notification_type NOT NULL DEFAULT 'info',
    channel public.notification_channel NOT NULL DEFAULT 'in_app',
    title VARCHAR(500) NOT NULL,
    body TEXT,
    data JSONB DEFAULT '{}',
    read_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    action_label VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID
);

-- ============================================================
-- ANNOUNCEMENTS TABLE
-- ============================================================
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type public.announcement_type NOT NULL DEFAULT 'general',
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    summary VARCHAR(1000),
    image_url VARCHAR(500),
    is_pinned BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    target_roles TEXT[],
    target_users UUID[],
    view_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- ============================================================
-- CALENDAR_EVENTS TABLE
-- ============================================================
CREATE TABLE public.calendar_events (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type public.calendar_event_type NOT NULL DEFAULT 'other',
    title VARCHAR(500) NOT NULL,
    description TEXT,
    location VARCHAR(500),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,
    recurrence public.recurrence_pattern DEFAULT 'none',
    recurrence_end_date DATE,
    color VARCHAR(7),
    is_public BOOLEAN DEFAULT TRUE,
    max_attendees INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- ============================================================
-- CALENDAR_EVENT_ATTENDEES TABLE
-- ============================================================
CREATE TABLE public.calendar_event_attendees (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    response_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- ============================================================
-- TASKS TABLE
-- ============================================================
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    parent_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status public.task_status NOT NULL DEFAULT 'todo',
    priority public.task_priority NOT NULL DEFAULT 'medium',
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    estimated_hours DECIMAL(10, 2),
    actual_hours DECIMAL(10, 2),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    tags TEXT[],
    attachments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- ============================================================
-- DOCUMENTS TABLE
-- ============================================================
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    documentable_type VARCHAR(50),
    documentable_id UUID,
    type public.document_type NOT NULL DEFAULT 'other',
    name VARCHAR(500) NOT NULL,
    description TEXT,
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    version INTEGER DEFAULT 1,
    is_public BOOLEAN DEFAULT FALSE,
    is_encrypted BOOLEAN DEFAULT FALSE,
    checksum VARCHAR(64),
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    conversation_id UUID,
    parent_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    subject VARCHAR(500),
    body TEXT NOT NULL,
    status public.message_status NOT NULL DEFAULT 'sent',
    is_broadcast BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    attachments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID
);

-- ============================================================
-- CONVERSATIONS TABLE
-- ============================================================
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title VARCHAR(500),
    type VARCHAR(20) DEFAULT 'direct',
    last_message_at TIMESTAMPTZ,
    last_message_preview VARCHAR(200),
    is_archived BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID
);

-- ============================================================
-- CONVERSATION_PARTICIPANTS TABLE
-- ============================================================
CREATE TABLE public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- ============================================================
-- REPORTS TABLE
-- ============================================================
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type public.report_type NOT NULL,
    format public.report_format NOT NULL DEFAULT 'pdf',
    query_config JSONB NOT NULL DEFAULT '{}',
    filters JSONB DEFAULT '{}',
    schedule JSONB,
    is_scheduled BOOLEAN DEFAULT FALSE,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    file_path VARCHAR(1000),
    file_size BIGINT,
    run_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- ============================================================
-- INDEXES FOR CORE PLATFORM
-- ============================================================

-- Organizations indexes
CREATE INDEX idx_organizations_slug ON public.organizations(slug);
CREATE INDEX idx_organizations_status ON public.organizations(status);
CREATE INDEX idx_organizations_deleted_at ON public.organizations(deleted_at) WHERE deleted_at IS NULL;

-- Tenants indexes
CREATE INDEX idx_tenants_organization_id ON public.tenants(organization_id);
CREATE INDEX idx_tenants_slug ON public.tenants(slug);
CREATE INDEX idx_tenants_status ON public.tenants(status);
CREATE INDEX idx_tenants_domain ON public.tenants(domain);
CREATE INDEX idx_tenants_deleted_at ON public.tenants(deleted_at) WHERE deleted_at IS NULL;

-- Profiles indexes
CREATE INDEX idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_email ON public.profiles(id);
CREATE INDEX idx_profiles_deleted_at ON public.profiles(deleted_at) WHERE deleted_at IS NULL;

-- Roles indexes
CREATE INDEX idx_roles_tenant_id ON public.roles(tenant_id);
CREATE INDEX idx_roles_slug ON public.roles(slug);
CREATE INDEX idx_roles_is_system ON public.roles(is_system);
CREATE INDEX idx_roles_deleted_at ON public.roles(deleted_at) WHERE deleted_at IS NULL;

-- Permissions indexes
CREATE INDEX idx_permissions_tenant_id ON public.permissions(tenant_id);
CREATE INDEX idx_permissions_slug ON public.permissions(slug);
CREATE INDEX idx_permissions_module ON public.permissions(module);
CREATE INDEX idx_permissions_action ON public.permissions(action);
CREATE INDEX idx_permissions_deleted_at ON public.permissions(deleted_at) WHERE deleted_at IS NULL;

-- Role permissions indexes
CREATE INDEX idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX idx_role_permissions_tenant_id ON public.role_permissions(tenant_id);

-- User roles indexes
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX idx_user_roles_tenant_id ON public.user_roles(tenant_id);
CREATE INDEX idx_user_roles_is_active ON public.user_roles(is_active);

-- Contacts indexes
CREATE INDEX idx_contacts_tenant_id ON public.contacts(tenant_id);
CREATE INDEX idx_contacts_contactable ON public.contacts(contactable_type, contactable_id);
CREATE INDEX idx_contacts_type ON public.contacts(contact_type);
CREATE INDEX idx_contacts_value ON public.contacts(value);
CREATE INDEX idx_contacts_deleted_at ON public.contacts(deleted_at) WHERE deleted_at IS NULL;

-- Addresses indexes
CREATE INDEX idx_addresses_tenant_id ON public.addresses(tenant_id);
CREATE INDEX idx_addresses_addressable ON public.addresses(addressable_type, addressable_id);
CREATE INDEX idx_addresses_type ON public.addresses(address_type);
CREATE INDEX idx_addresses_deleted_at ON public.addresses(deleted_at) WHERE deleted_at IS NULL;

-- Audit logs indexes
CREATE INDEX idx_audit_logs_tenant_id ON public.audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- System settings indexes
CREATE INDEX idx_system_settings_tenant_id ON public.system_settings(tenant_id);
CREATE INDEX idx_system_settings_key ON public.system_settings(key);
CREATE INDEX idx_system_settings_category ON public.system_settings(category);
CREATE INDEX idx_system_settings_deleted_at ON public.system_settings(deleted_at) WHERE deleted_at IS NULL;

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_tenant_id ON public.notifications(tenant_id);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX idx_notifications_deleted_at ON public.notifications(deleted_at) WHERE deleted_at IS NULL;

-- Announcements indexes
CREATE INDEX idx_announcements_tenant_id ON public.announcements(tenant_id);
CREATE INDEX idx_announcements_author_id ON public.announcements(author_id);
CREATE INDEX idx_announcements_type ON public.announcements(type);
CREATE INDEX idx_announcements_is_published ON public.announcements(is_published);
CREATE INDEX idx_announcements_published_at ON public.announcements(published_at);
CREATE INDEX idx_announcements_deleted_at ON public.announcements(deleted_at) WHERE deleted_at IS NULL;

-- Calendar events indexes
CREATE INDEX idx_calendar_events_tenant_id ON public.calendar_events(tenant_id);
CREATE INDEX idx_calendar_events_organizer_id ON public.calendar_events(organizer_id);
CREATE INDEX idx_calendar_events_type ON public.calendar_events(type);
CREATE INDEX idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX idx_calendar_events_end_time ON public.calendar_events(end_time);
CREATE INDEX idx_calendar_events_deleted_at ON public.calendar_events(deleted_at) WHERE deleted_at IS NULL;

-- Calendar event attendees indexes
CREATE INDEX idx_calendar_event_attendees_event_id ON public.calendar_event_attendees(event_id);
CREATE INDEX idx_calendar_event_attendees_user_id ON public.calendar_event_attendees(user_id);

-- Tasks indexes
CREATE INDEX idx_tasks_tenant_id ON public.tasks(tenant_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_assigned_by ON public.tasks(assigned_by);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_parent_task_id ON public.tasks(parent_task_id);
CREATE INDEX idx_tasks_deleted_at ON public.tasks(deleted_at) WHERE deleted_at IS NULL;

-- Documents indexes
CREATE INDEX idx_documents_tenant_id ON public.documents(tenant_id);
CREATE INDEX idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX idx_documents_documentable ON public.documents(documentable_type, documentable_id);
CREATE INDEX idx_documents_type ON public.documents(type);
CREATE INDEX idx_documents_deleted_at ON public.documents(deleted_at) WHERE deleted_at IS NULL;

-- Messages indexes
CREATE INDEX idx_messages_tenant_id ON public.messages(tenant_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_messages_deleted_at ON public.messages(deleted_at) WHERE deleted_at IS NULL;

-- Conversations indexes
CREATE INDEX idx_conversations_tenant_id ON public.conversations(tenant_id);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at);
CREATE INDEX idx_conversations_deleted_at ON public.conversations(deleted_at) WHERE deleted_at IS NULL;

-- Conversation participants indexes
CREATE INDEX idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON public.conversation_participants(user_id);

-- Reports indexes
CREATE INDEX idx_reports_tenant_id ON public.reports(tenant_id);
CREATE INDEX idx_reports_created_by ON public.reports(created_by);
CREATE INDEX idx_reports_type ON public.reports(type);
CREATE INDEX idx_reports_deleted_at ON public.reports(deleted_at) WHERE deleted_at IS NULL;
