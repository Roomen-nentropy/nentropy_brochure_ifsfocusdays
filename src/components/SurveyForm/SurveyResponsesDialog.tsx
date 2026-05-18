import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getQuestionById, formatDate } from '../../lib/survey-utils';
import SurveyResponseDisplay from './SurveyResponseDisplay';
import type {
  SurveyInstance,
  SurveyInstanceResponse,
} from '../../types/survey.types';

interface SurveyResponsesDialogProps {
  open: boolean;
  onClose: () => void;
  instance: SurveyInstance | null;
  responses: SurveyInstanceResponse[];
}

const SurveyResponsesDialog: React.FC<SurveyResponsesDialogProps> = ({
  open,
  onClose,
  instance,
  responses,
}) => {
  const { t } = useTranslation('surveyForm');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{t('monitoring.responses.title')}</DialogTitle>
      <DialogContent>
        {responses.length > 0 ? (
          <List>
            {responses.map((response, index) => {
              const question = instance?.template
                ? getQuestionById(instance.template, response.questionId)
                : undefined;

              return (
                <React.Fragment key={response.id}>
                  <ListItem
                    sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <ListItemText
                      primary={
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {question?.question || (
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                  component="span"
                                >
                                  Question ID: {response.questionId}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="error.main"
                                  display="block"
                                >
                                  (Question text not available - this may
                                  indicate a template sync issue)
                                </Typography>
                              </Box>
                            )}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Box
                            sx={{
                              mt: 0.5,
                              p: 1,
                              backgroundColor: 'grey.50',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'grey.200',
                            }}
                          >
                            <SurveyResponseDisplay
                              response={response.response}
                              question={question}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{ mt: 1, display: 'block' }}
                          >
                            {t('monitoring.responses.updated', {
                              date: formatDate(response.updatedAt),
                            })}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < responses.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        ) : (
          <Typography
            variant="body2"
            color="textSecondary"
            align="center"
            py={4}
          >
            {t('monitoring.responses.noResponses')}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('monitoring.buttons.close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SurveyResponsesDialog;
