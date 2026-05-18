import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Drawer,
  Tab,
  Tabs,
  Badge,
} from '@mui/material';
import {
  ArrowLeft,
  Save,
  Calculator,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  History,
  GitBranch,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import {
  useRiskAssessment,
  useUpdateRiskAssessment,
  useCalculateRisk,
  useVersionHistory,
  useCreateVersion,
  useCompareVersions,
  useRestoreVersion,
  useSurveyDocuments,
} from '../hooks/useRiskAssessments';
import type { FormField } from '../lib/risk-assessment-utils';
import VirtualizedProductSelect from '../components/VirtualizedProductSelect';
import MapField from '../components/MapField';
import type { GeoJSONData } from '../components/MapField';
import {
  AddressAutocomplete,
  type ParsedAddress,
} from '../components/AddressAutocomplete';
import {
  VersionHistory,
  CreateVersionDialog,
  VersionComparison,
  RestoreVersionDialog,
} from '../components/RiskAssessmentVersioning';
import { SurveyDocumentsPanel } from '../components/RiskAssessmentDocuments';

// Type definition for plantation risk assessment entries
interface PlantationRiskAssessment {
  plantationId: string;
  owner: string;
  country: string;
  countryDeclared?: string;
  countryDerived?: string;
  countryMismatch: boolean;
  area: number;
  areaSource: string;
  shapeType: 'polygon' | 'rectangle' | 'marker';
  geojson: GeoJSONData;
  coordinates: [number, number];
  euRiskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  geolocationProvided?: string;
  deforestationAlertsDetected?: string;
  notes?: string;
}

const RiskAssessmentEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['riskAssessments', 'common']);

  // Helper function to convert section name to translation key
  const getSectionTranslationKey = (section: string | undefined): string => {
    if (!section) return '';

    const sectionKeyMap: Record<string, string> = {
      'Supplier Information': 'supplierInformation',
      'Basic Information': 'basicInformation',
      'Product Information': 'productInformation',
      'Origin Declaration': 'originDeclaration',
      'Species Information': 'speciesInformation',
      'Certification Status': 'certificationStatus',
      'Certification & Standards': 'certificationStandards',
      'EUDR Compliance': 'eudrCompliance',
      'Risk Management': 'riskManagement',
      'Geolocation Data': 'geolocationData',
      'Country Risk': 'countryRisk',
      'Plantation Risk Assessment': 'plantationRiskAssessment',
      'Harvest Information': 'harvestInformation',
      'Legal Compliance': 'legalCompliance',
      'Third-Party Verification': 'thirdPartyVerification',
      'Sustainability Reporting': 'sustainabilityReporting',
      'Social & Environmental Impact': 'socialImpact',
      'Social Safeguards': 'socialSafeguards',
      'Risk Mitigation': 'riskMitigation',
      'Declaration & Confirmation': 'declaration',
      'Risk Scoring (Non-EU)': 'riskScoringNonEU',
      'Risk-Based Actions (High Risk Only)': 'riskBasedActions',
      'Monitoring & Review': 'monitoringReview',
    };

    return sectionKeyMap[section] || section.toLowerCase().replace(/\s+/g, '');
  };

  // Helper to get translated option label using reverse lookup from EN resource bundle
  const getOptionLabel = (
    fieldKey: string,
    optionValue: string,
    translationKey?: string
  ): string => {
    const optKey = translationKey || fieldKey;
    const enOptions = i18n.getResourceBundle('en', 'riskAssessments')
      ?.fieldOptions?.[optKey];
    if (enOptions && typeof enOptions === 'object') {
      const match = Object.entries(enOptions).find(
        ([, val]) => val === optionValue
      );
      if (match) {
        return t(`riskAssessments:fieldOptions.${optKey}.${match[0]}`);
      }
    }
    return optionValue;
  };

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // State management
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [status, setStatus] = useState<
    | 'DRAFT'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'REQUIRES_REVIEW'
    | 'APPROVED'
    | 'REJECTED'
  >('DRAFT');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Versioning state
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [createVersionOpen, setCreateVersionOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null
  );

  // Hooks
  const { data: riskAssessment, isLoading, error } = useRiskAssessment(id!);

  const updateRiskAssessment = useUpdateRiskAssessment();
  const calculateRisk = useCalculateRisk();

  // Versioning hooks
  const { data: versionHistory } = useVersionHistory(id!);
  const createVersionMutation = useCreateVersion();
  const { data: versionComparison } = useCompareVersions(
    id!,
    selectedVersionId || ''
  );
  const restoreVersionMutation = useRestoreVersion();

  // Survey documents hook (only fetches when a linked survey exists)
  const { data: surveyDocuments } = useSurveyDocuments(
    id!,
    !!riskAssessment?.sourceSurveyInstanceId
  );
  const totalDocumentCount =
    surveyDocuments?.sections?.reduce((sum, s) => sum + s.files.length, 0) ?? 0;

  // Initialize form data when assessment loads
  useEffect(() => {
    if (riskAssessment) {
      setResponses(riskAssessment.responses || {});
      setStatus(riskAssessment.status);
    }
  }, [riskAssessment]);

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info'
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        t('riskAssessments:edit.unsavedChanges')
      );
      if (!confirmLeave) return;
    }
    navigate(`/risk-assessments/${id}`);
  };

  const handleResponseChange = (field: string, value: unknown) => {
    setResponses(prev => {
      const newResponses = {
        ...prev,
        [field]: value,
      };

      if (!isEUSupplier && field.includes('RiskScore')) {
        const weights = {
          countryRiskScore: 0,
          deforestationRiskScore: 0.3,
          legalRiskScore: 0.1,
          speciesRiskScore: 0.05,
          socialRiskScore: 0.03,
          certificationRiskScore: 0.02,
        };

        let totalScore = 0;
        let hasAllScores = true;

        Object.entries(weights).forEach(([scoreField, weight]) => {
          const score = newResponses[scoreField];
          if (score && typeof score === 'string') {
            const numericScore = parseInt(score);
            if (!isNaN(numericScore)) {
              totalScore += numericScore * weight;
              newResponses[`${scoreField.replace('Score', 'Weight')}`] =
                numericScore * weight;
            } else {
              hasAllScores = false;
            }
          } else {
            hasAllScores = false;
          }
        });

        if (hasAllScores && totalScore > 0) {
          newResponses['overallRiskScore'] = totalScore;

          let riskLevel = 'LOW (1.0-2.0)';
          if (totalScore > 3.5) {
            riskLevel = 'HIGH (3.6-5.0)';
          } else if (totalScore > 2.0) {
            riskLevel = 'MEDIUM (2.1-3.5)';
          }

          newResponses['overallRiskLevel'] = riskLevel;
        }
      }

      return newResponses;
    });
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      await updateRiskAssessment.mutateAsync({
        id,
        data: {
          responses,
          status,
        },
      });
      setHasUnsavedChanges(false);
      showSnackbar(t('riskAssessments:messages.saved'), 'success');
    } catch (error) {
      console.error('Failed to save risk assessment:', error);
      showSnackbar(t('riskAssessments:messages.saveError'), 'error');
    }
  };

  const handleCalculateRisk = async () => {
    if (!id) return;

    try {
      await calculateRisk.mutateAsync(id);
      showSnackbar(t('riskAssessments:messages.riskCalculated'), 'success');
    } catch (error) {
      console.error('Failed to calculate risk:', error);
      showSnackbar(t('riskAssessments:messages.riskCalculateError'), 'error');
    }
  };

  // Versioning handlers
  const handleViewVersion = (versionId: string) => {
    navigate(`/risk-assessments/${versionId}`);
  };

  const handleCompareVersion = (versionId: string) => {
    setSelectedVersionId(versionId);
    setCompareOpen(true);
  };

  const handleRestoreVersion = (versionId: string) => {
    setSelectedVersionId(versionId);
    setRestoreOpen(true);
  };

  const handleCreateVersion = async (versionNotes: string) => {
    if (!id) return;

    try {
      await createVersionMutation.mutateAsync({
        id,
        data: {
          updates: { responses, status },
          versionNotes,
        },
      });
      setCreateVersionOpen(false);
      showSnackbar(t('riskAssessments:versioning.versionCreated'), 'success');
    } catch (error) {
      console.error('Failed to create version:', error);
      showSnackbar(t('riskAssessments:versioning.versionCreateError'), 'error');
      throw error;
    }
  };

  const handleConfirmRestore = async (versionNotes: string) => {
    if (!id || !selectedVersionId) return;

    try {
      await restoreVersionMutation.mutateAsync({
        id,
        versionId: selectedVersionId,
        versionNotes,
      });
      setRestoreOpen(false);
      setSelectedVersionId(null);
      showSnackbar(t('riskAssessments:versioning.versionRestored'), 'success');
    } catch (error) {
      console.error('Failed to restore version:', error);
      showSnackbar(
        t('riskAssessments:versioning.versionRestoreError'),
        'error'
      );
      throw error;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'REQUIRES_REVIEW':
        return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'REJECTED':
        return <XCircle size={16} className="text-red-600" />;
      case 'IN_PROGRESS':
        return <Clock size={16} className="text-blue-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  if (!id) {
    return (
      <Box p={3}>
        <Alert severity="error">
          {t('riskAssessments:detail.idNotProvided')}
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !riskAssessment) {
    return (
      <Box p={3}>
        <Alert severity="error">{t('riskAssessments:detail.loadError')}</Alert>
      </Box>
    );
  }

  if (riskAssessment.status === 'APPROVED') {
    return (
      <Box p={3}>
        <Alert severity="warning">{t('riskAssessments:edit.approved')}</Alert>
        <Button
          sx={{ mt: 2 }}
          onClick={() => navigate(`/risk-assessments/${id}`)}
        >
          {t('riskAssessments:edit.viewAssessment')}
        </Button>
      </Box>
    );
  }

  // Define form fields based on assessment type
  const isEUSupplier = riskAssessment.type === 'EU_SUPPLIER';

  const fullSurveyFields: FormField[] = [
    // Supplier Information
    {
      key: 'companyName',
      label: 'Company Name',
      type: 'text',
      section: 'Supplier Information',
      required: true,
    },
    {
      key: 'registeredAddress',
      label: 'Registered Address',
      type: 'textarea',
      section: 'Supplier Information',
      required: true,
    },
    {
      key: 'vatEoriNumber',
      label: 'VAT/EORI Number',
      type: 'text',
      section: 'Supplier Information',
      required: true,
    },
    {
      key: 'contactPerson',
      label: 'Contact Person',
      type: 'text',
      section: 'Supplier Information',
      required: true,
    },
    {
      key: 'email',
      label: 'Email',
      type: 'text',
      section: 'Supplier Information',
      required: true,
    },
    {
      key: 'phone',
      label: 'Phone',
      type: 'text',
      section: 'Supplier Information',
      required: true,
    },
    {
      key: 'website',
      label: 'Website',
      type: 'text',
      section: 'Supplier Information',
    },

    // Product Information
    {
      key: 'productName',
      label: 'Product Name',
      type: 'text',
      section: 'Product Information',
      required: true,
    },
    {
      key: 'hsCnCode',
      label: 'HS/CN Code',
      type: 'text',
      section: 'Product Information',
      required: true,
    },
    {
      key: 'productDescription',
      label: 'Description',
      type: 'textarea',
      section: 'Product Information',
      required: true,
    },
    {
      key: 'materialType',
      label: 'Material Type',
      type: 'text',
      section: 'Product Information',
      required: true,
    },
    {
      key: 'intendedUse',
      label: 'Intended Use',
      type: 'text',
      section: 'Product Information',
      required: true,
    },

    // Origin Declaration
    {
      key: 'originClassification',
      label: 'Primary Origin Classification',
      type: 'select',
      section: 'Origin Declaration',
      required: true,
      options: ['EU Origin Only', 'Non-EU Origin', 'Mixed Origin'],
    },
    {
      key: 'euMemberStates',
      label: 'EU Member State(s) of Origin',
      type: 'textarea',
      section: 'Origin Declaration',
    },
    {
      key: 'geolocationAvailable',
      label: 'Geolocation Data Available',
      type: 'select',
      section: 'Origin Declaration',
      options: [
        'Yes - GPS coordinates/polygons provided',
        'No - Available upon request',
        'Not applicable (EU origin only)',
      ],
    },

    // Species Information
    {
      key: 'primarySpeciesScientific',
      label: 'Primary Species - Scientific Name',
      type: 'text',
      section: 'Species Information',
      required: true,
    },
    {
      key: 'primarySpeciesCommon',
      label: 'Primary Species - Common Name',
      type: 'text',
      section: 'Species Information',
      required: true,
    },
    {
      key: 'primarySpeciesPercentage',
      label: 'Primary Species - Percentage',
      type: 'number',
      section: 'Species Information',
      required: true,
    },
    {
      key: 'secondarySpeciesScientific',
      label: 'Secondary Species - Scientific Name',
      type: 'text',
      section: 'Species Information',
    },
    {
      key: 'secondarySpeciesCommon',
      label: 'Secondary Species - Common Name',
      type: 'text',
      section: 'Species Information',
    },
    {
      key: 'secondarySpeciesPercentage',
      label: 'Secondary Species - Percentage',
      type: 'number',
      section: 'Species Information',
    },

    // Certification Status
    {
      key: 'forestCertifications',
      label: 'Forest Management Certifications',
      type: 'multiselect',
      section: 'Certification Status',
      options: ['FSC', 'PEFC', 'Other', 'No Certification'],
    },
    {
      key: 'fscLicenseNumber',
      label: 'FSC Number',
      type: 'text',
      section: 'Certification Status',
    },
    {
      key: 'pefcLicenseNumber',
      label: 'PEFC License Number',
      type: 'text',
      section: 'Certification Status',
    },
    {
      key: 'chainOfCustody',
      label: 'Chain of Custody Certifications',
      type: 'multiselect',
      section: 'Certification Status',
      options: ['FSC CoC', 'PEFC CoC', 'Other CoC'],
    },
    {
      key: 'fscCocNumber',
      label: 'FSC CoC Certificate Number',
      type: 'text',
      section: 'Certification Status',
    },
    {
      key: 'pefcCocNumber',
      label: 'PEFC CoC Certificate Number',
      type: 'text',
      section: 'Certification Status',
    },

    // EUDR Compliance Declarations
    {
      key: 'deforestationDeclaration',
      label:
        'I declare that these products were not produced on land deforested after 31 December 2020',
      type: 'checkbox',
      section: 'EUDR Compliance',
      required: true,
    },
    {
      key: 'legalityDeclaration',
      label:
        'I declare that these products were produced in accordance with applicable legislation',
      type: 'checkbox',
      section: 'EUDR Compliance',
      required: true,
    },
    {
      key: 'dueDiligenceStatement',
      label:
        'I have conducted appropriate due diligence to verify EUDR compliance',
      type: 'checkbox',
      section: 'EUDR Compliance',
      required: true,
    },

    // Risk Management
    {
      key: 'riskAssessmentConducted',
      label: 'Risk Assessment Conducted',
      type: 'select',
      section: 'Risk Management',
      required: true,
      options: ['Yes', 'No'],
    },
    {
      key: 'riskLevel',
      label: 'Risk Level',
      type: 'select',
      section: 'Risk Management',
      options: ['Negligible', 'Low', 'Standard', 'High'],
    },
    {
      key: 'supportingDocuments',
      label: 'Supporting Documentation Available',
      type: 'multiselect',
      section: 'Risk Management',
      options: [
        'Harvest permits',
        'Land ownership documents',
        'Satellite monitoring reports',
        'Third-party audit reports',
        'Supply chain documentation',
        'Other',
      ],
    },
    {
      key: 'cooperationCommitment',
      label: 'Cooperation Commitment',
      type: 'multiselect',
      section: 'Risk Management',
      options: [
        'Provide additional evidence if requested',
        'Available for independent audits',
        'Can provide updated geolocation data',
        'Committed to ongoing EUDR compliance monitoring',
      ],
    },
  ];

  const simpleSurveyFields: FormField[] = [
    // Basic Information
    {
      key: 'assessmentDate',
      label: 'Assessment Date',
      type: 'date',
      section: 'Basic Information',
      required: true,
    },
    {
      key: 'assessor',
      label: 'Assessor',
      type: 'text',
      section: 'Basic Information',
      required: true,
    },
    {
      key: 'supplierName',
      label: 'Supplier Name',
      type: 'text',
      section: 'Basic Information',
      required: true,
    },
    {
      key: 'productsAssessed',
      label: 'Products Assessed (Product Codes)',
      type: 'textarea',
      section: 'Basic Information',
      required: true,
    },

    // Plantation Risk Assessment
    {
      key: 'plantationRiskAssessments',
      label: 'Plantation Risk Assessments',
      type: 'plantation_multi_entry',
      section: 'Plantation Risk Assessment',
      required: true,
      placeholder: 'Auto-populated from survey data',
    },
    {
      key: 'countrySummary',
      label: 'Country Summary',
      type: 'readonly',
      section: 'Plantation Risk Assessment',
      required: false,
    },

    // Legal Compliance
    {
      key: 'harvestingLicense',
      label: 'Harvesting License/Permit',
      type: 'select',
      section: 'Legal Compliance',
      required: true,
      options: [
        'Valid - Verified',
        'Valid - Not verified',
        'Expired',
        'Not required',
        'Missing',
      ],
    },
    {
      key: 'landOwnershipDocs',
      label: 'Land Ownership Documents',
      type: 'select',
      section: 'Legal Compliance',
      required: true,
      options: ['Complete', 'Partial', 'Missing', 'Not applicable'],
    },
    {
      key: 'environmentalPermits',
      label: 'Environmental Permits',
      type: 'select',
      section: 'Legal Compliance',
      required: true,
      options: ['All obtained', 'Some missing', 'Not required', 'Unknown'],
    },
    {
      key: 'transportDocuments',
      label: 'Transport/Export Documents',
      type: 'select',
      section: 'Legal Compliance',
      required: true,
      options: ['Complete', 'Partial', 'Missing'],
    },
    {
      key: 'taxComplianceStatus',
      label: 'Tax Compliance Status',
      type: 'select',
      section: 'Legal Compliance',
      required: true,
      options: ['Compliant', 'Outstanding issues', 'Unknown'],
    },
    {
      key: 'knownViolations',
      label: 'Known violations',
      type: 'select',
      section: 'Legal Compliance',
      required: true,
      options: ['NONE', 'RESOLVED', 'ONGOING', 'UNKNOWN'],
    },

    // Wood Species Verification
    {
      key: 'primarySpeciesScientificName',
      label: 'Primary Species - Scientific Name',
      type: 'text',
      section: 'Plantation Risk Assessment',
      required: true,
    },
    {
      key: 'primarySpeciesCommonNames',
      label: 'Primary Species - Common Name(s)',
      type: 'text',
      section: 'Plantation Risk Assessment',
      required: true,
    },
    {
      key: 'primarySpeciesCitesStatus',
      label: 'Primary Species - CITEC Status',
      type: 'select',
      section: 'Plantation Risk Assessment',
      required: true,
      options: ['NOT LISTED', 'APPENDIX I', 'APPENDIX II', 'APPENDIX III'],
      optionsTranslationKey: 'citesStatus',
    },
    {
      key: 'primarySpeciesVolume',
      label: 'Primary Species - Percentage by Volume',
      type: 'number',
      section: 'Plantation Risk Assessment',
      required: true,
    },

    // Social Safeguards Assessment
    {
      key: 'indigenousPeoplesFpicStatus',
      label: 'Indigenous Peoples & FPIC Status',
      type: 'select',
      section: 'Social Safeguards',
      required: true,
      options: [
        'NOT APPLICABLE - NO INDIGENOUS TERRITORIES',
        'FPIC OBTAINED - DOCUMENTATION VERIFIED',
        'FPIC OBTAINED - DOCUMENTATION PARTIAL',
        'FPIC IN PROGRESS',
        'FPIC NOT OBTAINED - RISK IDENTIFIED',
      ],
    },
    {
      key: 'childLaborRisk',
      label: 'Child Labor Risk',
      type: 'select',
      section: 'Social Safeguards',
      required: true,
      options: ['NO RISK', 'LOW', 'MEDIUM', 'HIGH'],
      optionsTranslationKey: 'laborRisk',
    },
    {
      key: 'forcedLaborRisk',
      label: 'Forced Labor Risk',
      type: 'select',
      section: 'Social Safeguards',
      required: true,
      options: ['NO RISK', 'LOW', 'MEDIUM', 'HIGH'],
      optionsTranslationKey: 'laborRisk',
    },
    {
      key: 'humanRightsDueDiligence',
      label: 'Human Rights Due Diligence',
      type: 'select',
      section: 'Social Safeguards',
      required: true,
      options: ['CONDUCTED', 'BASIC', 'NOT CONDUCTED'],
    },

    // Certification & Standards
    {
      key: 'fscForestManagementStatus',
      label: 'FSC Forest Management Status',
      type: 'select',
      section: 'Certification & Standards',
      options: ['CERTIFIED', 'NOT CERTIFIED'],
      optionsTranslationKey: 'certificationStatus',
    },
    {
      key: 'fscCertificateNumber',
      label: 'FSC Certificate Number',
      type: 'text',
      section: 'Certification & Standards',
    },
    {
      key: 'fscValidityDate',
      label: 'FSC Validity Date',
      type: 'date',
      section: 'Certification & Standards',
    },
    {
      key: 'fscScopeCoverage',
      label: 'FSC Scope Coverage (%)',
      type: 'number',
      section: 'Certification & Standards',
    },
    {
      key: 'pefcForestManagementStatus',
      label: 'PEFC Forest Management Status',
      type: 'select',
      section: 'Certification & Standards',
      options: ['CERTIFIED', 'NOT CERTIFIED'],
      optionsTranslationKey: 'certificationStatus',
    },
    {
      key: 'pefcCertificateNumber',
      label: 'PEFC Certificate Number',
      type: 'text',
      section: 'Certification & Standards',
    },
    {
      key: 'pefcValidityDate',
      label: 'PEFC Validity Date',
      type: 'date',
      section: 'Certification & Standards',
    },
    {
      key: 'pefcScopeCoverage',
      label: 'PEFC Scope Coverage (%)',
      type: 'number',
      section: 'Certification & Standards',
    },

    // Risk-Based Action Requirements (conditional - high risk only)
    {
      key: 'enhancedSupplyChainMapping',
      label: 'Enhanced Supply Chain Mapping Required',
      type: 'select',
      section: 'Risk-Based Actions (High Risk Only)',
      options: ['YES', 'NO'],
      optionsTranslationKey: 'yesNo',
    },
    {
      key: 'independentVerification',
      label: 'Independent Third-Party Verification Required',
      type: 'select',
      section: 'Risk-Based Actions (High Risk Only)',
      options: ['YES', 'NO'],
      optionsTranslationKey: 'yesNo',
    },
    {
      key: 'increasedMonitoringFrequency',
      label: 'Increased Monitoring Frequency',
      type: 'select',
      section: 'Risk-Based Actions (High Risk Only)',
      options: ['Monthly', 'Bi-weekly', 'Weekly'],
      optionsTranslationKey: 'monitoringFrequencyIncreased',
    },
    {
      key: 'additionalDocumentation',
      label: 'Additional Documentation Required',
      type: 'multiselect',
      section: 'Risk-Based Actions (High Risk Only)',
      options: [
        'Updated harvest permits',
        'Recent satellite imagery',
        'Independent audit reports',
        'Community consultation records',
        'FPIC documentation',
      ],
    },
    {
      key: 'riskMitigationPlan',
      label: 'Risk Mitigation Plan',
      type: 'textarea',
      section: 'Risk-Based Actions (High Risk Only)',
    },
    {
      key: 'reviewSchedule',
      label: 'Review Schedule (months)',
      type: 'number',
      section: 'Risk-Based Actions (High Risk Only)',
    },

    {
      key: 'standardMonitoringFrequency',
      label: 'Standard Monitoring Frequency',
      type: 'select',
      section: 'Monitoring & Review',
      required: true,
      options: ['Quarterly', 'Bi-annually', 'Annually'],
      optionsTranslationKey: 'monitoringFrequencyStandard',
    },
    {
      key: 'keyPerformanceIndicators',
      label: 'Key Performance Indicators',
      type: 'multiselect',
      section: 'Monitoring & Review',
      options: [
        'Forest cover maintenance',
        'Legal compliance status',
        'Certification validity',
        'Supply chain traceability',
        'Social compliance',
      ],
    },
    {
      key: 'alertThresholds',
      label: 'Alert Thresholds',
      type: 'textarea',
      section: 'Monitoring & Review',
    },
    {
      key: 'reportingRequirements',
      label: 'Reporting Requirements',
      type: 'multiselect',
      section: 'Monitoring & Review',
      options: [
        'Monthly deforestation alerts',
        'Quarterly compliance reports',
        'Annual risk assessment updates',
        'Incident reports',
      ],
    },
    {
      key: 'nextReviewDate',
      label: 'Next Review Date',
      type: 'date',
      section: 'Monitoring & Review',
      required: true,
    },
  ];

  const fields = isEUSupplier ? fullSurveyFields : simpleSurveyFields;
  const sections = [...new Set(fields.map(f => f.section).filter(Boolean))];

  const requiredFields = fields.filter(f => f.required);
  const completedRequiredFields = requiredFields.filter(field => {
    const value = responses[field.key];
    return (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      !(Array.isArray(value) && value.length === 0)
    );
  });
  const completionPercentage =
    requiredFields.length > 0
      ? (completedRequiredFields.length / requiredFields.length) * 100
      : 0;

  const renderField = (field: FormField) => {
    const value = responses[field.key] || '';
    const isRequired = field.required;
    const fieldLabel = t(`riskAssessments:formFields.${field.key}`);

    if (field.key === 'productsAssessed') {
      const selectedProducts = Array.isArray(value) ? value : [];

      return (
        <VirtualizedProductSelect
          key={field.key}
          supplierId={riskAssessment.supplierId}
          value={selectedProducts}
          onChange={products => handleResponseChange(field.key, products)}
          label={fieldLabel}
          required={isRequired}
        />
      );
    }

    switch (field.type) {
      case 'select':
        return (
          <FormControl fullWidth key={field.key} required={isRequired}>
            <InputLabel>{fieldLabel}</InputLabel>
            <Select
              value={value as string}
              onChange={e => handleResponseChange(field.key, e.target.value)}
              label={fieldLabel}
            >
              {field.options?.map(option => (
                <MenuItem key={option} value={option}>
                  {getOptionLabel(
                    field.key,
                    option,
                    field.optionsTranslationKey
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'multiselect':
        return (
          <FormControl fullWidth key={field.key} required={isRequired}>
            <InputLabel>{fieldLabel}</InputLabel>
            <Select
              multiple
              value={(value as string[]) || []}
              onChange={e => handleResponseChange(field.key, e.target.value)}
              label={fieldLabel}
              renderValue={selected => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map(val => (
                    <Chip
                      key={val}
                      label={getOptionLabel(
                        field.key,
                        val,
                        field.optionsTranslationKey
                      )}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {field.options?.map(option => (
                <MenuItem key={option} value={option}>
                  {getOptionLabel(
                    field.key,
                    option,
                    field.optionsTranslationKey
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'textarea':
        if (field.key === 'registeredAddress') {
          const addrStr = (value as string) || '';
          return (
            <Box key={field.key}>
              <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                {fieldLabel}
                {isRequired ? ' *' : ''}
              </Typography>
              <AddressAutocomplete
                compact
                value={{
                  street: addrStr,
                  city: '',
                  postalCode: '',
                  country: '',
                  formatted: addrStr,
                }}
                onChange={(parsed: ParsedAddress) => {
                  handleResponseChange(field.key, parsed.formatted);
                }}
                labels={{
                  search: t('settings:fields.searchAddress', {
                    defaultValue: 'Search address…',
                  }),
                }}
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                value={addrStr}
                onChange={e => handleResponseChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          );
        }
        return (
          <TextField
            key={field.key}
            fullWidth
            multiline
            rows={3}
            label={fieldLabel}
            value={value as string}
            onChange={e => handleResponseChange(field.key, e.target.value)}
            required={isRequired}
            placeholder={field.placeholder}
          />
        );
      case 'number': {
        // Determine if this number field should be compact (200px) or full-width
        // Compact: Risk scores (1-5 or 1-10 ratings)
        // Full-width: Areas, counts, coverage percentages, weight percentages
        const isCompactNumber =
          (field.key.toLowerCase().includes('riskscore') &&
            !field.key.toLowerCase().includes('overall')) ||
          (field.options &&
            field.options.length <= 5 &&
            field.options.every((opt: string) => /^[1-5]$/.test(opt)));

        return (
          <TextField
            key={field.key}
            fullWidth
            sx={{
              maxWidth: isCompactNumber ? '200px' : '100%',
            }}
            type="number"
            label={fieldLabel}
            value={value as number}
            onChange={e =>
              handleResponseChange(field.key, Number(e.target.value))
            }
            required={isRequired}
            placeholder={field.placeholder}
            inputProps={{
              step:
                field.key.includes('Score') || field.key.includes('Weight')
                  ? '0.1'
                  : '1',
              min: 0,
              max: field.key.includes('Score') ? 10 : undefined,
            }}
          />
        );
      }
      case 'date':
        return (
          <TextField
            key={field.key}
            fullWidth
            type="date"
            label={fieldLabel}
            value={value as string}
            onChange={e => handleResponseChange(field.key, e.target.value)}
            required={isRequired}
            InputLabelProps={{ shrink: true }}
          />
        );
      case 'checkbox':
        return (
          <FormControl key={field.key} required={isRequired}>
            <Box display="flex" alignItems="center" gap={1}>
              <input
                type="checkbox"
                checked={value as boolean}
                onChange={e =>
                  handleResponseChange(field.key, e.target.checked)
                }
              />
              <Typography variant="body2">{fieldLabel}</Typography>
            </Box>
          </FormControl>
        );
      case 'file':
        return (
          <FormControl fullWidth key={field.key} required={isRequired}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
            >
              {fieldLabel}
              <input
                type="file"
                hidden
                onChange={e =>
                  handleResponseChange(field.key, e.target.files?.[0])
                }
              />
            </Button>
            {value && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {(value as File).name}
              </Typography>
            )}
          </FormControl>
        );
      case 'readonly':
        // Display read-only country summary
        if (field.key === 'countrySummary') {
          const summary = value as Array<{
            country: string;
            plantationCount: number;
            totalArea: number;
            plantationIds: string[];
          }> | null;

          if (!summary || summary.length === 0) {
            return (
              <Alert severity="info" key={field.key}>
                No country summary available
              </Alert>
            );
          }

          return (
            <Card key={field.key} variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {fieldLabel}
              </Typography>
              <Stack spacing={1}>
                {summary.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {item.country}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.plantationCount} plantation(s) •{' '}
                      {item.totalArea.toFixed(2)} ha
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Card>
          );
        }
        return null;

      case 'plantation_multi_entry': {
        // Render plantation risk assessments with maps
        const plantations = (value as Array<PlantationRiskAssessment>) || [];

        if (plantations.length === 0) {
          return (
            <Alert severity="warning" key={field.key}>
              No plantation data found. Please ensure the survey includes
              plantation information with map data.
            </Alert>
          );
        }

        return (
          <Box key={field.key}>
            <Typography variant="h6" gutterBottom>
              {fieldLabel} ({plantations.length})
            </Typography>
            <Stack spacing={2}>
              {plantations.map((plantation, index) => (
                <Accordion
                  key={`plantation-${index}`}
                  defaultExpanded={index === 0}
                >
                  <AccordionSummary expandIcon={<ChevronDown />}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        width: '100%',
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        {plantation.plantationId || `Plantation ${index + 1}`}
                      </Typography>
                      <Chip
                        label={plantation.country || 'Unknown'}
                        size="small"
                        color={
                          plantation.countryMismatch ? 'warning' : 'default'
                        }
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 'auto' }}
                      >
                        {plantation.area
                          ? `${plantation.area} ha`
                          : 'Area unknown'}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      {/* Read-only plantation info */}
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 2,
                        }}
                      >
                        <TextField
                          label="Plantation ID"
                          value={plantation.plantationId || ''}
                          disabled
                          size="small"
                        />
                        <TextField
                          label="Owner"
                          value={plantation.owner || ''}
                          disabled
                          size="small"
                        />
                        <TextField
                          label="Country (Detected)"
                          value={plantation.country || ''}
                          disabled
                          size="small"
                        />
                        <TextField
                          label="Area (hectares)"
                          value={plantation.area || ''}
                          disabled
                          size="small"
                        />
                      </Box>

                      {/* Country mismatch warning */}
                      {plantation.countryMismatch && (
                        <Alert severity="warning">
                          ⚠️ Country Mismatch: Declared "
                          {plantation.countryDeclared}" but coordinates indicate
                          "{plantation.countryDerived}"
                        </Alert>
                      )}

                      {/* Map display */}
                      {plantation.geojson && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Plantation Location
                          </Typography>
                          <MapField
                            value={plantation.geojson}
                            config={{
                              mode: 'view',
                              showShapeInfo: true,
                              highlightShape: true,
                              enableZoom: true,
                              enablePan: true,
                              fitBounds: true,
                            }}
                            disabled={true}
                          />
                        </Box>
                      )}

                      {/* Risk assessment fields for this plantation */}
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 2,
                        }}
                      >
                        <FormControl fullWidth size="small">
                          <InputLabel>EU Risk Level</InputLabel>
                          <Select
                            value={plantation.euRiskLevel || ''}
                            onChange={e => {
                              const updated = [...plantations];
                              updated[index] = {
                                ...plantation,
                                euRiskLevel: e.target.value,
                              };
                              handleResponseChange(field.key, updated);
                            }}
                            label="EU Risk Level"
                          >
                            <MenuItem value="LOW">LOW</MenuItem>
                            <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                            <MenuItem value="HIGH">HIGH</MenuItem>
                          </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                          <InputLabel>Geolocation Data Quality</InputLabel>
                          <Select
                            value={plantation.geolocationProvided || ''}
                            onChange={e => {
                              const updated = [...plantations];
                              updated[index] = {
                                ...plantation,
                                geolocationProvided: e.target.value,
                              };
                              handleResponseChange(field.key, updated);
                            }}
                            label="Geolocation Data Quality"
                          >
                            <MenuItem value="Complete - GPS polygons">
                              Complete - GPS polygons
                            </MenuItem>
                            <MenuItem value="Partial - Approximate area">
                              Partial - Approximate area
                            </MenuItem>
                            <MenuItem value="Missing/Insufficient">
                              Missing/Insufficient
                            </MenuItem>
                          </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                          <InputLabel>Deforestation Alerts</InputLabel>
                          <Select
                            value={plantation.deforestationAlertsDetected || ''}
                            onChange={e => {
                              const updated = [...plantations];
                              updated[index] = {
                                ...plantation,
                                deforestationAlertsDetected: e.target.value,
                              };
                              handleResponseChange(field.key, updated);
                            }}
                            label="Deforestation Alerts"
                          >
                            <MenuItem value="None">None</MenuItem>
                            <MenuItem value="Resolved">Resolved</MenuItem>
                            <MenuItem value="Unresolved">Unresolved</MenuItem>
                            <MenuItem value="Confirmed">Confirmed</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Risk Assessment Notes"
                        placeholder="Additional observations for this plantation..."
                        value={plantation.notes || ''}
                        onChange={e => {
                          const updated = [...plantations];
                          updated[index] = {
                            ...plantation,
                            notes: e.target.value,
                          };
                          handleResponseChange(field.key, updated);
                        }}
                      />
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Box>
        );
      }
      default:
        return (
          <TextField
            key={field.key}
            fullWidth
            label={fieldLabel}
            value={value as string}
            onChange={e => handleResponseChange(field.key, e.target.value)}
            required={isRequired}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={handleBack}>
            <ArrowLeft size={20} />
          </IconButton>
          <IconButton
            onClick={() => setVersionHistoryOpen(true)}
            title={t('riskAssessments:versioning.versionHistory')}
          >
            <History size={20} />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              {t('riskAssessments:edit.title')}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {riskAssessment.supplier?.name ||
                t('riskAssessments:detail.unknownSupplier')}
              {riskAssessment.version && riskAssessment.version > 1 && (
                <Chip
                  label={`v${riskAssessment.version}`}
                  size="small"
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<GitBranch size={20} />}
            onClick={() => setCreateVersionOpen(true)}
            disabled={!riskAssessment.isLatestVersion}
          >
            {t('riskAssessments:versioning.createVersion')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Calculator size={20} />}
            onClick={handleCalculateRisk}
            disabled={calculateRisk.isPending}
          >
            {t('riskAssessments:edit.calculateRisk')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Save size={20} />}
            onClick={handleSave}
            disabled={!hasUnsavedChanges || updateRiskAssessment.isPending}
          >
            {updateRiskAssessment.isPending
              ? t('riskAssessments:edit.saving')
              : t('riskAssessments:edit.save')}
          </Button>
        </Stack>
      </Box>

      {/* Status and Progress */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Box display="flex" gap={2} alignItems="center">
              <Chip
                icon={getStatusIcon(riskAssessment.status)}
                label={t(
                  `riskAssessments:statusTypes.${riskAssessment.status}`
                )}
                color="info"
              />
            </Box>

            {completionPercentage > 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('riskAssessments:edit.formCompletion')}:{' '}
                  {Math.round(completionPercentage)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={completionPercentage}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            )}

            {hasUnsavedChanges && (
              <Alert severity="warning">
                {t('riskAssessments:edit.unsavedChangesInfo')}
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Tabs */}
      {riskAssessment.sourceSurveyInstanceId && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
          >
            <Tab label={t('riskAssessments:tabs.assessmentForm')} />
            <Tab
              label={
                <Badge
                  badgeContent={totalDocumentCount}
                  color="primary"
                  max={99}
                >
                  <Box sx={{ pr: totalDocumentCount > 0 ? 2 : 0 }}>
                    {t('riskAssessments:tabs.surveyDocuments')}
                  </Box>
                </Badge>
              }
            />
          </Tabs>
        </Box>
      )}

      {/* Tab 0: Form Fields */}
      {(activeTab === 0 || !riskAssessment.sourceSurveyInstanceId) && (
        <>
          {/* Form Fields */}
          {isEUSupplier ? (
            <Stack spacing={3}>
              {sections.map(section => (
                <Card key={section}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t(
                        `riskAssessments:sections.${getSectionTranslationKey(section)}`
                      )}
                    </Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: 2,
                      }}
                    >
                      {fields
                        .filter(field => field.section === section)
                        .map(field => {
                          // Determine if field should span full width
                          const isFullWidth =
                            (field.type === 'textarea' &&
                              field.key !== 'productsAssessed') ||
                            field.type === 'multiselect' ||
                            field.key.includes('Declaration') ||
                            field.key.includes('Statement') ||
                            field.key.includes('Description') ||
                            field.key.includes('Details') ||
                            field.key.includes('List') ||
                            field.key.includes('Address') ||
                            field.key.includes('MitigationPlan') ||
                            field.key.includes('Thresholds');

                          return (
                            <Box
                              key={field.key}
                              sx={{
                                gridColumn: isFullWidth
                                  ? { xs: '1', md: '1 / -1' }
                                  : 'span 1',
                              }}
                            >
                              {renderField(field)}
                            </Box>
                          );
                        })}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <Stack spacing={2}>
              {sections.map(section => {
                // Conditionally show Risk-Based Actions section only for HIGH risk
                if (section === 'Risk-Based Actions (High Risk Only)') {
                  const overallRiskLevel = responses[
                    'overallRiskLevel'
                  ] as string;
                  const isHighRisk = overallRiskLevel?.includes('HIGH');

                  if (!isHighRisk) {
                    return null;
                  }
                }

                // Count completed fields in this section
                const sectionFields = fields.filter(
                  field => field.section === section
                );
                const requiredSectionFields = sectionFields.filter(
                  f => f.required
                );
                const completedSectionFields = requiredSectionFields.filter(
                  field => {
                    const value = responses[field.key];
                    return (
                      value !== undefined &&
                      value !== null &&
                      value !== '' &&
                      !(Array.isArray(value) && value.length === 0)
                    );
                  }
                );

                return (
                  <Accordion key={section} defaultExpanded={false}>
                    <AccordionSummary expandIcon={<ChevronDown size={20} />}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                        pr={2}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="h6">
                            {t(
                              `riskAssessments:sections.${getSectionTranslationKey(section)}`
                            )}
                          </Typography>
                          {section ===
                            'Risk-Based Actions (High Risk Only)' && (
                            <Chip
                              label={t('riskAssessments:edit.highRiskOnly')}
                              size="small"
                              color="error"
                            />
                          )}
                        </Box>
                        {requiredSectionFields.length > 0 && (
                          <Chip
                            label={`${completedSectionFields.length}/${requiredSectionFields.length}`}
                            size="small"
                            color={
                              completedSectionFields.length ===
                              requiredSectionFields.length
                                ? 'success'
                                : 'default'
                            }
                          />
                        )}
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                          gap: 2,
                        }}
                      >
                        {fields
                          .filter(field => field.section === section)
                          .map(field => {
                            // Determine if field should span full width
                            const isFullWidth =
                              (field.type === 'textarea' &&
                                field.key !== 'productsAssessed') ||
                              field.type === 'multiselect' ||
                              field.key.includes('Declaration') ||
                              field.key.includes('Statement') ||
                              field.key.includes('Description') ||
                              field.key.includes('Details') ||
                              field.key.includes('Address') ||
                              field.key.includes('MitigationPlan') ||
                              field.key.includes('Thresholds');

                            return (
                              <Box
                                key={field.key}
                                sx={{
                                  gridColumn: isFullWidth
                                    ? { xs: '1', md: '1 / -1' }
                                    : 'span 1',
                                }}
                              >
                                {renderField(field)}
                              </Box>
                            );
                          })}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Stack>
          )}

          {/* Risk Information */}
          {(riskAssessment.overallRiskScore ||
            riskAssessment.riskBreakdown) && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('riskAssessments:edit.riskAssessmentResults')}
                </Typography>
                <Stack spacing={2}>
                  {riskAssessment.overallRiskScore && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t('riskAssessments:edit.overallRiskScore')}
                      </Typography>
                      <Typography variant="h4">
                        {riskAssessment.overallRiskScore.toFixed(1)}/10
                      </Typography>
                    </Box>
                  )}

                  {riskAssessment.riskBreakdown &&
                    Object.keys(riskAssessment.riskBreakdown).length > 0 && (
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Risk Breakdown
                        </Typography>
                        {Object.entries(riskAssessment.riskBreakdown).map(
                          ([category, score]) => (
                            <Box key={category} mb={1}>
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={0.5}
                              >
                                <Typography variant="body2">
                                  {category
                                    .replace(/_/g, ' ')
                                    .replace(/\b\w/g, l => l.toUpperCase())}
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {score.toFixed(1)}/10
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={score * 10}
                                color={
                                  score < 3
                                    ? 'success'
                                    : score < 7
                                      ? 'warning'
                                      : 'error'
                                }
                                sx={{ height: 4, borderRadius: 2 }}
                              />
                            </Box>
                          )
                        )}
                      </Box>
                    )}
                </Stack>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Tab 1: Survey Documents */}
      {activeTab === 1 && riskAssessment.sourceSurveyInstanceId && (
        <SurveyDocumentsPanel riskAssessmentId={id!} />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Version History Drawer */}
      <Drawer
        anchor="right"
        open={versionHistoryOpen}
        onClose={() => setVersionHistoryOpen(false)}
      >
        <Box sx={{ width: 450, p: 2 }}>
          <VersionHistory
            assessmentId={id || ''}
            versions={versionHistory || []}
            onViewVersion={handleViewVersion}
            onCompareVersion={handleCompareVersion}
            onRestoreVersion={handleRestoreVersion}
          />
        </Box>
      </Drawer>

      {/* Create Version Dialog */}
      <CreateVersionDialog
        open={createVersionOpen}
        onClose={() => setCreateVersionOpen(false)}
        onCreateVersion={handleCreateVersion}
        assessment={riskAssessment || null}
        isLoading={createVersionMutation.isPending}
      />

      {/* Version Comparison Dialog */}
      <VersionComparison
        open={compareOpen}
        onClose={() => {
          setCompareOpen(false);
          setSelectedVersionId(null);
        }}
        comparison={versionComparison || null}
      />

      {/* Restore Version Dialog */}
      <RestoreVersionDialog
        open={restoreOpen}
        onClose={() => {
          setRestoreOpen(false);
          setSelectedVersionId(null);
        }}
        onRestore={handleConfirmRestore}
        currentVersion={riskAssessment || null}
        versionToRestore={
          versionHistory?.find(v => v.id === selectedVersionId) || null
        }
        isLoading={restoreVersionMutation.isPending}
      />
    </Box>
  );
};

export default RiskAssessmentEdit;
