import React, { useState, lazy, Suspense } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tab,
  Tabs,
  Button,
  CircularProgress,
} from '@mui/material';

// Lazy load the heavy components
const DDSSurveysTab = lazy(
  () => import('../components/DDSSurveys/DDSSurveysTab')
);
const DDSManualSubmission = lazy(() =>
  import('./DDSManualSubmission').then(module => ({
    default: module.DDSManualSubmission,
  }))
);
const PackagingSelfDeclarationTab = lazy(() =>
  import('../components/PackagingDeclaration/PackagingSelfDeclarationTab')
);

const DDSPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Declarations</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage EUDR DDS and EU 2025/40 self declarations
        </Typography>
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
        >
          <Tab label="EUDR DDS" />
          <Tab label="Self Declaration (2025/40)" />
        </Tabs>
      </Paper>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 0 && (
          <>
            <Suspense
              fallback={
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              }
            >
              <DDSSurveysTab />
            </Suspense>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                EU system submissions
              </Typography>
              <Suspense
                fallback={
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                }
              >
                <DDSManualSubmission />
              </Suspense>
            </Box>
          </>
        )}

        {activeTab === 1 && (
          <Suspense
            fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            }
          >
            <PackagingSelfDeclarationTab />
          </Suspense>
        )}
      </Box>
    </Box>
  );
};

export default DDSPage;
