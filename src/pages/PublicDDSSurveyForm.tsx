import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { CheckCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { DDSSurveyForm } from '../components/DDSSurveys/DDSSurveyForm';
import { API_BASE_URL } from '../services';

const PublicDDSSurveyForm: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch survey by token
  const {
    data: survey,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dds-survey-public', token],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/unified-dds-surveys/token/${token}`
      );
      return response.data;
    },
    enabled: !!token,
  });

  // Check if survey is expired
  const isExpired =
    survey?.expiresAt && new Date(survey.expiresAt) < new Date();
  const isCompleted = survey?.status === 'COMPLETED';

  useEffect(() => {
    if (isCompleted) {
      setIsSubmitted(true);
    }
  }, [isCompleted]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'grey.100',
        }}
      >
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading survey...
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (error || !survey) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'grey.100',
          p: 3,
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 600 }}>
          <Alert severity="error">
            <Typography variant="h6" gutterBottom>
              Survey Not Found
            </Typography>
            <Typography variant="body2">
              The survey link you're trying to access is invalid or has been
              removed. Please contact the company that sent you this link.
            </Typography>
          </Alert>
        </Paper>
      </Box>
    );
  }

  if (isExpired) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'grey.100',
          p: 3,
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 600 }}>
          <Alert severity="warning">
            <Typography variant="h6" gutterBottom>
              Survey Expired
            </Typography>
            <Typography variant="body2">
              This DDS survey link expired on{' '}
              {new Date(survey.expiresAt).toLocaleDateString()}. Please contact
              the company for a new survey link.
            </Typography>
          </Alert>
        </Paper>
      </Box>
    );
  }

  if (isSubmitted) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'grey.100',
          p: 3,
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 600, textAlign: 'center' }}>
          <CheckCircle
            size={64}
            style={{ color: '#4caf50', marginBottom: 16 }}
          />
          <Typography variant="h5" gutterBottom>
            Survey Completed!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Thank you for completing the DDS survey. Your responses have been
            submitted successfully.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The company will process your submission and may contact you if
            additional information is needed.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.100',
        py: 4,
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            DDS Survey
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Due Diligence Statement Survey for:{' '}
            <strong>{survey.supplier.name}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please provide accurate information about your products and their
            origins. This information is required for EUDR compliance.
          </Typography>

          {survey.expiresAt && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This survey expires on{' '}
              <strong>{new Date(survey.expiresAt).toLocaleDateString()}</strong>
            </Alert>
          )}
        </Paper>

        {/* Survey Form */}
        <DDSSurveyForm
          surveyId={survey.id}
          supplierId={survey.supplierId}
          mode={survey.surveyMode}
          onComplete={() => setIsSubmitted(true)}
        />
      </Box>
    </Box>
  );
};

export default PublicDDSSurveyForm;
