export type LabelTemplateMode = 'IMAGE_OVERLAY' | 'SCRATCH';
export type PackagingLinkSubjectKind = 'PRODUCT' | 'OWN_GOOD';

export interface LabelDesignElement {
  id: string;
  type: 'text' | 'rect' | 'qr';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  bindKey?: string;
  fontSize?: number;
  fill?: string;
}

export interface LabelTemplate {
  id: string;
  name: string;
  mode: LabelTemplateMode;
  widthMm: number;
  heightMm: number;
  designJson: { elements?: LabelDesignElement[] };
  baseImageS3Key?: string | null;
}

export interface PackagingLink {
  id: string;
  subjectKind: PackagingLinkSubjectKind;
  productId?: string | null;
  ownGoodId?: string | null;
  packagingProductId?: string | null;
  packagingOwnGoodId?: string | null;
  product?: { id: string; name: string } | null;
  ownGood?: { id: string; name: string } | null;
  packagingProduct?: { id: string; name: string } | null;
  packagingOwnGood?: { id: string; name: string } | null;
}

export interface LabelProfile {
  id: string;
  subjectKind: PackagingLinkSubjectKind;
  productId?: string | null;
  ownGoodId?: string | null;
  packagingLinkId: string;
  labelTemplateId: string;
  fieldOverridesJson: Record<string, unknown>;
  labelTemplate?: LabelTemplate;
  packagingLink?: PackagingLink;
}

export interface BatchLabelInstance {
  id: string;
  batchKind: 'PRODUCT_BATCH' | 'OWN_GOOD_BATCH';
  productBatchId?: string | null;
  ownGoodBatchId?: string | null;
  labelProfileId: string;
  designSnapshotJson?: Record<string, unknown> | null;
  qrPayloadJson?: Record<string, unknown>;
  qrImageS3Key?: string | null;
  publicTraceToken: string;
  labelProfile?: LabelProfile;
}

export interface BatchDocumentOption {
  id: string;
  scope: 'product' | 'batch';
  label: string;
  docType?: string;
  url?: string | null;
}
