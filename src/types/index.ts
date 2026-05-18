import type { Supplier } from './survey.types';

export interface Product {
  id: string;
  name: string;
  supplierName: string;
  supplierId?: string;
  category: string;
  country: string;
  origin?: 'EU' | 'NON-EU';
  commodityType?:
    | 'cattle'
    | 'cocoa'
    | 'coffee'
    | 'palm-oil'
    | 'rubber'
    | 'soy'
    | 'wood';
  hsCode?: string;
  unit?: string;
  productType?: 'PURCHASED' | 'MANUFACTURED';
  isEudrRelevant?: boolean; // Auto-calculated by backend based on HS code
  internalProductCode?: string;
  supplierProductCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskAssessment {
  id: string;
  supplierId: string;
  assessorId: string;
  type: 'EU_SUPPLIER' | 'NON_EU_SUPPLIER';
  status:
    | 'DRAFT'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'REQUIRES_REVIEW'
    | 'APPROVED'
    | 'REJECTED';

  sourceSurveyInstanceId?: string;
  responses: Record<string, unknown>;

  overallRiskScore?: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  riskBreakdown: Record<string, number>;

  criticalRedFlags: string[];
  hasRedFlags: boolean;

  prefillPercentage?: number;
  manualOverrides: string[];

  validUntil?: Date;

  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  approvedAt?: Date;

  // Versioning fields
  version: number;
  isLatestVersion: boolean;
  parentAssessmentId?: string;
  previousVersionId?: string;
  templateId?: string;
  versionNotes?: string;
  supersededAt?: Date;
  supersededBy?: string;

  // Relations
  supplier?: Supplier;
  attachments?: RiskAssessmentAttachment[];
}

export interface RiskAssessmentVersionComparison {
  version1: RiskAssessment;
  version2: RiskAssessment;
  differences: {
    field: string;
    version1Value: unknown;
    version2Value: unknown;
    changeType: 'added' | 'removed' | 'modified';
  }[];
}

export interface CreateVersionRequest {
  updates: Partial<RiskAssessment>;
  versionNotes?: string;
}

// Survey Documents types for the RA documents panel
export interface SurveyDocumentFile {
  id: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  questionId: string | null;
  entryFieldId: string | null;
  entryIndex: number | null;
}

export interface SurveyDocumentSection {
  section: string;
  files: SurveyDocumentFile[];
}

export interface SurveyDocumentsResponse {
  sections: SurveyDocumentSection[];
}

export interface RiskFactor {
  factor: string;
  level: 'low' | 'medium' | 'high';
  score: number;
  justification: string;
  evidence?: string[];
}

export interface DDSTemplate {
  id: string;
  name: string;
  version: string;
  fields: DDSField[];
  applicableCommodities: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DDSField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'coordinates';
  required: boolean;
  defaultValue?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface DDS {
  id: string;
  templateId: string;
  template?: DDSTemplate;
  supplierId: string;
  supplier?: Supplier;
  productIds: string[];
  products?: Product[];
  geolocationId: string;
  geolocation?: Geolocation;
  supplyChainId: string;
  supplyChain?: SupplyChain;
  data: Record<string, string | number | boolean | string[]>;
  status: 'draft' | 'completed' | 'submitted';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Geolocation {
  id: string;
  name: string;
  supplierId: string;
  supplier?: Supplier;
  plotNumber: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  polygon?: {
    coordinates: Array<{
      latitude: number;
      longitude: number;
    }>;
  };
  area: number;
  areaUnit: 'hectares' | 'acres';
  country: string;
  region: string;
  forestRiskLevel: 'low' | 'medium' | 'high';
  deforestationDate?: Date;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplyChain {
  id: string;
  name: string;
  productIds: string[];
  supplierIds: string[];
  geoLocationIds: string[];
  riskLevel: 'low' | 'medium' | 'high';
  isCompliant: boolean;
  lastUpdated: Date;
}

export interface CompanySettings {
  id: string;
  companyName: string;
  registrationNumber: string;
  vatNumber?: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    website?: string;
  };
  legalRepresentative: {
    name: string;
    position: string;
    email: string;
    phone: string;
  };
  businessType:
    | 'TRADER'
    | 'OPERATOR_IMPORTER'
    | 'OPERATOR_MANUFACTURER'
    | 'OPERATOR_DOMESTIC';
  defaultRiskLevel: 'low' | 'medium' | 'high';
  certifications: string[];
  operatingCountries: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplyChainStep {
  id: string;
  stepNumber: number;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  entity: string;
  role: string;
  processDescription: string;
  transportMethod?: string;
  distanceToNext?: number;
  documents: string[];
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

export interface ExportOptions {
  format: 'pdf' | 'docx' | 'csv';
  includeImages: boolean;
  includeDocuments: boolean;
  template?: string;
}

// Risk Assessment Types
export interface RiskAssessment {
  id: string;
  supplierId: string;
  assessorId: string;
  type: 'EU_SUPPLIER' | 'NON_EU_SUPPLIER';
  status:
    | 'DRAFT'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'REQUIRES_REVIEW'
    | 'APPROVED'
    | 'REJECTED';

  sourceSurveyInstanceId?: string;
  responses: Record<string, unknown>;

  overallRiskScore?: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  riskBreakdown: Record<string, number>;

  criticalRedFlags: string[];
  hasRedFlags: boolean;

  prefillPercentage?: number;
  manualOverrides: string[];

  validUntil?: Date;

  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  approvedAt?: Date;

  // Relations
  supplier?: Supplier;
  attachments?: RiskAssessmentAttachment[];
}

export interface RiskAssessmentAttachment {
  id: string;
  riskAssessmentId: string;
  type:
    | 'CERTIFICATE'
    | 'GEOJSON'
    | 'LEGAL_DOCUMENT'
    | 'SATELLITE_DATA'
    | 'OTHER';
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  expiryDate?: Date;
  uploadedAt: Date;
}

export interface CreateRiskAssessmentRequest {
  supplierId: string;
  type: 'EU_SUPPLIER' | 'NON_EU_SUPPLIER';
  sourceSurveyInstanceId?: string;
}

export interface UpdateRiskAssessmentRequest {
  responses?: Record<string, unknown>;
  status?:
    | 'DRAFT'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'REQUIRES_REVIEW'
    | 'APPROVED'
    | 'REJECTED';
  manualOverrides?: string[];
}

export interface RiskAssessmentPrefillResponse {
  responses: Record<string, unknown>;
  prefillPercentage: number;
  sourceSurveyInstanceId?: string;
  missingFields: string[];
}
