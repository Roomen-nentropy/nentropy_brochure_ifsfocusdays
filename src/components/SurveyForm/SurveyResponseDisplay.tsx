import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import type { SurveyQuestion } from '../../types/survey.types';

interface SurveyResponseDisplayProps {
  response: unknown;
  question?: SurveyQuestion;
}

const SurveyResponseDisplay: React.FC<SurveyResponseDisplayProps> = ({
  response,
  question,
}) => {
  const renderFileField = (fileData: unknown) => {
    let fileInfo;

    try {
      if (typeof fileData === 'string') {
        try {
          fileInfo = JSON.parse(fileData);
        } catch {
          fileInfo = { filename: fileData, name: fileData };
        }
      } else {
        fileInfo = fileData;
      }

      if (Array.isArray(fileInfo)) {
        return (
          <Box sx={{ width: '100%' }}>
            {fileInfo.map((file, idx) => {
              const fileName = file.filename || file.name || `File ${idx + 1}`;
              const fileUrl = file.url || file.s3Url;

              return (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 0.5,
                    width: '100%',
                  }}
                >
                  <Chip
                    size="small"
                    label={fileName}
                    variant="outlined"
                    color="primary"
                  />
                  {fileUrl ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant="caption">
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      </Typography>
                      <Typography variant="caption">
                        <a
                          href={fileUrl}
                          download={fileName}
                          rel="noopener noreferrer"
                        >
                          Download
                        </a>
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      (File uploaded, URL not available)
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        );
      }

      // Single file
      const fileName = fileInfo.filename || fileInfo.name || 'File';
      const fileUrl = fileInfo.url || fileInfo.s3Url;

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            label={fileName}
            variant="outlined"
            color="primary"
          />
          {fileUrl ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="caption">
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  View
                </a>
              </Typography>
              <Typography variant="caption">
                <a href={fileUrl} download={fileName} rel="noopener noreferrer">
                  Download
                </a>
              </Typography>
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary">
              (File uploaded, URL not available)
            </Typography>
          )}
        </Box>
      );
    } catch (error) {
      console.error('Error rendering file field:', error);
      return <Typography variant="body2">File data available</Typography>;
    }
  };

  if (!response || response === '') {
    return <Typography color="text.secondary">No response</Typography>;
  }

  let parsedResponse;

  try {
    parsedResponse =
      typeof response === 'string' ? JSON.parse(response) : response;
  } catch {
    parsedResponse = response;
  }

  if (question?.type === 'file') {
    return renderFileField(parsedResponse);
  }

  // Render certificate collection
  if (question?.type === 'certificate_collection') {
    if (!parsedResponse || typeof parsedResponse !== 'object') {
      return (
        <Typography color="text.secondary">No certificates provided</Typography>
      );
    }

    const certificates = parsedResponse as Record<string, unknown>;
    const certEntries = Object.entries(certificates);

    if (certEntries.length === 0) {
      return (
        <Typography color="text.secondary">No certificates provided</Typography>
      );
    }

    return (
      <Box
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
      >
        {certEntries.map(([certId, certData]) => {
          if (!certData || typeof certData !== 'object') return null;

          const cert = certData as Record<string, unknown>;
          const hasIt = cert.hasIt === true;
          const certNumber = (cert.certNumber || cert.certificateNumber) as
            | string
            | undefined;
          const validityDate = (cert.validityDate || cert.expiryDate) as
            | string
            | undefined;
          const files = (cert.files || []) as unknown[];

          return (
            <Card key={certId} variant="outlined" sx={{ width: '100%' }}>
              <CardContent>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                >
                  <Typography variant="subtitle1" fontWeight="medium">
                    {certId.toUpperCase()}
                  </Typography>
                  <Chip
                    label={hasIt ? 'Has Certificate' : 'No Certificate'}
                    color={hasIt ? 'success' : 'default'}
                    size="small"
                  />
                </Box>

                {hasIt && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      mt: 2,
                    }}
                  >
                    {certNumber && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Certificate Number:
                        </Typography>
                        <Typography variant="body2">{certNumber}</Typography>
                      </Box>
                    )}

                    {validityDate && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Valid Until:
                        </Typography>
                        <Typography variant="body2">
                          {new Date(validityDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}

                    {files && files.length > 0 && (
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mb: 0.5 }}
                        >
                          Attached Files:
                        </Typography>
                        {renderFileField(files)}
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>
    );
  }

  // Render specific field type based on its type
  const renderTypedField = (value: unknown, fieldType?: string) => {
    if (value === undefined || value === null) return '—';

    switch (fieldType) {
      case 'file':
        return renderFileField(value);
      case 'boolean': {
        const boolValue = value === true || value === 'true';
        return (
          <Chip
            label={boolValue ? 'Yes' : 'No'}
            color={boolValue ? 'success' : 'default'}
            size="small"
          />
        );
      }
      case 'select':
      case 'multiselect':
        if (Array.isArray(value)) {
          return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {value.map((item, i) => (
                <Chip key={i} label={item} size="small" />
              ))}
            </Box>
          );
        }
        return <Chip label={String(value)} size="small" />;
      case 'date':
        try {
          const date = new Date(String(value));
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString();
          }
        } catch {
          //
        }
        return String(value);
      default:
        return String(value);
    }
  };

  if (question?.type === 'multi_entry') {
    if (!parsedResponse || parsedResponse.length === 0) {
      return <Typography color="text.secondary">No entries added</Typography>;
    }

    const fieldLabels =
      question.entryFields?.reduce(
        (acc, field) => {
          acc[field.id] = field.question;
          return acc;
        },
        {} as Record<string, string>
      ) || {};

    // Create a map of field types for quick lookup
    const fieldTypes =
      question.entryFields?.reduce(
        (acc, field) => {
          acc[field.id] = field.type;
          return acc;
        },
        {} as Record<string, string>
      ) || {};

    return (
      <Box sx={{ width: '100%', overflow: 'auto' }}>
        <Typography variant="subtitle2" gutterBottom>
          {parsedResponse.length}{' '}
          {parsedResponse.length === 1 ? 'entry' : 'entries'} provided
        </Typography>

        {question.entryFields && parsedResponse.length > 0 ? (
          <Box sx={{ maxHeight: 400, overflow: 'auto', mt: 1 }}>
            <Table
              size="small"
              stickyHeader
              sx={{
                width: '100%',
                tableLayout: 'fixed',
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    width="40"
                    sx={{
                      height: 48,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    #
                  </TableCell>
                  {question.entryFields.map(field => (
                    <TableCell
                      key={field.id}
                      sx={{
                        height: 48,
                        maxWidth: 200,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={field.question}
                    >
                      {field.question}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {parsedResponse.map(
                  (entry: Record<string, unknown>, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      {question.entryFields?.map(field => (
                        <TableCell
                          key={field.id}
                          sx={{ wordBreak: 'break-word' }}
                        >
                          {entry[field.id] !== undefined &&
                          entry[field.id] !== null
                            ? renderTypedField(entry[field.id], field.type)
                            : '—'}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </Box>
        ) : (
          parsedResponse.map(
            (entry: Record<string, unknown>, index: number) => (
              <Card
                key={index}
                variant="outlined"
                sx={{ mb: 1, width: '100%' }}
              >
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Entry #{index + 1}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      width: '100%',
                    }}
                  >
                    {Object.entries(entry).map(([key, value]) => (
                      <Box key={key} sx={{ width: '100%' }}>
                        <Typography variant="caption" color="text.secondary">
                          {fieldLabels[key] || key}:
                        </Typography>
                        <Box mt={0.5}>
                          {renderTypedField(value, fieldTypes[key])}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )
          )
        )}
      </Box>
    );
  }

  if (Array.isArray(parsedResponse)) {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {parsedResponse.map((item, index) => (
          <Chip key={index} label={item} size="small" />
        ))}
      </Box>
    );
  }

  if (typeof parsedResponse === 'boolean') {
    return (
      <Chip
        label={parsedResponse ? 'Yes' : 'No'}
        color={parsedResponse ? 'success' : 'default'}
        size="small"
      />
    );
  }

  if (
    typeof parsedResponse === 'object' &&
    parsedResponse !== null &&
    (parsedResponse.filename ||
      parsedResponse.name ||
      (Array.isArray(parsedResponse) &&
        parsedResponse.some(item => item.filename || item.name)))
  ) {
    return renderFileField(parsedResponse);
  }

  if (typeof parsedResponse === 'object' && parsedResponse !== null) {
    return (
      <Box
        sx={{
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          width: '100%',
          overflow: 'auto',
        }}
      >
        {JSON.stringify(parsedResponse, null, 2)}
      </Box>
    );
  }

  return <Typography variant="body2">{String(parsedResponse)}</Typography>;
};

export default SurveyResponseDisplay;
