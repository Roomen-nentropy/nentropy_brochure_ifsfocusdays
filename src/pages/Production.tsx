import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '../features/production/ui';
import { ClipboardList, X } from 'lucide-react';
import { api, API_BASE_URL } from '../services';
import { MachineDossier } from '../components/Dossiers/MachineDossier';
import { PlantDossier } from '../components/Dossiers/PlantDossier';
import { ChecklistRunDialog } from '../components/ChecklistManagement/ChecklistRunDialog';

export interface ProductionCatalogRow {
  templateKey: string;
  kind: string;
  section: string;
  matrixId: string | null;
  labelBg: string;
  labelEn: string;
  sourcePrpRelativePath: string;
}

interface Plant {
  id: string;
  code: string;
  name: string;
  location?: string | null;
  machines?: Machine[];
}

interface Machine {
  id: string;
  code: string;
  modelNumber: string;
  description?: string | null;
  plantId?: string | null;
  plant?: { id: string; code: string; name: string } | null;
}

interface Employee {
  id: string;
  employeeCode: string;
  name: string;
}

interface OwnGood {
  id: string;
  name: string;
  batches?: { id: string; batchNumber: string }[];
}

interface HistoryRun {
  id: string;
  displayId: string;
  kind: string;
  status: string;
  outcome: string;
  completedAt?: string | null;
  updatedAt: string;
  template?: { templateKey?: string; name?: string };
  templateSnapshot?: { templateKey?: string };
  machine?: { code: string } | null;
  plant?: { code: string; name: string } | null;
  employee?: { employeeCode: string; name: string } | null;
}

const TAB_LABELS = [
  'History',
  'Intake control',
  'Plants & machines',
  'Employees',
  'Production',
  'Lab',
] as const;

const Production: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [ownGoods, setOwnGoods] = useState<OwnGood[]>([]);
  const [labList, setLabList] = useState<unknown[]>([]);
  const [historyRuns, setHistoryRuns] = useState<HistoryRun[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [plantsErr, setPlantsErr] = useState<string | null>(null);
  const [machinesErr, setMachinesErr] = useState<string | null>(null);

  const [pCode, setPCode] = useState('');
  const [pName, setPName] = useState('');
  const [pLoc, setPLoc] = useState('');
  const [mCode, setMCode] = useState('');
  const [mModel, setMModel] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mPlantId, setMPlantId] = useState('');
  const [eCode, setECode] = useState('');
  const [eName, setEName] = useState('');
  const [labOwnGoodId, setLabOwnGoodId] = useState('');
  const [labBatchId, setLabBatchId] = useState('');
  const [labTitle, setLabTitle] = useState('');
  const [plantsSubTab, setPlantsSubTab] = useState(0);
  const [machineDossierId, setMachineDossierId] = useState<string | null>(null);
  const [plantDossierId, setPlantDossierId] = useState<string | null>(null);
  const [checklistCatalog, setChecklistCatalog] = useState<ProductionCatalogRow[]>([]);
  const [activeChecklist, setActiveChecklist] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const refresh = useCallback(async () => {
    setErr(null);
    setPlantsErr(null);
    setMachinesErr(null);
    const results = await Promise.allSettled([
      api.get<Plant[]>('/api/production/plants'),
      api.get<Machine[]>('/api/production/machines'),
      api.get<Employee[]>('/api/production/employees'),
      api.get<OwnGood[]>('/api/own-goods'),
      api.get('/api/production/lab'),
    ]);
    const pick = <T,>(i: number, fallback: T): T =>
      results[i].status === 'fulfilled'
        ? (results[i] as PromiseFulfilledResult<{ data: T }>).value.data
        : fallback;
    if (results[0].status === 'rejected') {
      const reason = (results[0] as PromiseRejectedResult).reason as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      setPlantsErr(
        reason.response?.data?.error ??
          reason.message ??
          'Plants API unavailable'
      );
      setPlants([]);
    } else {
      setPlants(pick(0, []));
    }
    if (results[1].status === 'rejected') {
      const reason = (results[1] as PromiseRejectedResult).reason as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      setMachinesErr(
        reason.response?.data?.error ??
          reason.message ??
          'Machines API unavailable'
      );
      setMachines([]);
    } else {
      setMachines(pick(1, []));
    }
    setEmployees(pick(2, []));
    setOwnGoods(pick(3, []));
    setLabList(pick(4, []));
    const hardFail = results.slice(2).find(r => r.status === 'rejected');
    if (hardFail && hardFail.status === 'rejected') {
      const reason = hardFail.reason as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      setErr(
        reason.response?.data?.error ??
          reason.message ??
          'Failed to load production data'
      );
    }
  }, []);

  const loadHistory = useCallback(async (section?: string) => {
    try {
      const params = section ? `?section=${section}` : '';
      const { data } = await api.get<HistoryRun[]>(
        `/api/checklists/runs/history${params}`
      );
      setHistoryRuns(data);
    } catch {
      setHistoryRuns([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
    void loadHistory();
  }, [refresh, loadHistory]);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await api.get<ProductionCatalogRow[]>(
          '/api/checklists/production-catalog'
        );
        setChecklistCatalog(data);
      } catch {
        /* optional */
      }
    })();
  }, []);

  const catalogFor = (section: ProductionCatalogRow['section']) =>
    checklistCatalog.filter(c => c.section === section);

  const openNewRun = (runId: string, title: string) => {
    setActiveChecklist({ id: runId, title });
  };

  const startCatalogRun = async (
    templateKey: string,
    title: string,
    opts?: {
      machineId?: string;
      plantId?: string;
      employeeId?: string;
      ownGoodId?: string;
    }
  ) => {
    const { data } = await api.post<{ id: string }>('/api/checklists/runs/catalog', {
      templateKey,
      ...opts,
    });
    openNewRun(data.id, title);
    flash(`Started: ${title}`);
    await loadHistory();
  };

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 4000);
  };

  const selectedOwnGood = ownGoods.find(o => o.id === labOwnGoodId);

  const runLabel = (r: HistoryRun) =>
    r.templateSnapshot?.templateKey ??
    r.template?.templateKey ??
    r.template?.name ??
    r.kind;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Production
      </Typography>
      {msg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {msg}
        </Alert>
      )}
      {err && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
      )}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
          {TAB_LABELS.map(label => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Completed &amp; draft checklists
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
            <Button size="small" onClick={() => void loadHistory()}>
              All
            </Button>
            {(['production', 'lab', 'employees', 'machines', 'intake'] as const).map(
              s => (
                <Button
                  key={s}
                  size="small"
                  variant="outlined"
                  onClick={() => void loadHistory(s)}
                >
                  {s}
                </Button>
              )
            )}
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Form</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyRuns.map(r => (
                <TableRow
                  key={r.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => openNewRun(r.id, runLabel(r))}
                >
                  <TableCell>{r.displayId}</TableCell>
                  <TableCell>{runLabel(r)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={r.status}
                      color={r.status === 'COMPLETED' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {r.machine?.code ??
                      (r.plant ? `${r.plant.code} — ${r.plant.name}` : null) ??
                      (r.employee
                        ? `${r.employee.employeeCode} — ${r.employee.name}`
                        : '—')}
                  </TableCell>
                  <TableCell>
                    {new Date(r.updatedAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Intake control (ПП12 / ПП16 ОД05)
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {catalogFor('intake').map(c => (
              <Button
                key={c.templateKey}
                variant="contained"
                onClick={async () => {
                  try {
                    await startCatalogRun(c.templateKey, c.labelBg);
                  } catch (e: unknown) {
                    setErr(e instanceof Error ? e.message : 'Error');
                  }
                }}
              >
                {c.labelBg}
              </Button>
            ))}
          </Stack>
        </Paper>
      )}

      {tab === 2 && (
        <Paper sx={{ p: 2 }}>
          <Tabs value={plantsSubTab} onChange={(_, v) => setPlantsSubTab(v)} sx={{ mb: 2 }}>
            <Tab label="Plants" />
            <Tab label="Machines" />
          </Tabs>
          {plantsSubTab === 0 && (
            <>
              {plantsErr && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {plantsErr}
                </Alert>
              )}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <TextField
                  label="Plant code"
                  value={pCode}
                  onChange={e => setPCode(e.target.value)}
                  size="small"
                />
                <TextField
                  label="Name"
                  value={pName}
                  onChange={e => setPName(e.target.value)}
                  size="small"
                />
                <TextField
                  label="Location"
                  value={pLoc}
                  onChange={e => setPLoc(e.target.value)}
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={async () => {
                    try {
                      await api.post('/api/production/plants', {
                        code: pCode,
                        name: pName,
                        location: pLoc || undefined,
                      });
                      setPCode('');
                      setPName('');
                      setPLoc('');
                      await refresh();
                      flash('Plant created');
                    } catch (e: unknown) {
                      setErr(e instanceof Error ? e.message : 'Error');
                    }
                  }}
                >
                  Add plant
                </Button>
              </Stack>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Machines</TableCell>
                    <TableCell align="right">Plant checklist</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plants.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => setPlantDossierId(p.id)}
                        >
                          {p.code}
                        </Button>
                      </TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.machines?.length ?? 0}</TableCell>
                      <TableCell align="right">
                        {catalogFor('plants').map(c => (
                          <Button
                            key={c.templateKey}
                            size="small"
                            sx={{ ml: 0.5 }}
                            onClick={async () => {
                              try {
                                const { data } = await api.post<{ id: string }>(
                                  `/api/checklists/runs/plant/${p.id}`,
                                  { templateKey: c.templateKey }
                                );
                                openNewRun(data.id, c.labelBg);
                                flash(`Started: ${c.labelBg}`);
                              } catch (e: unknown) {
                                setErr(e instanceof Error ? e.message : 'Error');
                              }
                            }}
                          >
                            {c.labelBg}
                          </Button>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
          {plantsSubTab === 1 && (
            <>
              {machinesErr && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {machinesErr}
                </Alert>
              )}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <TextField
                  label="Machine code"
                  value={mCode}
                  onChange={e => setMCode(e.target.value)}
                  size="small"
                />
                <TextField
                  label="Model"
                  value={mModel}
                  onChange={e => setMModel(e.target.value)}
                  size="small"
                />
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Plant</InputLabel>
                  <Select
                    label="Plant"
                    value={mPlantId}
                    onChange={e => setMPlantId(e.target.value as string)}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {plants.map(p => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.code} — {p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={async () => {
                    try {
                      await api.post('/api/production/machines', {
                        code: mCode,
                        modelNumber: mModel,
                        description: mDesc || undefined,
                        plantId: mPlantId || undefined,
                      });
                      setMCode('');
                      setMModel('');
                      setMDesc('');
                      setMPlantId('');
                      await refresh();
                      flash('Machine created');
                    } catch (e: unknown) {
                      setErr(e instanceof Error ? e.message : 'Error');
                    }
                  }}
                >
                  Add machine
                </Button>
              </Stack>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Plant</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {machines.map(m => (
                    <TableRow key={m.id}>
                      <TableCell>{m.code}</TableCell>
                      <TableCell>{m.modelNumber}</TableCell>
                      <TableCell>{m.plant?.code ?? '—'}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                          <Tooltip title="Dossier">
                            <IconButton size="small" onClick={() => setMachineDossierId(m.id)}>
                              <ClipboardList size={16} />
                            </IconButton>
                          </Tooltip>
                          {catalogFor('machines').map(c => (
                            <Button
                              key={c.templateKey}
                              size="small"
                              variant="outlined"
                              onClick={async () => {
                                try {
                                  const { data } = await api.post<{ id: string }>(
                                    `/api/checklists/runs/machine/${m.id}`,
                                    { templateKey: c.templateKey }
                                  );
                                  openNewRun(data.id, c.labelBg);
                                  flash(`Started: ${c.labelBg}`);
                                } catch (e: unknown) {
                                  setErr(e instanceof Error ? e.message : 'Error');
                                }
                              }}
                            >
                              {c.labelBg}
                            </Button>
                          ))}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </Paper>
      )}

      {tab === 3 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Employees — ПП02 ОД04
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {catalogFor('employees').map(c => (
              <Button
                key={c.templateKey}
                variant="outlined"
                onClick={async () => {
                  try {
                    await startCatalogRun(c.templateKey, c.labelBg);
                  } catch (e: unknown) {
                    setErr(e instanceof Error ? e.message : 'Error');
                  }
                }}
              >
                {c.labelBg} (daily sheet)
              </Button>
            ))}
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField label="Code" value={eCode} onChange={e => setECode(e.target.value)} size="small" />
            <TextField label="Name" value={eName} onChange={e => setEName(e.target.value)} size="small" />
            <Button
              variant="contained"
              onClick={async () => {
                try {
                  await api.post('/api/production/employees', { employeeCode: eCode, name: eName });
                  setECode('');
                  setEName('');
                  await refresh();
                  flash('Employee created');
                } catch (e: unknown) {
                  setErr(e instanceof Error ? e.message : 'Error');
                }
              }}
            >
              Add employee
            </Button>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map(em => (
                <TableRow key={em.id}>
                  <TableCell>{em.employeeCode}</TableCell>
                  <TableCell>{em.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {tab === 4 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Production checklists
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {catalogFor('production').map(c => (
              <Button
                key={c.templateKey}
                variant="outlined"
                onClick={async () => {
                  try {
                    await startCatalogRun(c.templateKey, c.labelBg);
                  } catch (e: unknown) {
                    setErr(e instanceof Error ? e.message : 'Error');
                  }
                }}
              >
                {c.labelBg}
              </Button>
            ))}
          </Stack>
        </Paper>
      )}

      {tab === 5 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Lab — sanitary log &amp; attachments
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {catalogFor('lab').map(c => (
              <Button
                key={c.templateKey}
                variant="contained"
                color="secondary"
                onClick={async () => {
                  try {
                    if (labOwnGoodId) {
                      const { data } = await api.post<{ id: string }>(
                        `/api/checklists/runs/lab-own-good/${labOwnGoodId}`,
                        { templateKey: c.templateKey }
                      );
                      openNewRun(data.id, c.labelBg);
                    } else {
                      await startCatalogRun(c.templateKey, c.labelBg);
                    }
                    flash(`Started: ${c.labelBg}`);
                  } catch (e: unknown) {
                    setErr(e instanceof Error ? e.message : 'Error');
                  }
                }}
              >
                {c.labelBg}
              </Button>
            ))}
          </Stack>
          <Stack spacing={2} sx={{ maxWidth: 480 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Own good (optional, for linked lab run)</InputLabel>
              <Select
                label="Own good (optional, for linked lab run)"
                value={labOwnGoodId}
                onChange={e => {
                  setLabOwnGoodId(e.target.value as string);
                  setLabBatchId('');
                }}
              >
                <MenuItem value="">
                  <em>Day log only</em>
                </MenuItem>
                {ownGoods.map(o => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" disabled={!labOwnGoodId}>
              <InputLabel>Batch (optional)</InputLabel>
              <Select
                label="Batch (optional)"
                value={labBatchId}
                onChange={e => setLabBatchId(e.target.value as string)}
              >
                <MenuItem value="">
                  <em>Good-level</em>
                </MenuItem>
                {(selectedOwnGood?.batches || []).map(b => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.batchNumber}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Title" value={labTitle} onChange={e => setLabTitle(e.target.value)} size="small" fullWidth />
            <Button component="label" variant="outlined">
              Upload lab document
              <input
                type="file"
                hidden
                onChange={async e => {
                  const file = e.target.files?.[0];
                  if (!file || !labOwnGoodId) return;
                  const fd = new FormData();
                  fd.append('file', file);
                  fd.append('ownGoodId', labOwnGoodId);
                  if (labBatchId) fd.append('ownGoodBatchId', labBatchId);
                  if (labTitle) fd.append('title', labTitle);
                  try {
                    const res = await fetch(`${API_BASE_URL}/api/production/lab/upload`, {
                      method: 'POST',
                      body: fd,
                      credentials: 'include',
                    });
                    if (!res.ok) {
                      const j = await res.json().catch(() => ({}));
                      throw new Error((j as { error?: string }).error || res.statusText);
                    }
                    await refresh();
                    flash('Uploaded');
                  } catch (ex: unknown) {
                    setErr(ex instanceof Error ? ex.message : 'Upload failed');
                  }
                  e.target.value = '';
                }}
              />
            </Button>
          </Stack>
          <Table size="small" sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>File</TableCell>
                <TableCell>Own good</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(labList as { id: string; filename: string; ownGood?: { name: string } }[]).map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.filename}</TableCell>
                  <TableCell>{row.ownGood?.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <ChecklistRunDialog
        open={!!activeChecklist}
        runId={activeChecklist?.id ?? null}
        title={activeChecklist?.title}
        onClose={() => setActiveChecklist(null)}
        onUpdated={() => {
          void refresh();
          void loadHistory();
        }}
      />
      <Dialog open={!!machineDossierId} onClose={() => setMachineDossierId(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          Machine dossier
          <IconButton size="small" onClick={() => setMachineDossierId(null)}>
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {machineDossierId && (
            <MachineDossier
              machineId={machineDossierId}
              onOpenRun={(id, title) => {
                setMachineDossierId(null);
                openNewRun(id, title);
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMachineDossierId(null)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!plantDossierId} onClose={() => setPlantDossierId(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          Plant dossier
          <IconButton size="small" onClick={() => setPlantDossierId(null)}>
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {plantDossierId && (
            <PlantDossier
              plantId={plantDossierId}
              onOpenRun={(id, title) => {
                setPlantDossierId(null);
                openNewRun(id, title);
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlantDossierId(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Production;
