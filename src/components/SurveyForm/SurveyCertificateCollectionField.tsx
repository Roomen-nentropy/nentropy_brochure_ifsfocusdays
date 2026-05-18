import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  TextField,
  Typography,
  Box,
  FormControlLabel,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SurveyFileField from './SurveyFileField';
import type { FileInfo } from '../../types/survey.types';

interface Certificate {
  id: string;
  name: string;
  description?: string;
  applicableTo: string[];
}

interface CertificateData {
  hasIt: boolean;
  certNumber?: string;
  validityDate?: string;
  fileUrl?: string;
  files?: FileInfo[];
}

interface SurveyCertificateCollectionFieldProps {
  questionId: string;
  question?: string;
  required?: boolean;
  value: Record<string, CertificateData>;
  onChange: (value: Record<string, CertificateData>) => void;
  applicableCertificates: string[];
  certificates?: Certificate[];
  token?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

// Default certificates list matching server-side registry
const DEFAULT_CERTIFICATES: Certificate[] = [
  {
    id: 'grsb',
    name: 'Global Roundtable for Sustainable Beef (GRSB)',
    applicableTo: ['Cattle'],
  },
  { id: 'land_to_market', name: 'Land to Market', applicableTo: ['Cattle'] },
  {
    id: 'certified_humane',
    name: 'Certified Humane',
    applicableTo: ['Cattle'],
  },
  {
    id: 'gap',
    name: 'Global Animal Partnership (GAP)',
    applicableTo: ['Cattle'],
  },
  {
    id: 'fsc',
    name: 'Forest Stewardship Council (FSC)',
    applicableTo: ['Wood'],
  },
  {
    id: 'pefc',
    name: 'Programme for the Endorsement of Forest Certification (PEFC)',
    applicableTo: ['Wood'],
  },
  {
    id: 'rspo',
    name: 'Roundtable on Sustainable Palm Oil (RSPO)',
    applicableTo: ['Palm oil'],
  },
  {
    id: 'rainforest_alliance',
    name: 'Rainforest Alliance',
    applicableTo: ['Palm oil', 'Soya', 'Cocoa', 'Coffee'],
  },
  {
    id: 'rtrs',
    name: 'Round Table on Responsible Soy (RTRS)',
    applicableTo: ['Soya'],
  },
  { id: 'proterra', name: 'ProTerra', applicableTo: ['Soya'] },
  { id: 'europe_soya', name: 'Europe Soya', applicableTo: ['Soya'] },
  { id: 'fairtrade', name: 'Fairtrade', applicableTo: ['Cocoa', 'Coffee'] },
  { id: 'utz', name: 'UTZ', applicableTo: ['Cocoa', 'Coffee'] },
  { id: 'fair_rubber', name: 'Fair Rubber', applicableTo: ['Rubber'] },
  {
    id: 'regenerative_organic',
    name: 'Regenerative Organic Certified (ROC)',
    applicableTo: ['Cattle', 'Cocoa', 'Coffee'],
  },
  {
    id: 'eu_organic',
    name: 'EU Organic',
    applicableTo: ['Cattle', 'Cocoa', 'Coffee'],
  },
  {
    id: 'usda_organic',
    name: 'USDA Organic',
    applicableTo: ['Cattle', 'Cocoa', 'Coffee'],
  },
  { id: 'iscc', name: 'ISCC', applicableTo: ['Palm oil', 'Soya'] },
  { id: 'bonsucro', name: 'Bonsucro', applicableTo: ['Soya'] },
  { id: 'snv_soybean', name: 'SNV Soybean', applicableTo: ['Soya'] },
];

const SurveyCertificateCollectionField: React.FC<
  SurveyCertificateCollectionFieldProps
> = ({
  questionId,
  question,
  required = false,
  value = {},
  onChange,
  applicableCertificates = [],
  certificates = DEFAULT_CERTIFICATES,
  token,
  disabled = false,
  error = false,
  helperText,
}) => {
  const [expandedPanels, setExpandedPanels] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newExpanded = new Set<string>();
    Object.entries(value).forEach(([certId, data]) => {
      if (data.hasIt) {
        newExpanded.add(certId);
      }
    });
    setExpandedPanels(newExpanded);
  }, [value]);

  const handlePanelChange =
    (certId: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedPanels(prev => {
        const newSet = new Set(prev);
        if (isExpanded) {
          newSet.add(certId);
        } else {
          newSet.delete(certId);
        }
        return newSet;
      });
    };

  const handleCheckboxChange =
    (certId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      const newValue = {
        ...value,
        [certId]: {
          ...(value[certId] || {}),
          hasIt: checked,
        },
      };

      // Auto-expand when checked
      if (checked) {
        setExpandedPanels(prev => new Set(prev).add(certId));
      }

      onChange(newValue);
    };

  const handleFieldChange =
    (certId: string, field: keyof CertificateData) =>
    (newFieldValue: string | FileInfo[]) => {
      const newValue = {
        ...value,
        [certId]: {
          ...(value[certId] || { hasIt: true }),
          [field]: newFieldValue,
        },
      };
      onChange(newValue);
    };

  // Filter certificates to only show applicable ones
  const applicableCertificatesList = certificates.filter(cert =>
    applicableCertificates.includes(cert.id)
  );

  if (applicableCertificatesList.length === 0) {
    return (
      <Box sx={{ my: 2 }}>
        <Alert severity="info">
          Add products with HS codes to see applicable certificates
        </Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ my: 2 }}>
        <Typography variant="h6" gutterBottom>
          {question || 'Certificates'}
          {required && (
            <Typography component="span" color="error" sx={{ ml: 0.5 }}>
              *
            </Typography>
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Please indicate which certificates you have for the supplied products.
        </Typography>

        {error && helperText && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {helperText}
          </Alert>
        )}

        {applicableCertificatesList.map(cert => {
          const certData = value[cert.id] || { hasIt: false };
          const isExpanded = expandedPanels.has(cert.id);

          return (
            <Accordion
              key={cert.id}
              expanded={isExpanded}
              onChange={handlePanelChange(cert.id)}
              disabled={disabled}
              sx={{
                mb: 1,
                ...(error && {
                  borderColor: 'error.main',
                  borderWidth: 1,
                  borderStyle: 'solid',
                }),
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${cert.id}-content`}
                id={`${cert.id}-header`}
                onClick={e => {
                  if ((e.target as HTMLElement).closest('.MuiCheckbox-root')) {
                    e.stopPropagation();
                  }
                }}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={certData.hasIt || false}
                        onChange={handleCheckboxChange(cert.id)}
                        onClick={e => e.stopPropagation()}
                        disabled={disabled}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">{cert.name}</Typography>
                        {cert.description && (
                          <Typography variant="caption" color="text.secondary">
                            {cert.description}
                          </Typography>
                        )}
                      </Box>
                    }
                    sx={{ flexGrow: 1 }}
                  />
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                {certData.hasIt ? (
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    <TextField
                      label="Certificate Number"
                      value={certData.certNumber || ''}
                      onChange={e =>
                        handleFieldChange(cert.id, 'certNumber')(e.target.value)
                      }
                      disabled={disabled}
                      fullWidth
                      size="small"
                    />

                    <DatePicker
                      label="Validity Date"
                      value={
                        certData.validityDate
                          ? new Date(certData.validityDate)
                          : null
                      }
                      onChange={date => {
                        if (date) {
                          handleFieldChange(
                            cert.id,
                            'validityDate'
                          )(date.toISOString().split('T')[0]);
                        } else {
                          handleFieldChange(cert.id, 'validityDate')('');
                        }
                      }}
                      disabled={disabled}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                        },
                      }}
                    />

                    {token && (
                      <Box>
                        <SurveyFileField
                          id={`${questionId}_${cert.id}_file`}
                          question="Upload Certificate"
                          required={false}
                          value={certData.files || null}
                          onChange={(_, files) =>
                            handleFieldChange(cert.id, 'files')(files)
                          }
                          surveyToken={token}
                          disabled={disabled}
                        />
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Check the box above to provide certificate details
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </LocalizationProvider>
  );
};

export default SurveyCertificateCollectionField;
