import React from 'react';
import { Box, Container, Paper, Typography, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
const logo = '/dark-gray-logo.svg';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme =>
          `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* Language Switcher */}
      <Box
        sx={{
          position: 'absolute',
          top: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <LanguageSwitcher />
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: 24,
          left: 24,
          zIndex: 1000,
        }}
      >
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            textDecoration: 'none',
          }}
        >
          <img src={logo} height={32} />
        </Typography>
      </Box>

      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 3,
              background: theme =>
                `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
              backdropFilter: 'blur(10px)',
              border: theme =>
                `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  fontSize: '1.1rem',
                  lineHeight: 1.5,
                }}
              >
                {subtitle}
              </Typography>
            </Box>

            {/* Form Content */}
            {children}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default AuthLayout;
