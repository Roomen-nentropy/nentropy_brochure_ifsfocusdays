export interface SurveyCategoryGroup {
  id: string;
  title: string;
  description?: string;
}

export interface MapConfig {
  allowedShapes?: Array<'marker' | 'rectangle' | 'polygon'>;
  defaultCenter?: [number, number];
  defaultZoom?: number;
  enableSearch?: boolean;
  enableSatelliteView?: boolean;
  calculateArea?: boolean;
  mode?: 'draw' | 'view';
  showShapeInfo?: boolean;
  highlightShape?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  enableClearAll?: boolean;
  enableExport?: boolean;
  fitBounds?: boolean;
}

export interface FileInfo {
  id?: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  status?: 'uploading' | 'complete' | 'error';
  progress?: number;
}

export interface SurveyQuestion {
  id: string;
  type:
    | 'text'
    | 'number'
    | 'select'
    | 'multiselect'
    | 'date'
    | 'file'
    | 'boolean'
    | 'email'
    | 'multi_entry'
    | 'certificate_collection'
    | 'map';
  question: string;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  options?: string[];
  groupId?: string;
  mapConfig?: MapConfig;
  description?: string;

  entryFields?: SurveyQuestion[];
  minEntries?: number;
  maxEntries?: number;
  addButtonLabel?: string;
  removeButtonLabel?: string;
  visibleWhen?:
    | { fieldId: string; equals: string }
    | { fieldId: string; notEquals: string };
}

export interface SurveyTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  questions: SurveyQuestion[];
  categoryGroups: SurveyCategoryGroup[];
  applicableCommodities: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isEu: boolean;
  userId?: string;
  translations?: Record<string, unknown> | null;
  supportedLanguages?: string[];
  surveyType?:
    | 'SUPPLIER_COMPLIANCE'
    | 'DDS_FULL_GEOLOCATION'
    | 'DDS_NUMBER_ONLY';
}

export interface TranslationData {
  supportedLanguages: string[];
  suggestedLanguage: string;
  defaultLanguage: string;
}

export interface SurveyInstance {
  id: string;
  templateId: string;
  supplierId: string;
  createdByUserId: string;
  accessToken: string;
  status: 'CREATED' | 'SENT' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
  expiresAt: Date;
  sentAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  completionPercentage: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
  includePlotQuestion?: boolean;
  translationData?: TranslationData;
  // Optional relations
  template?: SurveyTemplate;
  supplier?: Supplier;
  responses?: SurveyInstanceResponse[];
  files?: SurveyFile[];
}

export interface SurveyInstanceResponse {
  id: string;
  instanceId: string;
  questionId: string;
  response: string;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyFile {
  id: string;
  instanceId: string;
  questionId: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  s3Key?: string;
  s3Url?: string;
  filePath?: string; // For backward compatibility
  uploadedAt: Date;
}

// Request/Response types for the API
export interface CreateTemplateData {
  name: string;
  description: string;
  questions: SurveyQuestion[];
  applicableCommodities: string[];
  categoryGroups?: SurveyCategoryGroup[];
  isEu?: boolean;
}

export interface CreateSurveyInstanceData {
  templateId: string;
  supplierId: string;
  expirationDays: number;
  includePlotQuestion?: boolean;
}

export interface CreateSurveyInstanceResponse extends SurveyInstance {
  emailSent?: boolean;
  emailError?: string;
  supplierHasEmail?: boolean;
}

export interface FileUploadInfo {
  filename: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface SurveyResponse {
  id: string;
  templateId: string;
  supplierId: string;
  productIds: string[];
  responses: Record<string, string | number | boolean | string[]>;
  status: 'draft' | 'sent' | 'completed' | 'reviewed';
  sentDate?: Date;
  completedDate?: Date;
  reviewedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveyFileInfo {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  url?: string;
  s3Url?: string;
}

export interface SurveyExportData {
  instance: SurveyInstance;
  responses: SurveyInstanceResponse[];
  files: SurveyFileInfo[];
  exportedAt: Date;
}

export interface SubmitSurveyResult {
  success: boolean;
  message: string;
  instanceId: string;
}

export interface Supplier {
  id: string;
  name: string;
  code?: string;
  country: string;
  address?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  riskLevel: 'low' | 'medium' | 'high';
  lastAssessmentDate?: Date;
  certifications: string[];
  isEuOrigin: boolean;
  createdAt: Date;
  updatedAt: Date;
}
