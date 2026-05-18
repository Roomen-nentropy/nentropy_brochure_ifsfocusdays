import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '../lib/auth';
import { Box, CircularProgress, Typography } from '@mui/material';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { data: session, isPending } = useSession();

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  if (isPending) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return isLogin ? (
    <Login onToggleForm={toggleForm} />
  ) : (
    <Register onToggleForm={toggleForm} />
  );
};

export default Auth;
