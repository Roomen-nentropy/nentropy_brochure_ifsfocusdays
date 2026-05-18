// ── Integration Types ─────────────────────────────────────────────

export type IntegrationType =
  | 'API_TOKEN'
  | 'SAP'
  | 'DYNAMICS'
  | 'ORACLE'
  | 'CUSTOM';
export type IntegrationStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ERROR';
export type SyncMethod = 'PUSH' | 'PULL' | 'BIDIRECTIONAL';
export type SyncStatus = 'SYNCED' | 'PENDING' | 'ERROR' | 'CONFLICT';
export type EntityType = 'SUPPLIER' | 'PRODUCT' | 'BATCH';
export type SyncAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'FULL_SYNC';
export type SyncLogStatus = 'SUCCESS' | 'ERROR' | 'PARTIAL' | 'IN_PROGRESS';

export interface Integration {
  id: string;
  userId: string;
  name: string;
  type: IntegrationType;
  status: IntegrationStatus;
  config: Record<string, any>;
  syncMethod: SyncMethod;
  syncInterval: number | null;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  fieldMappings: Record<string, any> | null;
  oauthAccessToken?: string;
  oauthRefreshToken?: string;
  oauthExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
  tokens?: IntegrationToken[];
  webhooks?: Webhook[];
}

export interface IntegrationToken {
  id: string;
  integrationId: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  revoked: boolean;
  createdAt: string;
}

export interface SyncLog {
  id: string;
  integrationId: string;
  entityType: EntityType;
  action: SyncAction;
  status: SyncLogStatus;
  recordsAffected: number;
  errorMessage: string | null;
  metadata: Record<string, any> | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
}

export interface Webhook {
  id: string;
  integrationId: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  failureCount: number;
  lastDeliveredAt: string | null;
  createdAt: string;
}

export interface TokenScope {
  scope: string;
  label: string;
  description: string;
}

export interface GeneratedToken {
  token: string;
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  expiresAt: string | null;
  message: string;
}

export interface WebhookTestResult {
  webhookId: string;
  url: string;
  event: string;
  statusCode?: number;
  success: boolean;
  error?: string;
  attemptNumber: number;
  duration: number;
}

export interface SyncResult {
  created: number;
  updated: number;
  errors: number;
}

export interface DynamicsSyncResult {
  success: boolean;
  suppliers: SyncResult;
  products: SyncResult;
}

export interface BCCompany {
  id: string;
  name: string;
  displayName: string;
  businessProfileId?: string;
}
