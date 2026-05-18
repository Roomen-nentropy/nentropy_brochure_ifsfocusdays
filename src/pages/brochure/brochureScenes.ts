import { BROCHURE_ASSETS } from './brochureAssets';

export type BrochureChapter =
  | 'intro'
  | 'solution'
  | 'chaos'
  | 'platform'
  | 'transition'
  | 'outcome';

export type SceneLayout = 'hero' | 'center' | 'scatter' | 'sequence' | 'wide' | 'stack';

export type SceneItem = {
  asset: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  x?: number;
  y?: number;
  rotate?: number;
  step?: number;
};

export type BrochureScene = {
  id: string;
  chapter: BrochureChapter;
  layout: SceneLayout;
  textKey: string;
  items: SceneItem[];
};

const A = BROCHURE_ASSETS;

/** Brochure order (IFS PDF / ifs-brochure-web) — each PNG used once */
export const BROCHURE_SCENES: BrochureScene[] = [
  {
    id: 'simply-works',
    chapter: 'solution',
    layout: 'hero',
    textKey: 'simplyWorks',
    items: [{ asset: A.simplyWorksMan, alt: 'Simply works', size: 'lg' }],
  },
  {
    id: 'transparency',
    chapter: 'solution',
    layout: 'center',
    textKey: 'transparency',
    items: [{ asset: A.transparencyHandshake, alt: 'Прозрачност и доверие', size: 'lg' }],
  },
  {
    id: 'growth',
    chapter: 'solution',
    layout: 'center',
    textKey: 'growth',
    items: [{ asset: A.growthCharts, alt: 'От доверие към растеж', size: 'xl' }],
  },
  {
    id: 'chaos-start',
    chapter: 'chaos',
    layout: 'scatter',
    textKey: 'chaosStart',
    items: [
      { asset: A.docCertificates, alt: 'Сертификати', size: 'sm', x: 8, y: 18, rotate: -12 },
      { asset: A.docTransport, alt: 'Транспорт', size: 'sm', x: 62, y: 8, rotate: 8 },
      { asset: A.docCoa, alt: 'COA', size: 'sm', x: 4, y: 48, rotate: -6 },
      { asset: A.docBatch, alt: 'Партиди', size: 'sm', x: 38, y: 38, rotate: 4 },
      { asset: A.docSupplierApproval, alt: 'Одобрения', size: 'sm', x: 68, y: 42, rotate: 10 },
      { asset: A.docNonconformity, alt: 'Несъответствия', size: 'sm', x: 22, y: 72, rotate: -8 },
      { asset: A.docTraining, alt: 'Обучения', size: 'sm', x: 58, y: 68, rotate: 6 },
    ],
  },
  {
    id: 'chaos-never-stops',
    chapter: 'chaos',
    layout: 'center',
    textKey: 'chaosNeverStops',
    items: [{ asset: A.chaosOverwhelmed, alt: 'И никога не спира', size: 'lg' }],
  },
  {
    id: 'scanning',
    chapter: 'chaos',
    layout: 'sequence',
    textKey: 'scanning',
    items: [
      { asset: A.scanningScene, alt: 'Сканиране', size: 'lg' },
      { asset: A.scanningPdfConfused, alt: 'PDF не е дигитализация', size: 'lg' },
      { asset: A.dppPhoneOrigin, alt: 'Живи данни', size: 'md' },
    ],
  },
  {
    id: 'supply-chain',
    chapter: 'platform',
    layout: 'sequence',
    textKey: 'supplyChain',
    items: [
      { asset: A.supplyFarm, alt: 'Ферма', size: 'lg', step: 1 },
      { asset: A.supplySupplier, alt: 'Доставчик', size: 'lg', step: 2 },
      { asset: A.supplyProduction, alt: 'Производство', size: 'lg', step: 3 },
      { asset: A.supplyLogistics, alt: 'Логистика', size: 'lg', step: 4 },
      { asset: A.supplyRetail, alt: 'Търговец', size: 'lg', step: 5 },
      { asset: A.dppQrShopper, alt: 'Потребител с QR', size: 'lg' },
    ],
  },
  {
    id: 'dpp-layers',
    chapter: 'platform',
    layout: 'stack',
    textKey: 'dppLayers',
    items: [
      { asset: A.layerOriginData, alt: 'Произход', size: 'md' },
      { asset: A.layerCertificates, alt: 'Сертификати', size: 'md' },
      { asset: A.layerQuality, alt: 'Качество', size: 'md' },
      { asset: A.layerMonitoring, alt: 'Мониторинг', size: 'md' },
      { asset: A.layerTraceability, alt: 'Проследимост', size: 'md' },
    ],
  },
  {
    id: 'feedback',
    chapter: 'platform',
    layout: 'sequence',
    textKey: 'feedback',
    items: [{ asset: A.feedbackThanks, alt: 'Благодарим', size: 'lg' }],
  },
  {
    id: 'hidden-gold',
    chapter: 'transition',
    layout: 'wide',
    textKey: 'hiddenGold',
    items: [{ asset: A.hiddenGoldScattered, alt: 'Скрита златна мина', size: 'full' }],
  },
  {
    id: 'transformation',
    chapter: 'transition',
    layout: 'center',
    textKey: 'transformation',
    items: [{ asset: A.transformationMachine, alt: 'Трансформация', size: 'lg' }],
  },
  {
    id: 'data-value',
    chapter: 'transition',
    layout: 'wide',
    textKey: 'dataValue',
    items: [{ asset: A.dataValueVisuals, alt: 'Данни към стойност', size: 'full' }],
  },
  {
    id: 'forecasts',
    chapter: 'outcome',
    layout: 'wide',
    textKey: 'forecasts',
    items: [{ asset: A.forecastsTrends, alt: 'Прогнози', size: 'full' }],
  },
  {
    id: 'compliance',
    chapter: 'outcome',
    layout: 'wide',
    textKey: 'compliance',
    items: [{ asset: A.automatedCompliance, alt: 'Автоматизирано съответствие', size: 'full' }],
  },
  {
    id: 'future',
    chapter: 'outcome',
    layout: 'center',
    textKey: 'future',
    items: [{ asset: A.outcomeFuture, alt: 'Future-proof', size: 'xl' }],
  },
];

export const CHAPTER_LABELS: Record<BrochureChapter, { bg: string; en: string }> = {
  intro: { bg: "N'entropy", en: "N'entropy" },
  solution: { bg: 'Обещание', en: 'Promise' },
  chaos: { bg: 'Хаос', en: 'Chaos' },
  platform: { bg: 'Платформа', en: 'Platform' },
  transition: { bg: 'Трансформация', en: 'Transformation' },
  outcome: { bg: 'Бъдеще', en: 'Future' },
};
