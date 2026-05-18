import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authClient } from '../../lib/auth';
import AuthLayout from './AuthLayout';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'passwordTooShort'),
    confirmPassword: z.string().min(1, 'passwordRequired'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'passwordMismatch',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const token = useMemo(() => searchParams.get('token'), [searchParams]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError(t('resetPassword.invalidToken'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.resetPassword({
        newPassword: data.newPassword,
        token,
      });

      if (result.error) {
        setError(t('resetPassword.error'));
      } else {
        setSuccess(true);
      }
    } catch {
      setError(t('resetPassword.error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout
        title={t('resetPassword.title')}
        subtitle={t('resetPassword.subtitle')}
      >
        <Alert severity="error" sx={{ mb: 3 }}>
          {t('resetPassword.invalidToken')}
        </Alert>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/auth')}
        >
          {t('forgotPassword.backToLogin')}
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t('resetPassword.title')}
      subtitle={t('resetPassword.subtitle')}
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
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CheckCircleOutlineIcon
                color="success"
                sx={{ fontSize: 64, mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                {t('resetPassword.successTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('resetPassword.successMessage')}
              </Typography>
            </Box>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => navigate('/auth')}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              {t('resetPassword.goToLogin')}
            </Button>
          </motion.div>
        ) : (
          <>
            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('resetPassword.newPassword')}
                  type="password"
                  autoComplete="new-password"
                  autoFocus
                  error={!!errors.newPassword}
                  helperText={
                    errors.newPassword?.message &&
                    t(`errors.${errors.newPassword.message}`)
                  }
                  sx={{ mb: 2 }}
                  disabled={isLoading}
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('resetPassword.confirmPassword')}
                  type="password"
                  autoComplete="new-password"
                  error={!!errors.confirmPassword}
                  helperText={
                    errors.confirmPassword?.message &&
                    t(`errors.${errors.confirmPassword.message}`)
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
                t('resetPassword.submitButton')
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

export default ResetPassword;
