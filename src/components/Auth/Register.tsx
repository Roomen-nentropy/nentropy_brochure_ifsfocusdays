import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
  Grid,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signUp } from '../../lib/auth';
import AuthLayout from './AuthLayout';
import { useNavigate } from 'react-router-dom';

// Validation schema
const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z
      .string()
      .email('Invalid email address')
      .min(1, 'Email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    company: z.string().min(1, 'Company name is required'),
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterProps {
  onToggleForm: () => void;
}

const Register: React.FC<RegisterProps> = ({ onToggleForm }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      company: '',
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
      });

      if (result.error) {
        setError(result.error.message || t('errors.invalidCredentials'));
      } else {
        setSuccess(true);
        navigate('/dashboard');
      }
    } catch {
      setError(t('errors.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title={t('register.title')}
        subtitle={t('success.accountCreated')}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Alert severity="success" sx={{ mb: 3 }}>
            {t('success.accountCreated')}
          </Alert>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={onToggleForm}
            sx={{
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            {t('register.signInLink')}
          </Button>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('register.title')} subtitle={t('register.subtitle')}>
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

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={6}>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('register.firstName')}
                  autoComplete="given-name"
                  autoFocus
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                  disabled={isLoading}
                />
              )}
            />
          </Grid>
          <Grid size={6}>
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('register.lastName')}
                  autoComplete="family-name"
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                  disabled={isLoading}
                />
              )}
            />
          </Grid>
        </Grid>

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label={t('register.email')}
              type="email"
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
              disabled={isLoading}
            />
          )}
        />

        <Controller
          name="company"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label={t('register.company')}
              autoComplete="organization"
              error={!!errors.company}
              helperText={errors.company?.message}
              sx={{ mb: 2 }}
              disabled={isLoading}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label={t('register.password')}
              type="password"
              autoComplete="new-password"
              error={!!errors.password}
              helperText={errors.password?.message}
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
              label={t('register.confirmPassword')}
              type="password"
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              sx={{ mb: 2 }}
              disabled={isLoading}
            />
          )}
        />

        <Controller
          name="agreeToTerms"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  {...field}
                  checked={field.value}
                  disabled={isLoading}
                />
              }
              label={t('register.terms')}
              sx={{ mb: 3, alignItems: 'center' }}
            />
          )}
        />

        {errors.agreeToTerms && (
          <Typography
            variant="caption"
            color="error"
            sx={{ display: 'block', mb: 2 }}
          >
            {errors.agreeToTerms.message}
          </Typography>
        )}

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
            t('register.signUpButton')
          )}
        </Button>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t('register.hasAccount')}
          </Typography>
          <Button
            variant="text"
            onClick={onToggleForm}
            disabled={isLoading}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            {t('register.signInLink')}
          </Button>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default Register;
