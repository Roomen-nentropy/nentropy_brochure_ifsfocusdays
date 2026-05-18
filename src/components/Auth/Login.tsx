import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from '../../lib/auth';
import AuthLayout from './AuthLayout';
import { useNavigate } from 'react-router-dom';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginProps {
  onToggleForm: () => void;
}

const Login: React.FC<LoginProps> = ({ onToggleForm }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      if (result.error) {
        setError(t('errors.invalidCredentials'));
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError(t('errors.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title={t('login.title')} subtitle={t('login.subtitle')}>
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
              label={t('login.password')}
              type="password"
              autoComplete="current-password"
              error={!!errors.password}
              helperText={
                errors.password?.message &&
                t(`errors.${errors.password.message}`)
              }
              sx={{ mb: 2 }}
              disabled={isLoading}
            />
          )}
        />

        <Controller
          name="rememberMe"
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
              label={t('login.rememberMe')}
              sx={{ mb: 2 }}
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
            t('login.signInButton')
          )}
        </Button>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Link
            component="button"
            type="button"
            variant="body2"
            color="primary"
            onClick={() => navigate('/forgot-password')}
            sx={{
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {t('login.forgotPassword')}
          </Link>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t('login.noAccount')}
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
            {t('login.signUpLink')}
          </Button>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default Login;
