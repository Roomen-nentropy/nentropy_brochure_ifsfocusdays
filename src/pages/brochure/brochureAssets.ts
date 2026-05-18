import { assetBase } from '../../config/brochureSite';

/** Bump after replacing files in public/brochure-assets (cache bust) */
const V = '20260523';

const asset = (file: string) => `${assetBase}brochure-assets/${file}?v=${V}`;

/** Cut-out graphics from Desktop/Brochure graphics — served as-is, no processing */
export const BROCHURE_ASSETS = {
  simplyWorksMan: asset('simply-works-man.png'),
  transparencyHandshake: asset('transparency-handshake.png'),
  growthCharts: asset('growth-charts.png'),
  docCertificates: asset('doc-certificates.png'),
  docTransport: asset('doc-transport.png'),
  docCoa: asset('doc-coa.png'),
  docBatch: asset('doc-batch.png'),
  docSupplierApproval: asset('doc-supplier-approval.png'),
  docNonconformity: asset('doc-nonconformity.png'),
  docTraining: asset('doc-training.png'),
  chaosOverwhelmed: asset('chaos-overwhelmed.png'),
  scanningScene: asset('scanning-scene.png'),
  scanningPdfConfused: asset('scanning-pdf-confused.png'),
  supplyFarm: asset('supply-farm.png'),
  supplySupplier: asset('supply-supplier.png'),
  supplyProduction: asset('supply-production.png'),
  supplyLogistics: asset('supply-logistics.png'),
  supplyRetail: asset('supply-retail.png'),
  dppQrShopper: asset('dpp-qr-shopper.png'),
  layerOriginData: asset('layer-origin-data.png'),
  layerCertificates: asset('layer-certificates.png'),
  layerQuality: asset('layer-quality.png'),
  layerMonitoring: asset('layer-monitoring.png'),
  layerTraceability: asset('layer-traceability.png'),
  dppMenu: asset('dpp-menu.png'),
  dppScanFlow: asset('dpp-scan-flow.png'),
  dppPhoneOrigin: asset('dpp-phone-origin.png'),
  feedbackCycle: asset('feedback-cycle.png'),
  feedbackThanks: asset('feedback-thanks.png'),
  hiddenGoldScattered: asset('hidden-gold-scattered.png'),
  transformationMachine: asset('transformation-machine.png'),
  dataValueVisuals: asset('data-value-visuals.png'),
  forecastsTrends: asset('forecasts-trends.png'),
  automatedCompliance: asset('automated-compliance.png'),
  outcomeFuture: asset('outcome-future.png'),
} as const;
