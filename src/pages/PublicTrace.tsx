import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import { packagingLabellingApi, type PublicTracePayload } from '../services/packagingLabellingApi';

const PublicTrace: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PublicTracePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    void (async () => {
      try {
        const res = await packagingLabellingApi.getPublicTrace(token);
        setData(res.data);
      } catch {
        setError('Trace not found');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error ?? 'Not found'}</Alert>
      </Box>
    );
  }

  const title = data.product?.name ?? data.ownGood?.name ?? 'Product trace';

  return (
    <Box sx={{ p: 3, maxWidth: 640, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      {data.batchNumber && (
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Batch {data.batchNumber}
        </Typography>
      )}
      {data.qrImageUrl && (
        <Box component="img" src={data.qrImageUrl} alt="QR" sx={{ width: 120, mb: 2 }} />
      )}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Label information (EU 2025/40)
        </Typography>
        <List dense>
          {Object.entries(data.fields ?? {}).map(([k, v]) => (
            <ListItem key={k} disablePadding>
              <ListItemText primary={k.replace(/_/g, ' ')} secondary={String(v ?? '')} />
            </ListItem>
          ))}
        </List>
      </Paper>
      {data.documents && (
        <>
          <Typography variant="subtitle2">Documents</Typography>
          {[...(data.documents.productLevel ?? []), ...(data.documents.batchLevel ?? [])].map(
            d => (
              <Typography key={d.id} variant="body2">
                {d.url ? (
                  <a href={d.url} target="_blank" rel="noreferrer">
                    {d.label}
                  </a>
                ) : (
                  d.label
                )}
              </Typography>
            )
          )}
        </>
      )}
    </Box>
  );
};

export default PublicTrace;
