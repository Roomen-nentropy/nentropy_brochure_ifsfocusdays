import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  LocationOn as LocationOnIcon,
  Description as DescriptionIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../services';

interface SupplierDossierProps {
  supplierId: string;
}

export const SupplierDossier: React.FC<SupplierDossierProps> = ({
  supplierId,
}) => {
  const { t } = useTranslation(['suppliers', 'common']);
  const [activeTab, setActiveTab] = React.useState(0);

  const { data: dossier, isLoading } = useQuery({
    queryKey: ['supplier-dossier', supplierId],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/supplier-master-data/${supplierId}/dossier`,
        { withCredentials: true }
      );
      return response.data;
    },
  });

  if (isLoading) {
    return <LinearProgress />;
  }

  if (!dossier) {
    return (
      <Alert severity="info">{t('suppliers:dossier.noDataAvailable')}</Alert>
    );
  }

  const dataQualityColor =
    dossier.masterData?.dataQualityScore >= 80
      ? 'success'
      : dossier.masterData?.dataQualityScore >= 50
        ? 'warning'
        : 'error';

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {dossier.supplier.name}
        </Typography>

        {dossier.masterData && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('suppliers:dossier.dataQualityScore')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LinearProgress
                variant="determinate"
                value={dossier.masterData.dataQualityScore}
                color={dataQualityColor}
                sx={{ flex: 1, height: 8, borderRadius: 4 }}
              />
              <Typography variant="h6" color={`${dataQualityColor}.main`}>
                {dossier.masterData.dataQualityScore}/100
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              {t('suppliers:dossier.lastUpdated')}:{' '}
              {new Date(dossier.masterData.updatedAt).toLocaleDateString()}
            </Typography>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab
            icon={<LocationOnIcon />}
            label={`${t('suppliers:dossier.tabs.geolocations')} (${dossier.verifiedGeolocations?.length || 0})`}
          />
          <Tab
            icon={<DescriptionIcon />}
            label={`${t('suppliers:dossier.tabs.documents')} (${dossier.documents?.length || 0})`}
          />
          <Tab
            icon={<VerifiedUserIcon />}
            label={`${t('suppliers:dossier.tabs.certifications')} (${dossier.certifications?.length || 0})`}
          />
          <Tab label={t('suppliers:dossier.tabs.history')} />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {t('suppliers:dossier.geolocations.title')}
              </Typography>
              {dossier.verifiedGeolocations &&
              dossier.verifiedGeolocations.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          {t('suppliers:dossier.geolocations.latitude')}
                        </TableCell>
                        <TableCell>
                          {t('suppliers:dossier.geolocations.longitude')}
                        </TableCell>
                        <TableCell>
                          {t('suppliers:dossier.geolocations.country')}
                        </TableCell>
                        <TableCell>
                          {t('suppliers:dossier.geolocations.plotId')}
                        </TableCell>
                        <TableCell>
                          {t('suppliers:dossier.geolocations.status')}
                        </TableCell>
                        <TableCell>
                          {t('suppliers:dossier.geolocations.verified')}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dossier.verifiedGeolocations.map((geo: any) => (
                        <TableRow key={geo.id}>
                          <TableCell>{geo.latitude.toFixed(6)}</TableCell>
                          <TableCell>{geo.longitude.toFixed(6)}</TableCell>
                          <TableCell>{geo.country}</TableCell>
                          <TableCell>{geo.plotId || '-'}</TableCell>
                          <TableCell>
                            {geo.isDuplicateSuspect ? (
                              <Chip
                                label={t(
                                  'suppliers:dossier.geolocations.duplicateSuspect'
                                )}
                                color="warning"
                                size="small"
                                icon={<WarningIcon />}
                              />
                            ) : (
                              <Chip
                                label={t(
                                  'suppliers:dossier.geolocations.verifiedLabel'
                                )}
                                color="success"
                                size="small"
                                icon={<CheckCircleIcon />}
                              />
                            )}
                          </TableCell>
                          <TableCell>{geo.verificationCount}x</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  {t('suppliers:dossier.geolocations.noGeolocations')}
                </Alert>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {t('suppliers:dossier.documents.title')}
              </Typography>
              {dossier.documents && dossier.documents.length > 0 ? (
                <List>
                  {dossier.documents.map((doc: any) => (
                    <ListItem
                      key={doc.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemText
                        primary={doc.originalName || doc.filename}
                        secondary={
                          <>
                            {t('suppliers:dossier.documents.type')}:{' '}
                            {doc.documentType} •{' '}
                            {t('suppliers:dossier.documents.country')}:{' '}
                            {doc.country || 'N/A'} •{' '}
                            {t('suppliers:dossier.documents.source')}:{' '}
                            {doc.sourceType}
                            <br />
                            {t('suppliers:dossier.documents.uploaded')}:{' '}
                            {new Date(doc.uploadedAt).toLocaleString()} •{' '}
                            {t('suppliers:dossier.documents.valid')}:{' '}
                            {doc.isValid
                              ? t('suppliers:dossier.documents.yes')
                              : t('suppliers:dossier.documents.no')}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">
                  {t('suppliers:dossier.documents.noDocuments')}
                </Alert>
              )}
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {t('suppliers:dossier.certifications.title')}
              </Typography>
              {dossier.certifications && dossier.certifications.length > 0 ? (
                <List>
                  {dossier.certifications.map((cert: any) => (
                    <ListItem
                      key={cert.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            {cert.certificationType}
                            {cert.isActive && (
                              <Chip
                                label={t(
                                  'suppliers:dossier.certifications.active'
                                )}
                                color="success"
                                size="small"
                                icon={<CheckCircleIcon />}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            {t(
                              'suppliers:dossier.certifications.certificateNumber'
                            )}
                            : {cert.certificateNumber}
                            <br />
                            {t(
                              'suppliers:dossier.certifications.issuedBy'
                            )}: {cert.issuedBy || 'N/A'} •{' '}
                            {t('suppliers:dossier.certifications.issued')}:{' '}
                            {cert.issuedAt
                              ? new Date(cert.issuedAt).toLocaleDateString()
                              : 'N/A'}{' '}
                            {cert.expiresAt && (
                              <>
                                •{' '}
                                {t('suppliers:dossier.certifications.expires')}:{' '}
                                {new Date(cert.expiresAt).toLocaleDateString()}
                              </>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">
                  {t('suppliers:dossier.certifications.noCertifications')}
                </Alert>
              )}
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {t('suppliers:dossier.history.title')}
              </Typography>

              {dossier.masterData?.lastDDSSurveyDate && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('suppliers:dossier.history.lastDDSSurvey')}
                  </Typography>
                  <Typography variant="body1">
                    {new Date(
                      dossier.masterData.lastDDSSurveyDate
                    ).toLocaleString()}
                  </Typography>
                </Box>
              )}

              {dossier.masterData?.lastRiskAssessmentDate && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('suppliers:dossier.history.lastRiskAssessment')}
                  </Typography>
                  <Typography variant="body1">
                    {new Date(
                      dossier.masterData.lastRiskAssessmentDate
                    ).toLocaleString()}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                {t('suppliers:dossier.history.ddsSurveys')}
              </Typography>
              {dossier.supplier.ddsSurveyInstances?.length > 0 ? (
                <List>
                  {dossier.supplier.ddsSurveyInstances.map((survey: any) => (
                    <ListItem key={survey.id}>
                      <ListItemText
                        primary={`${t('suppliers:dossier.history.surveyMode')} - ${survey.surveyMode}`}
                        secondary={`${survey.status} • ${t('suppliers:dossier.history.completed')}: ${
                          survey.completedAt
                            ? new Date(survey.completedAt).toLocaleDateString()
                            : 'N/A'
                        }`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">
                  {t('suppliers:dossier.history.noDDSSurveys')}
                </Alert>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                {t('suppliers:dossier.history.riskAssessments')}
              </Typography>
              {dossier.supplier.riskAssessments?.length > 0 ? (
                <List>
                  {dossier.supplier.riskAssessments.map((assessment: any) => (
                    <ListItem key={assessment.id}>
                      <ListItemText
                        primary={t(
                          'suppliers:dossier.history.assessmentVersion',
                          { version: assessment.version }
                        )}
                        secondary={`${assessment.status} • ${t('suppliers:dossier.history.risk')}: ${assessment.riskLevel} • ${new Date(assessment.createdAt).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">
                  {t('suppliers:dossier.history.noRiskAssessments')}
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};
