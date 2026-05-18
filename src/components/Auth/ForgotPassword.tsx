import React, { useState } from 'react';
import { Box, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authClient } from '../../lib/auth';
import AuthLayout from './AuthLayout';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const forgotPasswordSchema = z.object({
  email: z.string().email('emailInvalid').min(1, 'emailRequired'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.forgetPassword({
        email: data.email,
        redirectTo: '/reset-password',
      });

      if (result.error) {
        setError(t('forgotPassword.error'));
      } else {
        setSuccess(true);
      }
    } catch {
      setError(t('forgotPassword.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('forgotPassword.title')}
      subtitle={t('forgotPassword.subtitle')}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          </motion.div>
        )}

        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Alert severity="success" sx={{ mb: 3 }}>
              {t('forgotPassword.successMessage')}
            </Alert>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/auth')}
              sx={{ mt: 1 }}
            >
              {t('forgotPassword.backToLogin')}
            </Button>
          </motion.div>
        ) : (
          <>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('login.email')}
                  type="email"
                  autoComplete="email"
                  autoFocus
                  error={!!errors.email}
                  helperText={
                    errors.email?.message && t(`errors.${errors.email.message}`)
                  }
                  sx={{ mb: 3 }}
                  disabled={isLoading}
                />
              )}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                mb: 3,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('forgotPassword.submitButton')
              )}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="text"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/auth')}
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                {t('forgotPassword.backToLogin')}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </AuthLayout>
  );
};

export default ForgotPassword;
