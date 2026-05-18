import type { BusinessType } from '../BusinessTypeSelector/BusinessTypeSelector';

export interface PricingPlan {
  name: string;
  displayName: string;
  businessType: BusinessType;
  price: number;
  annualPrice: number;
  suppliers: string;
  features: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'trader',
    displayName: 'Trader',
    businessType: 'TRADER',
    price: 35,
    annualPrice: 31.5, // 10% discount
    suppliers: 'Unlimited',
    features: [
      'Record DDS',
      'Track Suppliers',
      'Document Storage',
      'Basic Reporting',
    ],
  },
  {
    name: 'operator_importer',
    displayName: 'Operator (Import/Export) - Basic',
    businessType: 'OPERATOR_IMPORTER',
    price: 100,
    annualPrice: 90, // 10% discount
    suppliers: '25',
    features: [
      'Create DDS',
      'Risk Assessments',
      'Send Surveys',
      'Geolocation Tracking',
      'Advanced Analytics',
      'Up to 25 suppliers',
    ],
  },
  {
    name: 'operator_importer_plus',
    displayName: 'Operator (Import/Export) - Plus',
    businessType: 'OPERATOR_IMPORTER',
    price: 150,
    annualPrice: 135, // 10% discount
    suppliers: '50',
    features: [
      'Create DDS',
      'Risk Assessments',
      'Send Surveys',
      'Geolocation Tracking',
      'Advanced Analytics',
      'Up to 50 suppliers',
      'Priority Support',
    ],
  },
  {
    name: 'operator_manufacturer',
    displayName: 'Operator (Manufacturer) - Basic',
    businessType: 'OPERATOR_MANUFACTURER',
    price: 100,
    annualPrice: 90, // 10% discount
    suppliers: '25',
    features: [
      'Create DDS',
      'Own Goods Management',
      'Batch Management',
      'BOM Tracking',
      'Full Traceability',
      'Up to 25 suppliers',
    ],
  },
  {
    name: 'operator_manufacturer_plus',
    displayName: 'Operator (Manufacturer) - Plus',
    businessType: 'OPERATOR_MANUFACTURER',
    price: 150,
    annualPrice: 135, // 10% discount
    suppliers: '50',
    features: [
      'Create DDS',
      'Own Goods Management',
      'Batch Management',
      'BOM Tracking',
      'Full Traceability',
      'Up to 50 suppliers',
      'Priority Support',
    ],
  },
  {
    name: 'operator_domestic',
    displayName: 'Trader (Manufacturer) - Basic',
    businessType: 'OPERATOR_DOMESTIC',
    price: 100,
    annualPrice: 90, // 10% discount
    suppliers: '25',
    features: [
      'Create DDS',
      'EU Surveys',
      'Risk Assessments',
      'Simplified Compliance',
      'Batch Tracking',
      'Up to 25 suppliers',
    ],
  },
  {
    name: 'operator_domestic_plus',
    displayName: 'Trader (Manufacturer) - Plus',
    businessType: 'OPERATOR_DOMESTIC',
    price: 150,
    annualPrice: 135, // 10% discount
    suppliers: '50',
    features: [
      'Create DDS',
      'EU Surveys',
      'Risk Assessments',
      'Simplified Compliance',
      'Batch Tracking',
      'Up to 50 suppliers',
      'Priority Support',
    ],
  },
];
