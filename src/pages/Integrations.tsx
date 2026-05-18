import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Alert,
  Tabs,
  Tab,
  Chip,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  Skeleton,
  Pagination,
} from '@mui/material';
import {
  Plus,
  Key,
  Trash2,
  Copy,
  RefreshCw,
  Webhook,
  Settings2,
  History,
  Link as LinkIcon,
  AlertCircle,
  XCircle,
  Eye,
  EyeOff,
  Send,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { integrationService } from '../services/integrationService';
import type {
  Integration,
  IntegrationToken,
  Webhook as WebhookType,
  SyncLog,
  IntegrationType,
} from '../types/integration.types';

// ── Tab Panel ─────────────────────────────────────────────────────

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────

const Integrations: React.FC = () => {
  const { t } = useTranslation(['integrations', 'common']);
  const [searchParams] = useSearchParams();
  const [tabIndex, setTabIndex] = useState(0);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check for OAuth callback
  useEffect(() => {
    if (searchParams.get('connected') === 'dynamics') {
      setSuccess(t('dynamics.connectionSuccess'));
      setTabIndex(1); // Switch to ERP Connections tab
    }
  }, [searchParams, t]);

  const loadIntegrations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await integrationService.list();
      setIntegrations(data);
    } catch (err: any) {
      setError(err.message || t('common:error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {t('title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {t('subtitle')}
          </Typography>
        </Box>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{ mb: 2 }}
        >
          {success}
        </Alert>
      )}

      <Tabs
        value={tabIndex}
        onChange={(_, v) => setTabIndex(v)}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          icon={<Key size={16} />}
          iconPosition="start"
          label={t('tabs.apiAccess')}
        />
        <Tab
          icon={<LinkIcon size={16} />}
          iconPosition="start"
          label={t('tabs.erpConnections')}
        />
        <Tab
          icon={<Settings2 size={16} />}
          iconPosition="start"
          label={t('tabs.syncConfig')}
        />
        <Tab
          icon={<Webhook size={16} />}
          iconPosition="start"
          label={t('tabs.webhooks')}
        />
        <Tab
          icon={<History size={16} />}
          iconPosition="start"
          label={t('tabs.syncHistory')}
        />
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
        <APIAccessTab
          integrations={integrations}
          onRefresh={loadIntegrations}
          setError={setError}
          setSuccess={setSuccess}
        />
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        <ERPConnectionsTab
          integrations={integrations}
          onRefresh={loadIntegrations}
          setError={setError}
          setSuccess={setSuccess}
        />
      </TabPanel>

      <TabPanel value={tabIndex} index={2}>
        <SyncConfigTab
          integrations={integrations}
          onRefresh={loadIntegrations}
          setError={setError}
          setSuccess={setSuccess}
        />
      </TabPanel>

      <TabPanel value={tabIndex} index={3}>
        <WebhooksTab
          integrations={integrations}
          onRefresh={loadIntegrations}
          setError={setError}
          setSuccess={setSuccess}
        />
      </TabPanel>

      <TabPanel value={tabIndex} index={4}>
        <SyncHistoryTab integrations={integrations} />
      </TabPanel>
    </Box>
  );
};

// ── Shared Props ──────────────────────────────────────────────────

interface TabProps {
  integrations: Integration[];
  onRefresh: () => Promise<void>;
  setError: (e: string | null) => void;
  setSuccess: (s: string | null) => void;
}

// ── API Access Tab ────────────────────────────────────────────────

function APIAccessTab({
  integrations,
  onRefresh,
  setError,
  setSuccess,
}: TabProps) {
  const { t } = useTranslation(['integrations', 'common']);
  const [createOpen, setCreateOpen] = useState(false);
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [tokens, setTokens] = useState<IntegrationToken[]>([]);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [newIntegrationName, setNewIntegrationName] = useState('');
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenScopes, setNewTokenScopes] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const apiIntegrations = integrations.filter(i => i.type === 'API_TOKEN');

  const availableScopes = [
    { scope: 'integration:suppliers:read', label: t('scopes.suppliersRead') },
    { scope: 'integration:suppliers:write', label: t('scopes.suppliersWrite') },
    { scope: 'integration:products:read', label: t('scopes.productsRead') },
    { scope: 'integration:products:write', label: t('scopes.productsWrite') },
    { scope: 'integration:batches:read', label: t('scopes.batchesRead') },
    { scope: 'integration:batches:write', label: t('scopes.batchesWrite') },
    { scope: 'integration:dds:read', label: t('scopes.ddsRead') },
    { scope: 'integration:webhooks:manage', label: t('scopes.webhooksManage') },
    { scope: 'integration:sync:read', label: t('scopes.syncRead') },
  ];

  const handleCreateIntegration = async () => {
    if (!newIntegrationName.trim()) return;
    setCreating(true);
    try {
      await integrationService.create({
        name: newIntegrationName,
        type: 'API_TOKEN',
        syncMethod: 'PUSH',
      });
      setCreateOpen(false);
      setNewIntegrationName('');
      await onRefresh();
      setSuccess(t('apiAccess.integrationCreated'));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleOpenTokens = async (integration: Integration) => {
    setSelectedIntegration(integration);
    setTokenDialogOpen(true);
    try {
      const tokenList = await integrationService.listTokens(integration.id);
      setTokens(tokenList);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGenerateToken = async () => {
    if (
      !selectedIntegration ||
      !newTokenName.trim() ||
      newTokenScopes.length === 0
    )
      return;
    setCreating(true);
    try {
      const result = await integrationService.generateToken(
        selectedIntegration.id,
        {
          name: newTokenName,
          scopes: newTokenScopes,
        }
      );
      setGeneratedToken(result.token);
      setNewTokenName('');
      setNewTokenScopes([]);
      const tokenList = await integrationService.listTokens(
        selectedIntegration.id
      );
      setTokens(tokenList);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeToken = async (tokenId: string) => {
    if (!selectedIntegration) return;
    try {
      await integrationService.revokeToken(selectedIntegration.id, tokenId);
      const tokenList = await integrationService.listTokens(
        selectedIntegration.id
      );
      setTokens(tokenList);
      setSuccess(t('apiAccess.tokenRevoked'));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteIntegration = async (id: string) => {
    try {
      await integrationService.delete(id);
      await onRefresh();
      setSuccess(t('apiAccess.integrationDeleted'));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess(t('apiAccess.copiedToClipboard'));
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{t('apiAccess.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={() => setCreateOpen(true)}
        >
          {t('apiAccess.createIntegration')}
        </Button>
      </Stack>

      <Alert severity="info" icon={<AlertCircle size={18} />}>
        {t('apiAccess.description')}
      </Alert>

      {apiIntegrations.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Key size={48} style={{ opacity: 0.3 }} />
            <Typography variant="h6" color="text.secondary" mt={2}>
              {t('apiAccess.noIntegrations')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('apiAccess.noIntegrationsHint')}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        apiIntegrations.map(integration => (
          <Card key={integration.id}>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h6">{integration.name}</Typography>
                    <Chip
                      size="small"
                      label={integration.status}
                      color={
                        integration.status === 'ACTIVE' ? 'success' : 'default'
                      }
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {t('apiAccess.created')}:{' '}
                    {new Date(integration.createdAt).toLocaleDateString()}
                    {integration.lastSyncedAt && (
                      <>
                        {' '}
                        · {t('apiAccess.lastSync')}:{' '}
                        {new Date(integration.lastSyncedAt).toLocaleString()}
                      </>
                    )}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Key size={14} />}
                    onClick={() => handleOpenTokens(integration)}
                  >
                    {t('apiAccess.manageTokens')}
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteIntegration(integration.id)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))
      )}

      {/* Create Integration Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('apiAccess.createIntegration')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={t('apiAccess.integrationName')}
            value={newIntegrationName}
            onChange={e => setNewIntegrationName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateIntegration}
            disabled={creating}
          >
            {creating ? (
              <CircularProgress size={20} />
            ) : (
              t('common:actions.create')
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Token Management Dialog */}
      <Dialog
        open={tokenDialogOpen}
        onClose={() => {
          setTokenDialogOpen(false);
          setGeneratedToken(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t('apiAccess.tokensFor', { name: selectedIntegration?.name })}
        </DialogTitle>
        <DialogContent>
          {generatedToken && (
            <Alert
              severity="warning"
              sx={{ mb: 2 }}
              action={
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(generatedToken)}
                >
                  <Copy size={16} />
                </IconButton>
              }
            >
              <Typography variant="subtitle2">
                {t('apiAccess.tokenGenerated')}
              </Typography>
              <Box
                sx={{
                  fontFamily: 'monospace',
                  fontSize: 13,
                  p: 1,
                  mt: 1,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  wordBreak: 'break-all',
                }}
              >
                {showToken ? generatedToken : '••••••••••••••••••••••••••'}
                <IconButton
                  size="small"
                  onClick={() => setShowToken(!showToken)}
                  sx={{ ml: 1 }}
                >
                  {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                </IconButton>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {t('apiAccess.tokenWarning')}
              </Typography>
            </Alert>
          )}

          <Typography variant="subtitle2" mb={1}>
            {t('apiAccess.generateNewToken')}
          </Typography>
          <Stack spacing={2}>
            <TextField
              size="small"
              fullWidth
              label={t('apiAccess.tokenName')}
              value={newTokenName}
              onChange={e => setNewTokenName(e.target.value)}
            />
            <FormGroup>
              <Typography variant="caption" color="text.secondary" mb={1}>
                {t('apiAccess.selectScopes')}
              </Typography>
              {availableScopes.map(s => (
                <FormControlLabel
                  key={s.scope}
                  control={
                    <Checkbox
                      size="small"
                      checked={newTokenScopes.includes(s.scope)}
                      onChange={e => {
                        setNewTokenScopes(prev =>
                          e.target.checked
                            ? [...prev, s.scope]
                            : prev.filter(x => x !== s.scope)
                        );
                      }}
                    />
                  }
                  label={<Typography variant="body2">{s.label}</Typography>}
                />
              ))}
            </FormGroup>
            <Button
              variant="contained"
              size="small"
              onClick={handleGenerateToken}
              disabled={
                creating || !newTokenName || newTokenScopes.length === 0
              }
            >
              {creating ? (
                <CircularProgress size={16} />
              ) : (
                t('apiAccess.generate')
              )}
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" mb={1}>
            {t('apiAccess.existingTokens')}
          </Typography>
          {tokens.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t('apiAccess.noTokens')}
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('common:fields.name')}</TableCell>
                    <TableCell>{t('apiAccess.prefix')}</TableCell>
                    <TableCell>{t('apiAccess.scopes')}</TableCell>
                    <TableCell>{t('apiAccess.lastUsed')}</TableCell>
                    <TableCell>{t('apiAccess.status')}</TableCell>
                    <TableCell width={80} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tokens.map(token => (
                    <TableRow key={token.id}>
                      <TableCell>{token.name}</TableCell>
                      <TableCell>
                        <code>{token.tokenPrefix}...</code>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {token.scopes.slice(0, 3).map(s => (
                            <Chip
                              key={s}
                              label={s.split(':').pop()}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {token.scopes.length > 3 && (
                            <Chip
                              label={`+${token.scopes.length - 3}`}
                              size="small"
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {token.lastUsedAt
                          ? new Date(token.lastUsedAt).toLocaleDateString()
                          : t('apiAccess.never')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            token.revoked
                              ? t('apiAccess.revoked')
                              : t('apiAccess.active')
                          }
                          color={token.revoked ? 'error' : 'success'}
                        />
                      </TableCell>
                      <TableCell>
                        {!token.revoked && (
                          <IconButton
                            size="small"
                            onClick={() => handleRevokeToken(token.id)}
                          >
                            <XCircle size={16} />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setTokenDialogOpen(false);
              setGeneratedToken(null);
            }}
          >
            {t('common:actions.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

// ── ERP Connections Tab ───────────────────────────────────────────

function ERPConnectionsTab({
  integrations,
  onRefresh,
  setError,
  setSuccess,
}: TabProps) {
  const { t } = useTranslation(['integrations', 'common']);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<IntegrationType>('DYNAMICS');
  const [tenantId, setTenantId] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [environment, setEnvironment] = useState('production');
  const [creating, setCreating] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  const erpIntegrations = integrations.filter(i =>
    ['DYNAMICS', 'SAP', 'ORACLE', 'CUSTOM'].includes(i.type)
  );

  const handleCreateERP = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const configData: Record<string, any> = {};
      if (newType === 'DYNAMICS') {
        configData.tenantId = tenantId;
        configData.clientId = clientId;
        configData.clientSecret = clientSecret;
        configData.environment = environment;
      }

      const integration = await integrationService.create({
        name: newName,
        type: newType,
        config: configData,
        syncMethod: 'PULL',
      });

      // If DYNAMICS, start OAuth flow
      if (newType === 'DYNAMICS') {
        const { authorizationUrl } =
          await integrationService.getDynamicsAuthUrl(integration.id);
        window.location.href = authorizationUrl;
        return;
      }

      setCreateOpen(false);
      await onRefresh();
      setSuccess(t('erp.connectionCreated'));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleSync = async (integrationId: string) => {
    setSyncing(integrationId);
    try {
      const result =
        await integrationService.triggerDynamicsSync(integrationId);
      setSuccess(
        t('erp.syncComplete', {
          suppliers: `${result.suppliers.created} ${t('common:created')}, ${result.suppliers.updated} ${t('common:updated')}`,
          products: `${result.products.created} ${t('common:created')}, ${result.products.updated} ${t('common:updated')}`,
        })
      );
      await onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSyncing(null);
    }
  };

  const handleTestConnection = async (integrationId: string) => {
    setTesting(integrationId);
    try {
      const result =
        await integrationService.testDynamicsConnection(integrationId);
      if (result.success) {
        setSuccess(
          t('erp.connectionOk', { companies: result.companies?.length || 0 })
        );
      } else {
        setError(result.error || t('erp.connectionFailed'));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTesting(null);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{t('erp.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={() => setCreateOpen(true)}
        >
          {t('erp.addConnection')}
        </Button>
      </Stack>

      {erpIntegrations.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <LinkIcon size={48} style={{ opacity: 0.3 }} />
            <Typography variant="h6" color="text.secondary" mt={2}>
              {t('erp.noConnections')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('erp.noConnectionsHint')}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        erpIntegrations.map(integration => (
          <Card key={integration.id}>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h6">{integration.name}</Typography>
                    <Chip
                      size="small"
                      label={integration.type}
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label={integration.status}
                      color={
                        integration.status === 'ACTIVE'
                          ? 'success'
                          : integration.status === 'ERROR'
                            ? 'error'
                            : 'default'
                      }
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {integration.lastSyncedAt
                      ? `${t('apiAccess.lastSync')}: ${new Date(integration.lastSyncedAt).toLocaleString()}`
                      : t('erp.neverSynced')}
                    {integration.lastSyncError && (
                      <>
                        {' '}
                        ·{' '}
                        <span style={{ color: 'red' }}>
                          {integration.lastSyncError}
                        </span>
                      </>
                    )}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={
                      syncing === integration.id ? (
                        <CircularProgress size={14} />
                      ) : (
                        <RefreshCw size={14} />
                      )
                    }
                    onClick={() => handleSync(integration.id)}
                    disabled={syncing === integration.id}
                  >
                    {t('erp.syncNow')}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleTestConnection(integration.id)}
                    disabled={testing === integration.id}
                  >
                    {testing === integration.id ? (
                      <CircularProgress size={14} />
                    ) : (
                      t('erp.testConnection')
                    )}
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={async () => {
                      await integrationService.delete(integration.id);
                      await onRefresh();
                    }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))
      )}

      {/* Create ERP Connection Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('erp.addConnection')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label={t('common:fields.name')}
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>{t('erp.systemType')}</InputLabel>
              <Select
                value={newType}
                label={t('erp.systemType')}
                onChange={e => setNewType(e.target.value as IntegrationType)}
              >
                <MenuItem value="DYNAMICS">
                  Microsoft Dynamics 365 Business Central
                </MenuItem>
                <MenuItem value="SAP">SAP</MenuItem>
                <MenuItem value="ORACLE">Oracle</MenuItem>
                <MenuItem value="CUSTOM">Custom ERP</MenuItem>
              </Select>
            </FormControl>

            {newType === 'DYNAMICS' && (
              <>
                <Divider />
                <Typography variant="subtitle2">
                  {t('erp.azureConfig')}
                </Typography>
                <TextField
                  fullWidth
                  label={t('erp.tenantId')}
                  value={tenantId}
                  onChange={e => setTenantId(e.target.value)}
                  helperText={t('erp.tenantIdHelp')}
                />
                <TextField
                  fullWidth
                  label={t('erp.clientId')}
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                />
                <TextField
                  fullWidth
                  type="password"
                  label={t('erp.clientSecret')}
                  value={clientSecret}
                  onChange={e => setClientSecret(e.target.value)}
                />
                <FormControl fullWidth>
                  <InputLabel>{t('erp.environment')}</InputLabel>
                  <Select
                    value={environment}
                    label={t('erp.environment')}
                    onChange={e => setEnvironment(e.target.value)}
                  >
                    <MenuItem value="production">Production</MenuItem>
                    <MenuItem value="sandbox">Sandbox</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateERP}
            disabled={creating || !newName.trim()}
          >
            {creating ? (
              <CircularProgress size={20} />
            ) : newType === 'DYNAMICS' ? (
              t('erp.connectAndAuthorize')
            ) : (
              t('common:actions.create')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

// ── Sync Config Tab ───────────────────────────────────────────────

function SyncConfigTab({ integrations, setError, setSuccess }: TabProps) {
  const { t } = useTranslation(['integrations', 'common']);
  const [selectedId, setSelectedId] = useState<string>('');
  const [mappings, setMappings] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const activeIntegrations = integrations.filter(i => i.status === 'ACTIVE');

  useEffect(() => {
    if (selectedId) {
      integrationService
        .getFieldMappings(selectedId)
        .then(setMappings)
        .catch(() => {});
    }
  }, [selectedId]);

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await integrationService.updateFieldMappings(selectedId, mappings);
      setSuccess(t('syncConfig.saved'));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h6">{t('syncConfig.title')}</Typography>
      <Alert severity="info">{t('syncConfig.description')}</Alert>

      {activeIntegrations.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('syncConfig.noActiveIntegrations')}
        </Typography>
      ) : (
        <>
          <FormControl fullWidth>
            <InputLabel>{t('syncConfig.selectIntegration')}</InputLabel>
            <Select
              value={selectedId}
              label={t('syncConfig.selectIntegration')}
              onChange={e => setSelectedId(e.target.value)}
            >
              {activeIntegrations.map(i => (
                <MenuItem key={i.id} value={i.id}>
                  {i.name} ({i.type})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedId && (
            <Card>
              <CardHeader
                title={t('syncConfig.fieldMappings')}
                subheader={t('syncConfig.fieldMappingsHint')}
              />
              <CardContent>
                <Stack spacing={2}>
                  {['suppliers', 'products', 'batches'].map(entity => (
                    <Box key={entity}>
                      <Typography
                        variant="subtitle2"
                        textTransform="capitalize"
                        mb={1}
                      >
                        {t(`syncConfig.${entity}`)}
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        size="small"
                        value={JSON.stringify(mappings[entity] || {}, null, 2)}
                        onChange={e => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            setMappings(prev => ({
                              ...prev,
                              [entity]: parsed,
                            }));
                          } catch {
                            // Invalid JSON, keep as-is
                          }
                        }}
                        sx={{ fontFamily: 'monospace' }}
                      />
                    </Box>
                  ))}
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <CircularProgress size={20} />
                    ) : (
                      t('common:actions.save')
                    )}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Stack>
  );
}

// ── Webhooks Tab ──────────────────────────────────────────────────

function WebhooksTab({ integrations, setError, setSuccess }: TabProps) {
  const { t } = useTranslation(['integrations', 'common']);
  const [selectedId, setSelectedId] = useState<string>('');
  const [webhooks, setWebhooks] = useState<WebhookType[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newEvents, setNewEvents] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const activeIntegrations = integrations.filter(
    i => i.status === 'ACTIVE' || i.type === 'API_TOKEN'
  );

  const availableEvents = [
    'supplier.created',
    'supplier.updated',
    'supplier.deleted',
    'product.created',
    'product.updated',
    'product.deleted',
    'batch.created',
    'batch.updated',
    'batch.deleted',
    'sync.completed',
    'sync.failed',
    'dds.status_changed',
    'dds.submitted',
    'dds.approved',
  ];

  useEffect(() => {
    if (selectedId) {
      integrationService
        .listWebhooks(selectedId)
        .then(setWebhooks)
        .catch(() => {});
    }
  }, [selectedId]);

  const handleCreate = async () => {
    if (!selectedId || !newUrl || newEvents.length === 0) return;
    setCreating(true);
    try {
      await integrationService.createWebhook(selectedId, {
        url: newUrl,
        events: newEvents,
      });
      setCreateOpen(false);
      setNewUrl('');
      setNewEvents([]);
      const wh = await integrationService.listWebhooks(selectedId);
      setWebhooks(wh);
      setSuccess(t('webhooks.created'));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleTest = async (webhookId: string) => {
    try {
      const result = await integrationService.testWebhook(
        selectedId,
        webhookId
      );
      if (result.success) {
        setSuccess(t('webhooks.testSuccess', { duration: result.duration }));
      } else {
        setError(t('webhooks.testFailed', { error: result.error }));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (webhookId: string) => {
    try {
      await integrationService.deleteWebhook(selectedId, webhookId);
      const wh = await integrationService.listWebhooks(selectedId);
      setWebhooks(wh);
      setSuccess(t('webhooks.deleted'));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{t('webhooks.title')}</Typography>
        {selectedId && (
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => setCreateOpen(true)}
          >
            {t('webhooks.addWebhook')}
          </Button>
        )}
      </Stack>

      <FormControl fullWidth>
        <InputLabel>{t('syncConfig.selectIntegration')}</InputLabel>
        <Select
          value={selectedId}
          label={t('syncConfig.selectIntegration')}
          onChange={e => setSelectedId(e.target.value)}
        >
          {activeIntegrations.map(i => (
            <MenuItem key={i.id} value={i.id}>
              {i.name} ({i.type})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedId && webhooks.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Webhook size={48} style={{ opacity: 0.3 }} />
            <Typography variant="h6" color="text.secondary" mt={2}>
              {t('webhooks.noWebhooks')}
            </Typography>
          </CardContent>
        </Card>
      )}

      {webhooks.map(wh => (
        <Card key={wh.id}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="subtitle1" fontFamily="monospace">
                  {wh.url}
                </Typography>
                <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap">
                  {wh.events.map(e => (
                    <Chip key={e} label={e} size="small" variant="outlined" />
                  ))}
                </Stack>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mt={0.5}
                >
                  {t('webhooks.failures')}: {wh.failureCount} ·{' '}
                  {wh.lastDeliveredAt
                    ? `${t('webhooks.lastDelivery')}: ${new Date(wh.lastDeliveredAt).toLocaleString()}`
                    : t('webhooks.noDeliveries')}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Chip
                  size="small"
                  label={
                    wh.active ? t('apiAccess.active') : t('webhooks.disabled')
                  }
                  color={wh.active ? 'success' : 'error'}
                />
                <Tooltip title={t('webhooks.sendTest')}>
                  <IconButton size="small" onClick={() => handleTest(wh.id)}>
                    <Send size={16} />
                  </IconButton>
                </Tooltip>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(wh.id)}
                >
                  <Trash2 size={16} />
                </IconButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}

      {/* Create Webhook Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('webhooks.addWebhook')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label={t('webhooks.endpointUrl')}
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="https://your-server.com/webhook"
            />
            <FormGroup>
              <Typography variant="caption" color="text.secondary" mb={1}>
                {t('webhooks.selectEvents')}
              </Typography>
              {availableEvents.map(ev => (
                <FormControlLabel
                  key={ev}
                  control={
                    <Checkbox
                      size="small"
                      checked={newEvents.includes(ev)}
                      onChange={e =>
                        setNewEvents(prev =>
                          e.target.checked
                            ? [...prev, ev]
                            : prev.filter(x => x !== ev)
                        )
                      }
                    />
                  }
                  label={<Typography variant="body2">{ev}</Typography>}
                />
              ))}
            </FormGroup>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={creating || !newUrl || newEvents.length === 0}
          >
            {creating ? (
              <CircularProgress size={20} />
            ) : (
              t('common:actions.create')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

// ── Sync History Tab ──────────────────────────────────────────────

function SyncHistoryTab({ integrations }: { integrations: Integration[] }) {
  const { t } = useTranslation(['integrations', 'common']);
  const [selectedId, setSelectedId] = useState<string>('');
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    integrationService
      .getSyncLogs(selectedId, { page, limit: 25 })
      .then(result => {
        setLogs(result.data);
        setTotal(result.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedId, page]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'success';
      case 'ERROR':
        return 'error';
      case 'PARTIAL':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h6">{t('syncHistory.title')}</Typography>

      <FormControl fullWidth>
        <InputLabel>{t('syncConfig.selectIntegration')}</InputLabel>
        <Select
          value={selectedId}
          label={t('syncConfig.selectIntegration')}
          onChange={e => {
            setSelectedId(e.target.value);
            setPage(1);
          }}
        >
          {integrations.map(i => (
            <MenuItem key={i.id} value={i.id}>
              {i.name} ({i.type})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <Stack spacing={1}>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} height={50} />
          ))}
        </Stack>
      ) : selectedId && logs.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('syncHistory.noLogs')}
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('syncHistory.timestamp')}</TableCell>
                  <TableCell>{t('syncHistory.entityType')}</TableCell>
                  <TableCell>{t('syncHistory.action')}</TableCell>
                  <TableCell>{t('syncHistory.status')}</TableCell>
                  <TableCell>{t('syncHistory.records')}</TableCell>
                  <TableCell>{t('syncHistory.error')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.entityType}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.status}
                        size="small"
                        color={statusColor(log.status) as any}
                      />
                    </TableCell>
                    <TableCell>{log.recordsAffected}</TableCell>
                    <TableCell>
                      {log.errorMessage && (
                        <Tooltip title={log.errorMessage}>
                          <AlertCircle size={16} color="red" />
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {total > 25 && (
            <Box display="flex" justifyContent="center">
              <Pagination
                count={Math.ceil(total / 25)}
                page={page}
                onChange={(_, p) => setPage(p)}
              />
            </Box>
          )}
        </>
      )}
    </Stack>
  );
}

export default Integrations;
