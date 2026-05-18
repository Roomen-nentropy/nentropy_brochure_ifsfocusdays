import { useMemo } from 'react';
import { useSettings } from './useSettings';

export type BusinessType =
  | 'TRADER'
  | 'OPERATOR_IMPORTER'
  | 'OPERATOR_MANUFACTURER'
  | 'OPERATOR_DOMESTIC';

export interface BusinessTypeFeatures {
  businessType: BusinessType;
  features: {
    canCreateSuppliers: boolean;
    canCreateProducts: boolean;
    canManageSupplyChains: boolean;
    canCreateRiskAssessments: boolean;
    canCreateDDS: boolean;
    canRecordDDS: boolean;
    canManageBatches: boolean;
    canManageOwnGoods: boolean;
    canSendSurveys: boolean;
  };
  surveyTypes: {
    defaultSurveyType: 'EU' | 'NON_EU' | 'MICRO' | 'MINI';
    availableSurveyTypes: ('EU' | 'NON_EU' | 'MICRO' | 'MINI')[];
  };
  ddsWorkflow: {
    ddsAction: 'CREATE' | 'RECORD';
    retentionPeriodYears: 2 | 5;
    requiresGeolocation: boolean;
  };
  ui: {
    dashboardWidgets: string[];
    navigationItems: string[];
    surveyButtonText: string;
    ddsButtonText: string;
  };
}

/**
 * Hook to access business type configuration and feature flags
 */
export function useWorkflow() {
  const { settings } = useSettings();
  const businessType = settings?.businessType as BusinessType | undefined;

  const features = useMemo<BusinessTypeFeatures | null>(() => {
    if (!businessType) return null;

    return getBusinessTypeFeatures(businessType);
  }, [businessType]);

  const hasFeature = (
    feature: keyof BusinessTypeFeatures['features']
  ): boolean => {
    if (!features) return false;
    return features.features[feature];
  };

  const getDefaultSurveyType = ():
    | 'EU'
    | 'NON_EU'
    | 'MICRO'
    | 'MINI'
    | null => {
    if (!features) return null;
    return features.surveyTypes.defaultSurveyType;
  };

  const getDDSWorkflow = () => {
    if (!features) return null;
    return features.ddsWorkflow;
  };

  const getUIConfig = () => {
    if (!features) return null;
    return features.ui;
  };

  return {
    businessType,
    features,
    hasFeature,
    getDefaultSurveyType,
    getDDSWorkflow,
    getUIConfig,
  };
}

/**
 * Get all features and configuration for a business type
 */
function getBusinessTypeFeatures(
  businessType: BusinessType
): BusinessTypeFeatures {
  switch (businessType.toUpperCase()) {
    case 'TRADER':
      return {
        businessType: 'TRADER',
        features: {
          canCreateSuppliers: true,
          canCreateProducts: true,
          canManageSupplyChains: false,
          canCreateRiskAssessments: false,
          canCreateDDS: false,
          canRecordDDS: true,
          canManageBatches: true,
          canManageOwnGoods: false,
          canSendSurveys: true,
        },
        surveyTypes: {
          defaultSurveyType: 'MICRO',
          availableSurveyTypes: ['MICRO'],
        },
        ddsWorkflow: {
          ddsAction: 'RECORD',
          retentionPeriodYears: 2,
          requiresGeolocation: false,
        },
        ui: {
          dashboardWidgets: [
            'suppliers',
            'products',
            'dds_tracking',
            'batches',
          ],
          navigationItems: [
            'dashboard',
            'suppliers',
            'products',
            'dds',
            'settings',
          ],
          surveyButtonText: 'Request DDS Numbers',
          ddsButtonText: 'Record DDS',
        },
      };

    case 'OPERATOR_IMPORTER':
      return {
        businessType: 'OPERATOR_IMPORTER',
        features: {
          canCreateSuppliers: true,
          canCreateProducts: true,
          canManageSupplyChains: true,
          canCreateRiskAssessments: true,
          canCreateDDS: true,
          canRecordDDS: false,
          canManageBatches: true,
          canManageOwnGoods: false,
          canSendSurveys: true,
        },
        surveyTypes: {
          defaultSurveyType: 'NON_EU',
          availableSurveyTypes: ['NON_EU', 'MINI'],
        },
        ddsWorkflow: {
          ddsAction: 'CREATE',
          retentionPeriodYears: 5,
          requiresGeolocation: true,
        },
        ui: {
          dashboardWidgets: [
            'suppliers',
            'products',
            'surveys',
            'risk_assessments',
            'dds_creation',
            'batches',
          ],
          navigationItems: [
            'dashboard',
            'suppliers',
            'products',
            'surveys',
            'risk_assessments',
            'dds',
            'settings',
          ],
          surveyButtonText: 'Send Compliance Survey',
          ddsButtonText: 'Create DDS',
        },
      };

    case 'OPERATOR_MANUFACTURER':
      return {
        businessType: 'OPERATOR_MANUFACTURER',
        features: {
          canCreateSuppliers: true,
          canCreateProducts: true,
          canManageSupplyChains: true,
          canCreateRiskAssessments: true,
          canCreateDDS: true,
          canRecordDDS: false,
          canManageBatches: true,
          canManageOwnGoods: true,
          canSendSurveys: true,
        },
        surveyTypes: {
          defaultSurveyType: 'NON_EU',
          availableSurveyTypes: ['NON_EU', 'MINI'],
        },
        ddsWorkflow: {
          ddsAction: 'CREATE',
          retentionPeriodYears: 5,
          requiresGeolocation: true,
        },
        ui: {
          dashboardWidgets: [
            'suppliers',
            'products',
            'own_goods',
            'surveys',
            'risk_assessments',
            'dds_creation',
            'batches',
          ],
          navigationItems: [
            'dashboard',
            'suppliers',
            'products',
            'own_goods',
            'surveys',
            'risk_assessments',
            'dds',
            'settings',
          ],
          surveyButtonText: 'Send Compliance Survey',
          ddsButtonText: 'Create DDS',
        },
      };

    case 'OPERATOR_DOMESTIC':
      return {
        businessType: 'OPERATOR_DOMESTIC',
        features: {
          canCreateSuppliers: true,
          canCreateProducts: true,
          canManageSupplyChains: true,
          canCreateRiskAssessments: true,
          canCreateDDS: true,
          canRecordDDS: false,
          canManageBatches: true,
          canManageOwnGoods: true,
          canSendSurveys: true,
        },
        surveyTypes: {
          defaultSurveyType: 'EU',
          availableSurveyTypes: ['EU'],
        },
        ddsWorkflow: {
          ddsAction: 'CREATE',
          retentionPeriodYears: 5,
          requiresGeolocation: false,
        },
        ui: {
          dashboardWidgets: [
            'suppliers',
            'products',
            'own_goods',
            'surveys',
            'risk_assessments',
            'dds_creation',
            'batches',
          ],
          navigationItems: [
            'dashboard',
            'suppliers',
            'products',
            'own_goods',
            'surveys',
            'risk_assessments',
            'dds',
            'settings',
          ],
          surveyButtonText: 'Send Declaration Survey',
          ddsButtonText: 'Create DDS',
        },
      };

    default:
      throw new Error(`Unknown business type: ${businessType}`);
  }
}
