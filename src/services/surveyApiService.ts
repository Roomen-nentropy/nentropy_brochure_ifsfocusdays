import { api } from '.';
import type {
  SurveyTemplate,
  SurveyInstance,
  SurveyInstanceResponse,
  SurveyQuestion,
  SurveyFileInfo,
  SubmitSurveyResult,
  SurveyExportData,
} from '../types/survey.types';

export interface CreateSurveyInstanceRequest {
  templateId: string;
  supplierId: string;
  expirationDays?: number;
  includePlotQuestion?: boolean;
  includePackaging2025_40?: boolean;
}

export interface CreateTemplateRequest {
  name: string;
  description: string;
  questions: SurveyQuestion[];
  applicableCommodities: string[];
}

export interface UpdateSurveyResponseRequest {
  responses: Record<
    string,
    string | number | boolean | string[] | Record<string, unknown>[]
  >;
  isFinal?: boolean;
}

class SurveyApiService {
  async getAllTemplates(): Promise<SurveyTemplate[]> {
    const response = await api.get<SurveyTemplate[]>('/api/surveys/templates');
    return response.data;
  }

  async createTemplate(data: CreateTemplateRequest): Promise<SurveyTemplate> {
    const response = await api.post<SurveyTemplate>(
      '/api/surveys/templates',
      data
    );
    return response.data;
  }

  async getAllSurveyInstances(): Promise<SurveyInstance[]> {
    const response = await api.get<SurveyInstance[]>('/api/surveys/instances');
    return response.data;
  }

  async createSurveyInstance(
    data: CreateSurveyInstanceRequest
  ): Promise<SurveyInstance> {
    const response = await api.post<SurveyInstance>(
      '/api/surveys/instances',
      data
    );
    return response.data;
  }

  async getSurveyInstance(id: string): Promise<SurveyInstance> {
    const response = await api.get<SurveyInstance>(
      `/api/surveys/instances/${id}`
    );
    return response.data;
  }

  async updateSurveyInstanceStatus(
    id: string,
    status: string
  ): Promise<SurveyInstance> {
    const response = await api.patch<SurveyInstance>(
      `/api/surveys/instances/${id}/status`,
      { status }
    );
    return response.data;
  }

  async getSurveyResponses(
    instanceId: string
  ): Promise<SurveyInstanceResponse[]> {
    const response = await api.get<SurveyInstanceResponse[]>(
      `/api/surveys/instances/${instanceId}/responses`
    );
    return response.data;
  }

  async exportSurveyInstance(instanceId: string): Promise<SurveyExportData> {
    const response = await api.get<SurveyExportData>(
      `/api/surveys/instances/${instanceId}/export`
    );
    return response.data;
  }

  async getPublicSurvey(token: string): Promise<SurveyInstance> {
    const response = await api.get<SurveyInstance>(
      `/api/surveys/public/${token}`
    );

    return response.data;
  }

  async updateSurveyResponse(
    token: string,
    data: UpdateSurveyResponseRequest
  ): Promise<SurveyInstance> {
    const response = await api.patch<SurveyInstance>(
      `/api/surveys/public/${token}/responses`,
      data
    );
    return response.data;
  }

  async submitSurveyResponse(token: string): Promise<SubmitSurveyResult> {
    const response = await api.post<SubmitSurveyResult>(
      `/api/surveys/public/${token}/submit`
    );
    return response.data;
  }

  async uploadFile(
    token: string,
    questionId: string,
    file: File,
    entryFieldId?: string,
    entryIndex?: number
  ): Promise<SurveyFileInfo> {
    const formData = new FormData();
    formData.append('file', file);

    // Build URL with query parameters for multi-entry context
    let url = `/api/surveys/public/${token}/upload/${questionId}`;
    const params = new URLSearchParams();
    if (entryFieldId) {
      params.append('entryFieldId', entryFieldId);
    }
    if (entryIndex !== undefined) {
      params.append('entryIndex', entryIndex.toString());
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await api.post<SurveyFileInfo>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async downloadFile(token: string, fileId: string): Promise<{ url: string }> {
    const response = await api.get<{ url: string }>(
      `/api/surveys/public/${token}/files/${fileId}`,
      {
        responseType: 'json',
      }
    );
    return response.data;
  }

  async getLatestCompletedSurveyBySupplier(
    supplierId: string
  ): Promise<SurveyInstance | null> {
    const response = await api.get<SurveyInstance | null>(
      `/api/surveys/latest-completed/${supplierId}`
    );
    return response.data;
  }

  generatePublicSurveyUrl(token: string): string {
    return `${window.location.origin}/survey/${token}`;
  }

  copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
  }
}

export const surveyApiService = new SurveyApiService();
export default surveyApiService;
