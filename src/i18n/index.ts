import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation files
import enCommon from './locales/en/common.json';
import enNavigation from './locales/en/navigation.json';
import enDashboard from './locales/en/dashboard.json';
import enSuppliers from './locales/en/suppliers.json';
import enProducts from './locales/en/products.json';
import enOwnGoods from './locales/en/ownGoods.json';
import enDdsSurveys from './locales/en/ddsSurveys.json';
import enSurveys from './locales/en/surveys.json';
import enDds from './locales/en/dds.json';
import enGeolocations from './locales/en/geolocations.json';
import enRiskAssessments from './locales/en/riskAssessments.json';
import enSupplyChains from './locales/en/supplyChains.json';
import enSettings from './locales/en/settings.json';
import enLanding from './locales/en/landing.json';
import enBrochure from './locales/en/brochure.json';
import enAuth from './locales/en/auth.json';
import enSurveyForm from './locales/en/surveyForm.json';
import enBusinessTypeSelector from './locales/en/businessTypeSelector.json';
import enSubscription from './locales/en/subscription.json';
import enIntegrations from './locales/en/integrations.json';

import bgCommon from './locales/bg/common.json';
import bgNavigation from './locales/bg/navigation.json';
import bgDashboard from './locales/bg/dashboard.json';
import bgOwnGoods from './locales/bg/ownGoods.json';
import bgDdsSurveys from './locales/bg/ddsSurveys.json';
import bgSuppliers from './locales/bg/suppliers.json';
import bgProducts from './locales/bg/products.json';
import bgSurveys from './locales/bg/surveys.json';
import bgDds from './locales/bg/dds.json';
import bgGeolocations from './locales/bg/geolocations.json';
import bgRiskAssessments from './locales/bg/riskAssessments.json';
import bgSupplyChains from './locales/bg/supplyChains.json';
import bgSettings from './locales/bg/settings.json';
import bgLanding from './locales/bg/landing.json';
import bgBrochure from './locales/bg/brochure.json';
import bgAuth from './locales/bg/auth.json';
import bgSurveyForm from './locales/bg/surveyForm.json';
import bgBusinessTypeSelector from './locales/bg/businessTypeSelector.json';
import bgSubscription from './locales/bg/subscription.json';
import bgIntegrations from './locales/bg/integrations.json';

// Define the resources structure
const resources = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    dashboard: enDashboard,
    suppliers: enSuppliers,
    products: enProducts,
    surveys: enSurveys,
    dds: enDds,
    geolocations: enGeolocations,
    riskAssessments: enRiskAssessments,
    supplyChains: enSupplyChains,
    settings: enSettings,
    landing: enLanding,
    brochure: enBrochure,
    auth: enAuth,
    surveyForm: enSurveyForm,
    ownGoods: enOwnGoods,
    ddsSurveys: enDdsSurveys,
    businessTypeSelector: enBusinessTypeSelector,
    subscription: enSubscription,
    integrations: enIntegrations,
  },
  bg: {
    ownGoods: bgOwnGoods,
    ddsSurveys: bgDdsSurveys,
    common: bgCommon,
    navigation: bgNavigation,
    dashboard: bgDashboard,
    suppliers: bgSuppliers,
    products: bgProducts,
    surveys: bgSurveys,
    dds: bgDds,
    geolocations: bgGeolocations,
    riskAssessments: bgRiskAssessments,
    supplyChains: bgSupplyChains,
    settings: bgSettings,
    landing: bgLanding,
    brochure: bgBrochure,
    auth: bgAuth,
    surveyForm: bgSurveyForm,
    businessTypeSelector: bgBusinessTypeSelector,
    subscription: bgSubscription,
    integrations: bgIntegrations,
  },
};

const getInitialLanguage = () => {
  const storedLanguage = localStorage.getItem('preferred-language');

  return storedLanguage || 'bg';
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'bg',

  // Namespace handling
  defaultNS: 'common',
  ns: [
    'common',
    'navigation',
    'dashboard',
    'suppliers',
    'products',
    'surveys',
    'dds',
    'geolocations',
    'riskAssessments',
    'supplyChains',
    'settings',
    'landing',
    'brochure',
    'auth',
    'surveyForm',
    'businessTypeSelector',
    'subscription',
    'integrations',
  ],

  interpolation: {
    escapeValue: false, // React already does escaping
  },

  // React specific options
  react: {
    useSuspense: false,
  },
});

i18n.on('languageChanged', lng => {
  localStorage.setItem('preferred-language', lng);
});

export default i18n;
