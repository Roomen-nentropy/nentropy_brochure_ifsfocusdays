import React, { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { LabelTemplatesPanel } from '../components/PackagingLabelling/LabelTemplatesPanel';
import { PackagingLinksPanel } from '../components/PackagingLabelling/PackagingLinksPanel';
import { LabelManagementPanel } from '../components/PackagingLabelling/LabelManagementPanel';

const PackagingLabelling: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Packaging and labelling
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Design product labels, link goods to packaging SKUs, and generate batch QR codes with
        EU Regulation 2025/40 data. Self-declarations remain under Declarations (DDS).
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Label templates" />
        <Tab label="Packaging links" />
        <Tab label="Label management" />
      </Tabs>
      {tab === 0 && <LabelTemplatesPanel />}
      {tab === 1 && <PackagingLinksPanel />}
      {tab === 2 && <LabelManagementPanel />}
    </Box>
  );
};

export default PackagingLabelling;
