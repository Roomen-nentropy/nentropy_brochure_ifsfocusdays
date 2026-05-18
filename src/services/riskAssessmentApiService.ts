import type {
  RiskAssessment,
  RiskAssessmentAttachment,
  CreateRiskAssessmentRequest,
  UpdateRiskAssessmentRequest,
  RiskAssessmentPrefillResponse,
  RiskAssessmentVersionComparison,
  CreateVersionRequest,
  SurveyDocumentsResponse,
} from '../types';
import { api } from '.';

const BASE_URL = '/api/risk-assessments';

export const riskAssessmentApiService = {
  getAll: async (): Promise<RiskAssessment[]> => {
    const response = await api.get<RiskAssessment[]>(BASE_URL);
    return response.data;
  },

  getBySupplier: async (supplierId: string): Promise<RiskAssessment[]> => {
    const response = await api.get<RiskAssessment[]>(
      `${BASE_URL}/supplier/${supplierId}`
    );
    return response.data;
  },

  getById: async (id: string): Promise<RiskAssessment> => {
    const response = await api.get<RiskAssessment>(`${BASE_URL}/${id}`);

    return response.data;
  },

  create: async (
    data: CreateRiskAssessmentRequest
  ): Promise<RiskAssessment> => {
    const response = await api.post<RiskAssessment>(BASE_URL, data);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateRiskAssessmentRequest
  ): Promise<RiskAssessment> => {
    const response = await api.put<RiskAssessment>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },

  getPrefillData: async (
    supplierId: string,
    type: 'EU_SUPPLIER' | 'NON_EU_SUPPLIER'
  ): Promise<RiskAssessmentPrefillResponse> => {
    const response = await api.get<RiskAssessmentPrefillResponse>(
      `${BASE_URL}/prefill/${supplierId}?type=${type}`
    );
    return response.data;
  },

  calculateRisk: async (
    id: string
  ): Promise<{
    riskScore: number;
    riskLevel: string;
    riskBreakdown: Record<string, number>;
  }> => {
    const response = await api.post<{
      riskScore: number;
      riskLevel: string;
      riskBreakdown: Record<string, number>;
    }>(`${BASE_URL}/${id}/calculate-risk`);
    return response.data;
  },

  submitForReview: async (id: string): Promise<RiskAssessment> => {
    const response = await api.post<RiskAssessment>(`${BASE_URL}/${id}/submit`);
    return response.data;
  },

  updateStatus: async (
    id: string,
    status: 'APPROVED' | 'REJECTED',
    comment?: string
  ): Promise<RiskAssessment> => {
    const response = await api.post<RiskAssessment>(
      `${BASE_URL}/${id}/status`,
      { status, comment }
    );
    return response.data;
  },

  uploadAttachment: async (
    id: string,
    file: File,
    type: string,
    description?: string
  ): Promise<RiskAssessmentAttachment> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (description) {
      formData.append('description', description);
    }

    const response = await api.post<RiskAssessmentAttachment>(
      `${BASE_URL}/${id}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  getAttachments: async (id: string): Promise<RiskAssessmentAttachment[]> => {
    const response = await api.get<RiskAssessmentAttachment[]>(
      `${BASE_URL}/${id}/attachments`
    );
    return response.data;
  },

  deleteAttachment: async (id: string, attachmentId: string): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}/attachments/${attachmentId}`);
  },

  exportPDF: async (id: string): Promise<Blob> => {
    const response = await api.get(`${BASE_URL}/${id}/export/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportJSON: async (id: string): Promise<unknown> => {
    const response = await api.get<unknown>(`${BASE_URL}/${id}/export/json`);
    return response.data;
  },

  // ===== VERSION MANAGEMENT =====
  getVersionHistory: async (id: string): Promise<RiskAssessment[]> => {
    const response = await api.get<RiskAssessment[]>(
      `${BASE_URL}/${id}/versions`
    );
    return response.data;
  },

  createVersion: async (
    id: string,
    data: CreateVersionRequest
  ): Promise<RiskAssessment> => {
    const response = await api.post<RiskAssessment>(
      `${BASE_URL}/${id}/create-version`,
      data
    );
    return response.data;
  },

  compareVersions: async (
    id: string,
    versionId: string
  ): Promise<RiskAssessmentVersionComparison> => {
    const response = await api.get<RiskAssessmentVersionComparison>(
      `${BASE_URL}/${id}/compare/${versionId}`
    );
    return response.data;
  },

  restoreVersion: async (
    id: string,
    versionId: string,
    versionNotes: string
  ): Promise<RiskAssessment> => {
    const response = await api.post<RiskAssessment>(
      `${BASE_URL}/${id}/restore/${versionId}`,
      { versionNotes }
    );
    return response.data;
  },

  // ===== SURVEY DOCUMENTS =====
  getSurveyDocuments: async (id: string): Promise<SurveyDocumentsResponse> => {
    const response = await api.get<SurveyDocumentsResponse>(
      `${BASE_URL}/${id}/survey-documents`
    );
    return response.data;
  },

  getSurveyDocumentDownloadUrl: async (
    id: string,
    fileId: string
  ): Promise<string> => {
    const response = await api.get<{ url: string }>(
      `${BASE_URL}/${id}/survey-documents/${fileId}/download`
    );
    return response.data.url;
  },
};
