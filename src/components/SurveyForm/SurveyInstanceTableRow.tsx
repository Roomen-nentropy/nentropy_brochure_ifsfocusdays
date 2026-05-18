import React from 'react';
import {
  TableRow,
  TableCell,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import { Eye, Download, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  getStatusLabel,
  getStatusColor,
  calculateCompletionPercentage,
  formatDate,
  getTimeRemaining,
} from '../../lib/survey-utils';
import type { SurveyInstance } from '../../types/survey.types';

interface SurveyInstanceTableRowProps {
  instance: SurveyInstance;
  onViewResponses: (instance: SurveyInstance) => void;
  onExportMenuOpen: (
    event: React.MouseEvent<HTMLElement>,
    instance: SurveyInstance
  ) => void;
  onCopyLink?: (token: string) => void;
}

const SurveyInstanceTableRow: React.FC<SurveyInstanceTableRowProps> = ({
  instance,
  onViewResponses,
  onExportMenuOpen,
  onCopyLink,
}) => {
  const { t } = useTranslation('surveyForm');

  const completionPercentage =
    (instance.responses ?? []).length > 0
      ? (() => {
          const responsesRecord: Record<
            string,
            string | number | boolean | string[]
          > = {};
          (instance.responses ?? []).forEach(response => {
            try {
              responsesRecord[response.questionId] = JSON.parse(
                response.response
              );
            } catch {
              responsesRecord[response.questionId] = response.response;
            }
          });
          return calculateCompletionPercentage(instance, responsesRecord);
        })()
      : 0;

  return (
    <TableRow key={instance.id}>
      <TableCell>
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {instance.template?.name || 'Unknown Template'}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {instance.template?.description || 'No description available'}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Box>
          <Typography variant="body2">
            {instance.supplier?.name || 'Unknown Supplier'}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={getStatusLabel(instance.status)}
          color={getStatusColor(instance.status)}
          size="small"
        />
      </TableCell>
      <TableCell>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="textSecondary">
            {completionPercentage}%
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {formatDate(instance.createdAt)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {formatDate(instance.expiresAt)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="body2"
          color={
            getTimeRemaining(instance.expiresAt) === 'Expired'
              ? 'error'
              : 'textPrimary'
          }
        >
          {getTimeRemaining(instance.expiresAt)}
        </Typography>
      </TableCell>
      <TableCell>
        <Box display="flex" gap={1}>
          <Tooltip title={t('monitoring.buttons.viewResponses')}>
            <IconButton size="small" onClick={() => onViewResponses(instance)}>
              <Eye size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Survey">
            <IconButton
              size="small"
              onClick={e => onExportMenuOpen(e, instance)}
            >
              <Download size={16} />
            </IconButton>
          </Tooltip>
          {onCopyLink && instance.accessToken && (
            <Tooltip title={t('monitoring.buttons.openLink')}>
              <IconButton
                size="small"
                onClick={() => onCopyLink(instance.accessToken!)}
              >
                <ExternalLink size={16} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default SurveyInstanceTableRow;
