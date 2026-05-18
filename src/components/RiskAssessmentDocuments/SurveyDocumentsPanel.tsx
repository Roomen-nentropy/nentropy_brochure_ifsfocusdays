import React, { useCallback } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  ChevronDown,
  Download,
  FileText,
  Image,
  File,
  FileSpreadsheet,
  Map,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSurveyDocuments } from '../../hooks/useRiskAssessments';
import { riskAssessmentApiService } from '../../services/riskAssessmentApiService';

interface SurveyDocumentsPanelProps {
  riskAssessmentId: string;
}

/**
 * Format file size to a human-readable string.
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

/**
 * Get an icon for a file based on its MIME type.
 */
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return <Image size={20} />;
  }
  if (mimeType === 'application/pdf') {
    return <FileText size={20} />;
  }
  if (
    mimeType === 'application/vnd.google-earth.kml+xml' ||
    mimeType === 'application/geo+json' ||
    mimeType === 'application/json'
  ) {
    return <Map size={20} />;
  }
  if (
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel') ||
    mimeType === 'text/csv'
  ) {
    return <FileSpreadsheet size={20} />;
  }
  return <File size={20} />;
}

/**
 * Map section names to translation keys (mirrors the mapping in RiskAssessmentEdit).
 */
function getSectionTranslationKey(section: string): string {
  const sectionKeyMap: Record<string, string> = {
    'Plantation Risk Assessment': 'plantationRiskAssessment',
    'Legal Compliance': 'legalCompliance',
    'Social Safeguards': 'socialSafeguards',
    'Certification & Standards': 'certificationStandards',
    'Risk Management': 'riskManagement',
    'Other Documents': 'otherDocuments',
  };
  return sectionKeyMap[section] || section.toLowerCase().replace(/\s+/g, '');
}

const SurveyDocumentsPanel: React.FC<SurveyDocumentsPanelProps> = ({
  riskAssessmentId,
}) => {
  const { t } = useTranslation(['riskAssessments', 'common']);
  const { data, isLoading, error } = useSurveyDocuments(riskAssessmentId);

  const handleDownload = useCallback(
    async (fileId: string, filename: string) => {
      try {
        const url = await riskAssessmentApiService.getSurveyDocumentDownloadUrl(
          riskAssessmentId,
          fileId
        );
        // Open presigned URL in a new tab
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Failed to download document:', err);
      }
    },
    [riskAssessmentId]
  );

  if (isLoading) {
    return (
      <Stack spacing={2}>
        {[1, 2, 3].map(i => (
          <Box key={i}>
            <Skeleton
              variant="rectangular"
              height={56}
              sx={{ borderRadius: 1 }}
            />
          </Box>
        ))}
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert severity="error">{t('riskAssessments:documents.loadError')}</Alert>
    );
  }

  const sections = data?.sections || [];
  const totalFiles = sections.reduce((sum, s) => sum + s.files.length, 0);

  if (sections.length === 0 || totalFiles === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        {t('riskAssessments:documents.noDocuments')}
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Typography variant="h6">
          {t('riskAssessments:documents.title')}
        </Typography>
        <Chip
          label={t('riskAssessments:documents.fileCount', {
            count: totalFiles,
          })}
          size="small"
          color="primary"
          variant="outlined"
        />
      </Box>

      {sections.map(section => (
        <Accordion key={section.section} defaultExpanded>
          <AccordionSummary expandIcon={<ChevronDown size={20} />}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              pr={2}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                {t(
                  `riskAssessments:sections.${getSectionTranslationKey(section.section)}`,
                  { defaultValue: section.section }
                )}
              </Typography>
              <Chip label={section.files.length} size="small" color="default" />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <List dense disablePadding>
              {section.files.map(file => (
                <ListItem
                  key={file.id}
                  sx={{
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getFileIcon(file.mimeType)}
                  </ListItemIcon>
                  <ListItemText
                    primary={file.filename}
                    secondary={formatFileSize(file.fileSize)}
                    primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title={t('riskAssessments:documents.download')}>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleDownload(file.id, file.filename)}
                      >
                        <Download size={18} />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
};

export default SurveyDocumentsPanel;
