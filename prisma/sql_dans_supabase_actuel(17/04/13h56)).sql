-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public._ClassModuleToProfessor (
  A text NOT NULL,
  B text NOT NULL,
  CONSTRAINT _ClassModuleToProfessor_pkey PRIMARY KEY (A, B),
  CONSTRAINT _ClassModuleToProfessor_A_fkey FOREIGN KEY (A) REFERENCES public.class_modules(id),
  CONSTRAINT _ClassModuleToProfessor_B_fkey FOREIGN KEY (B) REFERENCES public.professors(id)
);
CREATE TABLE public._prisma_migrations (
  id character varying NOT NULL,
  checksum character varying NOT NULL,
  finished_at timestamp with time zone,
  migration_name character varying NOT NULL,
  logs text,
  rolled_back_at timestamp with time zone,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  applied_steps_count integer NOT NULL DEFAULT 0,
  CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.academic_levels (
  id text NOT NULL,
  name text NOT NULL,
  order integer NOT NULL DEFAULT 0,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT academic_levels_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ai_jobs (
  id text NOT NULL,
  jobType text NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'QUEUED'::"AiJobStatus",
  payload jsonb NOT NULL,
  result jsonb,
  errorMessage text,
  reportId text,
  evaluationId text,
  decisionId text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT ai_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT ai_jobs_reportId_fkey FOREIGN KEY (reportId) REFERENCES public.reports(id),
  CONSTRAINT ai_jobs_evaluationId_fkey FOREIGN KEY (evaluationId) REFERENCES public.evaluations(id),
  CONSTRAINT ai_jobs_decisionId_fkey FOREIGN KEY (decisionId) REFERENCES public.decisions(id)
);
CREATE TABLE public.campuses (
  id text NOT NULL,
  name text NOT NULL,
  location text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT campuses_pkey PRIMARY KEY (id)
);
CREATE TABLE public.class_modules (
  id text NOT NULL,
  classId text NOT NULL,
  moduleId text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT class_modules_pkey PRIMARY KEY (id),
  CONSTRAINT class_modules_classId_fkey FOREIGN KEY (classId) REFERENCES public.classes(id),
  CONSTRAINT class_modules_moduleId_fkey FOREIGN KEY (moduleId) REFERENCES public.modules(id)
);
CREATE TABLE public.classes (
  id text NOT NULL,
  name text NOT NULL,
  campusId text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  levelId text NOT NULL,
  CONSTRAINT classes_pkey PRIMARY KEY (id),
  CONSTRAINT classes_campusId_fkey FOREIGN KEY (campusId) REFERENCES public.campuses(id),
  CONSTRAINT classes_levelId_fkey FOREIGN KEY (levelId) REFERENCES public.academic_levels(id)
);
CREATE TABLE public.decisions (
  id text NOT NULL,
  evaluationId text NOT NULL,
  deciderId text NOT NULL,
  title text NOT NULL,
  rationale text,
  status USER-DEFINED NOT NULL DEFAULT 'PENDING'::"DecisionStatus",
  priority USER-DEFINED NOT NULL DEFAULT 'MEDIUM'::"Priority",
  responsible text,
  dueDate timestamp without time zone,
  aiSuggestion text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT decisions_pkey PRIMARY KEY (id),
  CONSTRAINT decisions_evaluationId_fkey FOREIGN KEY (evaluationId) REFERENCES public.evaluations(id),
  CONSTRAINT decisions_deciderId_fkey FOREIGN KEY (deciderId) REFERENCES public.users(id)
);
CREATE TABLE public.evaluation_campaigns (
  id text NOT NULL,
  title text NOT NULL,
  description text,
  classId text,
  moduleId text NOT NULL,
  professorId text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT'::text,
  dueDate timestamp without time zone NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  scope text NOT NULL DEFAULT 'CLASS'::text,
  campusId text,
  CONSTRAINT evaluation_campaigns_pkey PRIMARY KEY (id),
  CONSTRAINT evaluation_campaigns_moduleId_fkey FOREIGN KEY (moduleId) REFERENCES public.modules(id),
  CONSTRAINT evaluation_campaigns_professorId_fkey FOREIGN KEY (professorId) REFERENCES public.professors(id),
  CONSTRAINT evaluation_campaigns_campusId_fkey FOREIGN KEY (campusId) REFERENCES public.campuses(id),
  CONSTRAINT evaluation_campaigns_classId_fkey FOREIGN KEY (classId) REFERENCES public.classes(id)
);
CREATE TABLE public.evaluations (
  id text NOT NULL,
  reportId text,
  evaluatorId text,
  professorId text NOT NULL,
  moduleId text NOT NULL,
  classId text NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'PENDING'::"EvaluationStatus",
  isAnonymous boolean NOT NULL DEFAULT false,
  score double precision,
  comment text,
  aiScore double precision,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  campaignId text,
  availabilityRating USER-DEFINED,
  comprehensionRating USER-DEFINED,
  explanationRating USER-DEFINED,
  pedagogyRating USER-DEFINED,
  rhythmRating USER-DEFINED,
  CONSTRAINT evaluations_pkey PRIMARY KEY (id),
  CONSTRAINT evaluations_reportId_fkey FOREIGN KEY (reportId) REFERENCES public.reports(id),
  CONSTRAINT evaluations_evaluatorId_fkey FOREIGN KEY (evaluatorId) REFERENCES public.users(id),
  CONSTRAINT evaluations_professorId_fkey FOREIGN KEY (professorId) REFERENCES public.professors(id),
  CONSTRAINT evaluations_moduleId_fkey FOREIGN KEY (moduleId) REFERENCES public.modules(id),
  CONSTRAINT evaluations_classId_fkey FOREIGN KEY (classId) REFERENCES public.classes(id),
  CONSTRAINT evaluations_campaignId_fkey FOREIGN KEY (campaignId) REFERENCES public.evaluation_campaigns(id)
);
CREATE TABLE public.login_otp_challenges (
  id text NOT NULL,
  userId text NOT NULL,
  otpHash text NOT NULL,
  expiresAt timestamp without time zone NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT login_otp_challenges_pkey PRIMARY KEY (id),
  CONSTRAINT login_otp_challenges_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id)
);
CREATE TABLE public.modules (
  id text NOT NULL,
  name text NOT NULL,
  code text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT modules_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notifications (
  id text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  userId text,
  isRead boolean NOT NULL DEFAULT false,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  campaignId text,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id),
  CONSTRAINT notifications_campaignId_fkey FOREIGN KEY (campaignId) REFERENCES public.evaluation_campaigns(id)
);
CREATE TABLE public.password_reset_tokens (
  id text NOT NULL,
  userId text NOT NULL,
  tokenHash text NOT NULL,
  expiresAt timestamp without time zone NOT NULL,
  usedAt timestamp without time zone,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT password_reset_tokens_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id)
);
CREATE TABLE public.professors (
  id text NOT NULL,
  firstName text NOT NULL,
  lastName text NOT NULL,
  email text NOT NULL,
  userId text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  campusId text,
  CONSTRAINT professors_pkey PRIMARY KEY (id),
  CONSTRAINT professors_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id),
  CONSTRAINT professors_campusId_fkey FOREIGN KEY (campusId) REFERENCES public.campuses(id)
);
CREATE TABLE public.refresh_tokens (
  id text NOT NULL,
  token text NOT NULL,
  userId text NOT NULL,
  expiresAt timestamp without time zone NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT refresh_tokens_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id)
);
CREATE TABLE public.reports (
  id text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  type USER-DEFINED NOT NULL DEFAULT 'OTHER'::"ReportType",
  priority USER-DEFINED NOT NULL DEFAULT 'MEDIUM'::"Priority",
  status USER-DEFINED NOT NULL DEFAULT 'DRAFT'::"ReportStatus",
  isAnonymous boolean NOT NULL DEFAULT false,
  category text,
  authorId text,
  classId text,
  professorId text,
  moduleId text,
  attachments jsonb,
  aiAnalysis jsonb,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  deviceMetadata jsonb,
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_authorId_fkey FOREIGN KEY (authorId) REFERENCES public.users(id),
  CONSTRAINT reports_classId_fkey FOREIGN KEY (classId) REFERENCES public.classes(id),
  CONSTRAINT reports_professorId_fkey FOREIGN KEY (professorId) REFERENCES public.professors(id),
  CONSTRAINT reports_moduleId_fkey FOREIGN KEY (moduleId) REFERENCES public.modules(id)
);
CREATE TABLE public.system_settings (
  id text NOT NULL,
  schoolName text NOT NULL DEFAULT 'AFI'::text,
  authReportsRequired boolean NOT NULL DEFAULT false,
  authEvaluationsRequired boolean NOT NULL DEFAULT false,
  aiEnabled boolean NOT NULL DEFAULT true,
  updatedAt timestamp without time zone NOT NULL,
  aiConfigs jsonb NOT NULL DEFAULT '[]'::jsonb,
  aiOverrideConfigId text,
  authOtpRequired boolean NOT NULL DEFAULT false,
  CONSTRAINT system_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id text NOT NULL,
  email text NOT NULL,
  passwordHash text NOT NULL,
  firstName text NOT NULL,
  lastName text NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'STUDENT'::"Role",
  isActive boolean NOT NULL DEFAULT true,
  campusId text,
  classId text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  matricule text,
  emailVerified boolean NOT NULL DEFAULT true,
  emailVerifiedAt timestamp without time zone,
  fcmToken text,
  schoolId text,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_campusId_fkey FOREIGN KEY (campusId) REFERENCES public.campuses(id),
  CONSTRAINT users_classId_fkey FOREIGN KEY (classId) REFERENCES public.classes(id)
);