import { api } from './index';
import type {
  BatchDocumentOption,
  BatchLabelInstance,
  LabelProfile,
  LabelTemplate,
  PackagingLink,
} from '../types/packaging-labelling.types';

const base = '/api/packaging-labelling';

export const packagingLabellingApi = {
  listSubjects: () =>
    api.get<{
      products: { id: string; name: string; isPackaging: boolean }[];
      ownGoods: { id: string; name: string; isPackaging: boolean }[];
    }>(`${base}/subjects`),

  listCandidates: () =>
    api.get<{ products: { id: string; name: string }[]; ownGoods: { id: string; name: string }[] }>(
      `${base}/packaging-candidates`
    ),

  listLinks: () => api.get<PackagingLink[]>(`${base}/links`),

  upsertLink: (body: Record<string, unknown>) =>
    api.post<PackagingLink>(`${base}/links`, body),

  deleteLink: (id: string) => api.delete(`${base}/links/${id}`),

  listTemplates: () => api.get<LabelTemplate[]>(`${base}/templates`),

  createTemplate: (body: Record<string, unknown>) =>
    api.post<LabelTemplate>(`${base}/templates`, body),

  updateTemplate: (id: string, body: Record<string, unknown>) =>
    api.patch<LabelTemplate>(`${base}/templates/${id}`, body),

  deleteTemplate: (id: string) => api.delete(`${base}/templates/${id}`),

  uploadTemplateBase: (id: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post<{ baseImageUrl?: string } & LabelTemplate>(
      `${base}/templates/${id}/upload-base`,
      fd,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  listProfiles: () => api.get<LabelProfile[]>(`${base}/profiles`),

  createProfile: (body: Record<string, unknown>) =>
    api.post<LabelProfile>(`${base}/profiles`, body),

  updateProfile: (id: string, body: Record<string, unknown>) =>
    api.patch<LabelProfile>(`${base}/profiles/${id}`, body),

  listProducts: () => api.get<ManagementProduct[]>(`${base}/management/products`),

  listOwnGoods: () => api.get<ManagementOwnGood[]>(`${base}/management/own-goods`),

  listBatchDocuments: (kind: 'product' | 'own-good', batchId: string) =>
    api.get<{ productLevel: BatchDocumentOption[]; batchLevel: BatchDocumentOption[] }>(
      `${base}/batches/${kind}/${batchId}/documents`
    ),

  getBatchLabel: (kind: 'product' | 'own-good', batchId: string) =>
    api.get<BatchLabelInstance | null>(`${base}/batches/${kind}/${batchId}/label`),

  upsertBatchLabel: (body: Record<string, unknown>) =>
    api.post<BatchLabelInstance>(`${base}/batch-labels`, body),

  generateQr: (batchLabelId: string, payload: Record<string, unknown>) =>
    api.post<BatchLabelInstance & { qrImageUrl?: string; traceUrl?: string }>(
      `${base}/batch-labels/${batchLabelId}/generate-qr`,
      payload
    ),

  getRegulatory: (profileId: string, kind: 'product' | 'own-good', batchId: string) =>
    api.get<{ automated: Record<string, unknown>; editableDefaults: Record<string, unknown> }>(
      `${base}/regulatory/${profileId}/${kind}/${batchId}`
    ),

  getPublicTrace: (token: string) =>
    api.get<PublicTracePayload>(`${base}/public/trace/${token}`),
};

export interface ManagementProduct {
  id: string;
  name: string;
  category: string;
  batches: { id: string; batchNumber: string; receivedDate: string }[];
  packagingLinksAsSubject: PackagingLink[];
  labelProfiles: LabelProfile[];
}

export interface ManagementOwnGood {
  id: string;
  name: string;
  category?: string | null;
  batches: { id: string; batchNumber: string; productionDate: string }[];
  packagingLinksAsSubject: PackagingLink[];
  labelProfiles: LabelProfile[];
}

export interface PublicTracePayload {
  token: string;
  batchKind: string;
  fields: Record<string, unknown>;
  batchNumber?: string;
  qrImageUrl?: string | null;
  product?: { name: string } | null;
  ownGood?: { name: string } | null;
  documents?: { productLevel: BatchDocumentOption[]; batchLevel: BatchDocumentOption[] };
}
