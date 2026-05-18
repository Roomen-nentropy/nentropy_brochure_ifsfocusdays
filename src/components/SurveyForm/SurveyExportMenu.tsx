import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { Download } from 'lucide-react';
import type { SurveyInstance } from '../../types/survey.types';

interface SurveyExportMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  instance: SurveyInstance | null;
  onExportJSON: (instance: SurveyInstance) => Promise<void>;
  onExportPDF: (instance: SurveyInstance) => Promise<void>;
}

const SurveyExportMenu: React.FC<SurveyExportMenuProps> = ({
  anchorEl,
  open,
  onClose,
  instance,
  onExportJSON,
  onExportPDF,
}) => {
  const handleExportJSON = async () => {
    if (instance) {
      await onExportJSON(instance);
    }
  };

  const handleExportPDF = async () => {
    if (instance) {
      await onExportPDF(instance);
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <MenuItem onClick={handleExportJSON}>
        <Download size={16} style={{ marginRight: 8 }} />
        Export as JSON
      </MenuItem>
      <MenuItem onClick={handleExportPDF}>
        <Download size={16} style={{ marginRight: 8 }} />
        Export as PDF
      </MenuItem>
    </Menu>
  );
};

export default SurveyExportMenu;
