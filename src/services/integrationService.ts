import { api } from './index';
import type {
  Integration,
  IntegrationToken,
  SyncLog,
  Webhook,
  GeneratedToken,
  WebhookTestResult,
  DynamicsSyncResult,
  BCCompany,
} from '../types/integration.types';

// ── Integration CRUD ──────────────────────────────────────────────

export const integrationService = {
  async list(): Promise<Integration[]> {
    const { data } = await api.get<Integration[]>('/api/integrations');
    return data;
  },

  async create(payload: {
    name: string;
    type: string;
    config?: Record<string, any>;
    syncMethod?: string;
    syncInterval?: number | null;
  }): Promise<Integration> {
    const { data } = await api.post<Integration>('/api/integrations', payload);
    return data;
  },

  async getById(id: string): Promise<Integration> {
    const { data } = await api.get<Integration>(`/api/integrations/${id}`);
    return data;
  },

  async update(
    id: string,
    payload: Partial<Integration>
  ): Promise<Integration> {
    const { data } = await api.put<Integration>(
      `/api/integrations/${id}`,
      payload
    );
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/integrations/${id}`);
  },

  // ── Token Management ──────────────────────────────────────────

  async listTokens(integrationId: string): Promise<IntegrationToken[]> {
    const { data } = await api.get<IntegrationToken[]>(
      `/api/integrations/${integrationId}/tokens`
    );
    return data;
  },

  async generateToken(
    integrationId: string,
    payload: { name: string; scopes: string[]; expiresInDays?: number | null }
  ): Promise<GeneratedToken> {
    const { data } = await api.post<GeneratedToken>(
      `/api/integrations/${integrationId}/tokens`,
      payload
    );
    return data;
  },

  async revokeToken(integrationId: string, tokenId: string): Promise<void> {
    await api.patch(
      `/api/integrations/${integrationId}/tokens/${tokenId}/revoke`
    );
  },

  async deleteToken(integrationId: string, tokenId: string): Promise<void> {
    await api.delete(`/api/integrations/${integrationId}/tokens/${tokenId}`);
  },

  // ── Webhook Management ────────────────────────────────────────

  async listWebhooks(integrationId: string): Promise<Webhook[]> {
    const { data } = await api.get<Webhook[]>(
      `/api/integrations/${integrationId}/webhooks`
    );
    return data;
  },

  async createWebhook(
    integrationId: string,
    payload: { url: string; events: string[] }
  ): Promise<Webhook> {
    const { data } = await api.post<Webhook>(
      `/api/integrations/${integrationId}/webhooks`,
      payload
    );
    return data;
  },

  async testWebhook(
    integrationId: string,
    webhookId: string
  ): Promise<WebhookTestResult> {
    const { data } = await api.post<WebhookTestResult>(
      `/api/integrations/${integrationId}/webhooks/${webhookId}/test`
    );
    return data;
  },

  async deleteWebhook(integrationId: string, webhookId: string): Promise<void> {
    await api.delete(
      `/api/integrations/${integrationId}/webhooks/${webhookId}`
    );
  },

  // ── Sync Logs ─────────────────────────────────────────────────

  async getSyncLogs(
    integrationId: string,
    params?: {
      page?: number;
      limit?: number;
      entityType?: string;
      status?: string;
    }
  ): Promise<{
    data: SyncLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.entityType) query.append('entityType', params.entityType);
    if (params?.status) query.append('status', params.status);

    const { data } = await api.get(
      `/api/integrations/${integrationId}/sync-logs?${query.toString()}`
    );
    return data;
  },

  // ── Field Mappings ────────────────────────────────────────────

  async getFieldMappings(integrationId: string): Promise<Record<string, any>> {
    const { data } = await api.get(
      `/api/integrations/${integrationId}/field-mappings`
    );
    return data;
  },

  async updateFieldMappings(
    integrationId: string,
    mappings: Record<string, any>
  ): Promise<Record<string, any>> {
    const { data } = await api.put(
      `/api/integrations/${integrationId}/field-mappings`,
      mappings
    );
    return data;
  },

  // ── Dynamics BC ───────────────────────────────────────────────

  async getDynamicsAuthUrl(
    integrationId: string
  ): Promise<{ authorizationUrl: string }> {
    const { data } = await api.get<{ authorizationUrl: string }>(
      `/api/integrations/${integrationId}/dynamics/auth-url`
    );
    return data;
  },

  async listDynamicsCompanies(integrationId: string): Promise<BCCompany[]> {
    const { data } = await api.get<BCCompany[]>(
      `/api/integrations/${integrationId}/dynamics/companies`
    );
    return data;
  },

  async triggerDynamicsSync(
    integrationId: string,
    options?: { modifiedSince?: string }
  ): Promise<DynamicsSyncResult> {
    const { data } = await api.post<DynamicsSyncResult>(
      `/api/integrations/${integrationId}/dynamics/sync`,
      options || {}
    );
    return data;
  },

  async testDynamicsConnection(
    integrationId: string
  ): Promise<{ success: boolean; companies?: BCCompany[]; error?: string }> {
    const { data } = await api.post(
      `/api/integrations/${integrationId}/dynamics/test`
    );
    return data;
  },

  // ── Available Scopes ──────────────────────────────────────────

  async getAvailableScopes(): Promise<
    Array<{ scope: string; label: string; description: string }>
  > {
    const { data } = await api.get('/api/integrations/available-scopes');
    return data;
  },
};
