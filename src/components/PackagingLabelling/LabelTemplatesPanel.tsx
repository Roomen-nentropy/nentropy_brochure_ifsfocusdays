import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Alert,
} from '@mui/material';
import { packagingLabellingApi } from '../../services/packagingLabellingApi';
import { LabelBuilderCanvas } from './LabelBuilderCanvas';
import type { LabelDesignElement, LabelTemplate } from '../../types/packaging-labelling.types';

export const LabelTemplatesPanel: React.FC = () => {
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [selected, setSelected] = useState<LabelTemplate | null>(null);
  const [name, setName] = useState('');
  const [elements, setElements] = useState<LabelDesignElement[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await packagingLabellingApi.listTemplates();
    setTemplates(data);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const select = (t: LabelTemplate) => {
    setSelected(t);
    setName(t.name);
    setElements(t.designJson?.elements ?? []);
  };

  const create = async () => {
    const { data } = await packagingLabellingApi.createTemplate({
      name: name || 'New label',
      mode: 'SCRATCH',
      widthMm: 100,
      heightMm: 150,
      designJson: { elements: [] },
    });
    await load();
    select(data);
  };

  const save = async () => {
    if (!selected) return;
    await packagingLabellingApi.updateTemplate(selected.id, {
      name,
      designJson: { elements },
    });
    setMsg('Template saved');
    await load();
  };

  const uploadBase = async (file: File) => {
    if (!selected) return;
    await packagingLabellingApi.uploadTemplateBase(selected.id, file);
    setMsg('Base image uploaded — switch to overlay mode in a future pass to draw boxes');
    await load();
  };

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
      <Box sx={{ minWidth: 220 }}>
        <Button fullWidth variant="contained" sx={{ mb: 1 }} onClick={() => void create()}>
          New template
        </Button>
        <List dense>
          {templates.map(t => (
            <ListItemButton key={t.id} selected={selected?.id === t.id} onClick={() => select(t)}>
              <ListItemText primary={t.name} secondary={t.mode} />
            </ListItemButton>
          ))}
        </List>
      </Box>
      <Box flex={1}>
        {msg && (
          <Alert sx={{ mb: 2 }} onClose={() => setMsg(null)}>
            {msg}
          </Alert>
        )}
        {selected ? (
          <>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }} alignItems="center">
              <TextField
                size="small"
                label="Template name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <Button variant="contained" onClick={() => void save()}>
                Save
              </Button>
              <Button component="label" variant="outlined">
                Upload base image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) void uploadBase(f);
                  }}
                />
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              AI analysis (coming soon) — infrastructure ready on server
            </Typography>
            <LabelBuilderCanvas
              widthMm={selected.widthMm}
              heightMm={selected.heightMm}
              elements={elements}
              onChange={setElements}
            />
          </>
        ) : (
          <Typography color="text.secondary">Select or create a label template</Typography>
        )}
      </Box>
    </Stack>
  );
};
