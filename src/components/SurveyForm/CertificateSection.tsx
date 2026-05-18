import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  TextField,
  Button,
  Divider,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  Collapse,
} from '@mui/material';
import { ExternalLink, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { getCertificatesByIds, type Certificate } from '../../lib/certificates';
import SurveySelectField from './SurveySelectField';
import SurveyFileField from './SurveyFileField';
import type { FileInfo } from '../../types/survey.types';

interface CertificateSectionProps {
  surveyInstanceMetadata?: {
    applicableCertificates?: string[];
    commodityTypes?: string[];
  };
  responses: Record<string, unknown>;
  onChange: (responses: Record<string, unknown>) => void;
  disabled?: boolean;
  surveyToken?: string;
}

const CertificateSection: React.FC<CertificateSectionProps> = ({
  surveyInstanceMetadata,
  responses,
  onChange,
  disabled = false,
  surveyToken,
}) => {
  const [applicableCertificates, setApplicableCertificates] = useState<
    Certificate[]
  >([]);
  const [showOtherCertificates, setShowOtherCertificates] = useState(false);

  useEffect(() => {
    if (surveyInstanceMetadata?.applicableCertificates) {
      const certs = getCertificatesByIds(
        surveyInstanceMetadata.applicableCertificates
      );
      setApplicableCertificates(certs);
    }
  }, [surveyInstanceMetadata]);

  const handleCertificateChange = (
    certId: string,
    field: string,
    value: unknown
  ) => {
    const key = `cert_${certId}_${field}`;
    onChange({
      ...responses,
      [key]: value,
    });
  };

  const commodityTypes = surveyInstanceMetadata?.commodityTypes || [];

  if (applicableCertificates.length === 0 && !showOtherCertificates) {
    return (
      <Box sx={{ my: 3 }}>
        <Alert severity="info">
          No specific certifications identified based on your product types.
          <Button
            size="small"
            sx={{ ml: 2 }}
            onClick={() => setShowOtherCertificates(true)}
          >
            Add Certifications Manually
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ my: 3 }}>
      <Typography variant="h6" gutterBottom>
        Certifications
      </Typography>

      {commodityTypes.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Based on your products ({commodityTypes.join(', ')}), the following
          certifications are relevant. Please indicate which you hold:
        </Alert>
      )}

      <Stack spacing={2}>
        {applicableCertificates.map(cert => {
          const hasCert = responses[`cert_${cert.id}_has`] as string;
          const certNumber =
            (responses[`cert_${cert.id}_number`] as string) || '';
          const validity = responses[`cert_${cert.id}_validity`] as unknown;
          const coverage =
            (responses[`cert_${cert.id}_coverage`] as string) || '';
          const files =
            (responses[`cert_${cert.id}_files`] as FileInfo[]) || [];

          return (
            <Paper key={cert.id} sx={{ p: 2 }}>
              <Stack spacing={2}>
                {/* Certificate Header */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box flex={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1" fontWeight="bold">
                        {cert.name}
                      </Typography>
                      {cert.website && (
                        <IconButton
                          size="small"
                          href={cert.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink size={16} />
                        </IconButton>
                      )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {cert.description}
                    </Typography>
                    <Box mt={0.5}>
                      {cert.applicableTo.map(commodity => (
                        <Chip
                          key={commodity}
                          label={commodity}
                          size="small"
                          sx={{ mr: 0.5, mt: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ maxWidth: 300 }}>
                  <SurveySelectField
                    id={`cert_${cert.id}_has`}
                    question="Do you hold this certificate?"
                    required={false}
                    options={['yes', 'no']}
                    value={hasCert}
                    onChange={(_id, value) =>
                      handleCertificateChange(cert.id, 'has', value)
                    }
                    disabled={disabled}
                  />
                </Box>

                {/* Certificate Details (shown if "yes") */}
                <Collapse in={hasCert === 'yes'}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                      gap: 2,
                      mt: 2,
                      p: 2,
                      backgroundColor: 'action.hover',
                      borderRadius: 1,
                    }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label="Certificate Number"
                      value={certNumber}
                      onChange={e =>
                        handleCertificateChange(
                          cert.id,
                          'number',
                          e.target.value
                        )
                      }
                      disabled={disabled}
                      placeholder="e.g., FSC-C123456"
                    />

                    <DatePicker
                      label="Validity Date"
                      // @ts-expect-error - DatePicker expects Dayjs, responses may have Date
                      value={validity || null}
                      onChange={date =>
                        handleCertificateChange(cert.id, 'validity', date)
                      }
                      disabled={disabled}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Coverage %"
                      value={coverage}
                      onChange={e =>
                        handleCertificateChange(
                          cert.id,
                          'coverage',
                          e.target.value
                        )
                      }
                      disabled={disabled}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">%</InputAdornment>
                        ),
                      }}
                      inputProps={{
                        min: 0,
                        max: 100,
                      }}
                      placeholder="e.g., 100"
                    />

                    {/* File Upload - Multiple files supported */}
                    <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                      <SurveyFileField
                        id={`cert_${cert.id}_files`}
                        question="Upload Certificate Documents"
                        required={false}
                        value={files}
                        onChange={(_id, value) =>
                          handleCertificateChange(cert.id, 'files', value)
                        }
                        disabled={disabled}
                        surveyToken={surveyToken}
                        multiple={true}
                        acceptedTypes=".pdf,.jpg,.jpeg,.png"
                      />
                    </Box>

                    {cert.verificationUrl && (
                      <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                        <Typography variant="caption" color="text.secondary">
                          Verify certificate at:{' '}
                          <a
                            href={cert.verificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {cert.verificationUrl}
                          </a>
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </Stack>
            </Paper>
          );
        })}

        {/* Option to add other certificates */}
        <Divider sx={{ my: 2 }}>
          <Chip label="Other Certifications" />
        </Divider>

        <Button
          variant="outlined"
          startIcon={
            showOtherCertificates ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )
          }
          onClick={() => setShowOtherCertificates(!showOtherCertificates)}
          sx={{ alignSelf: 'flex-start' }}
        >
          {showOtherCertificates ? 'Hide' : 'Show'} Other Certificates
        </Button>

        <Collapse in={showOtherCertificates}>
          <Alert severity="info" sx={{ mt: 2 }}>
            If you hold other certifications not listed above, please add them
            manually below.
          </Alert>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Plus size={16} />}
              onClick={() => {
                // TODO: Implement add custom certificate functionality
                console.log('Add custom certificate');
              }}
              disabled={disabled}
            >
              Add Custom Certificate
            </Button>
          </Box>
        </Collapse>
      </Stack>
    </Box>
  );
};

export default CertificateSection;
