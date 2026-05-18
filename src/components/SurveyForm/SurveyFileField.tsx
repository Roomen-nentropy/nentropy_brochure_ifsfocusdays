import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  CircularProgress,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  Upload,
  File,
  X,
  DownloadCloud,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUploadFile, useDownloadFile } from '../../hooks/useSurveys';
import type { FileInfo } from '../../types/survey.types';

interface SurveyFileFieldProps {
  id: string;
  question: string;
  required: boolean;
  value: FileInfo[] | null;
  onChange: (id: string, value: FileInfo[]) => void;
  disabled?: boolean;
  surveyToken?: string;
  multiple?: boolean;
  acceptedTypes?: string;
  error?: boolean;
  helperText?: string;
  // For multi-entry field context
  parentQuestionId?: string;
  entryIndex?: number;
}

const SurveyFileField: React.FC<SurveyFileFieldProps> = ({
  id,
  question,
  required,
  value = [],
  onChange,
  disabled = false,
  surveyToken,
  multiple = false,
  acceptedTypes = '*',
  error = false,
  helperText,
  parentQuestionId,
  entryIndex,
}) => {
  const { t } = useTranslation(['surveyForm']);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const uploadMutation = useUploadFile();
  const downloadMutation = useDownloadFile();

  // Convert value to array if it's not already
  const fileList = Array.isArray(value) ? value : value ? [value] : [];

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || !event.target.files.length) return;

    setUploading(true);

    try {
      const files = event.target.files;
      const updatedFiles = multiple ? [...fileList] : [];

      for (const file of files) {
        const newFile: FileInfo = {
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'uploading',
          progress: 0,
        };

        updatedFiles.push(newFile);
        onChange(id, updatedFiles);

        if (surveyToken) {
          try {
            const result = await uploadMutation.mutateAsync({
              token: surveyToken,
              questionId: parentQuestionId || id,
              file,
              entryFieldId: parentQuestionId ? id : undefined,
              entryIndex: entryIndex,
            });

            const fileIndex = updatedFiles.findIndex(
              f => f.name === file.name && f.status === 'uploading'
            );
            if (fileIndex !== -1) {
              updatedFiles[fileIndex] = {
                ...updatedFiles[fileIndex],
                id: result.id,
                url: result.s3Url || result.url,
                status: 'complete',
                progress: 100,
              };
              onChange(id, updatedFiles);
            }
          } catch (error) {
            console.error('Failed to upload file:', error);

            // Mark file as error
            const fileIndex = updatedFiles.findIndex(
              f => f.name === file.name && f.status === 'uploading'
            );
            if (fileIndex !== -1) {
              updatedFiles[fileIndex] = {
                ...updatedFiles[fileIndex],
                status: 'error',
              };
              onChange(id, updatedFiles);
            }
          }
        } else {
          // Local mode - just add the file to the list
          const fileIndex = updatedFiles.findIndex(
            f => f.name === file.name && f.status === 'uploading'
          );
          if (fileIndex !== -1) {
            updatedFiles[fileIndex] = {
              ...updatedFiles[fileIndex],
              status: 'complete',
              progress: 100,
            };
            onChange(id, updatedFiles);
          }
        }
      }
    } catch (error) {
      console.error('Error handling files:', error);
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...fileList];
    updatedFiles.splice(index, 1);
    onChange(id, updatedFiles);
  };

  const handleDownloadFile = async (fileInfo: FileInfo) => {
    if (!fileInfo.id || !surveyToken) {
      // Handle local file or direct URL
      if (fileInfo.url) {
        window.open(fileInfo.url, '_blank');
      }
      return;
    }

    try {
      const result = await downloadMutation.mutateAsync({
        token: surveyToken,
        fileId: fileInfo.id,
      });

      if (result.url) {
        window.open(result.url, '_blank');
      }
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        {question}
        {required && <span>*</span>}
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mt: 1,
          border: error ? '1px solid red' : undefined,
          backgroundColor: 'background.paper',
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          multiple={multiple}
          accept={acceptedTypes}
          disabled={disabled || uploading}
        />

        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          sx={{ p: 2 }}
        >
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            sx={{ mb: 2, width: 56, height: 56 }}
          >
            <Upload size={32} />
          </IconButton>

          <Button
            variant="outlined"
            startIcon={<Upload size={18} />}
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
          >
            {multiple
              ? t('surveyForm:fileField.uploadFiles')
              : t('surveyForm:fileField.uploadFile')}
          </Button>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {multiple
              ? t('surveyForm:fileField.dropFilesHere')
              : t('surveyForm:fileField.dropFileHere')}
          </Typography>

          {acceptedTypes !== '*' && (
            <Typography variant="caption" color="text.secondary">
              {t('surveyForm:fileField.acceptedFormats', {
                formats: acceptedTypes,
              })}
            </Typography>
          )}
        </Box>

        {fileList.length > 0 && (
          <List sx={{ width: '100%', mt: 2 }}>
            {fileList.map((file, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveFile(index)}
                    disabled={disabled}
                  >
                    <X size={18} />
                  </IconButton>
                }
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon>
                  {file.status === 'uploading' ? (
                    <CircularProgress size={24} />
                  ) : file.status === 'error' ? (
                    <AlertCircle size={24} color="red" />
                  ) : (
                    <File size={24} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Typography variant="body2" noWrap sx={{ flexGrow: 1 }}>
                        {file.name}
                      </Typography>
                      {file.status === 'complete' && (
                        <Chip
                          icon={<Check size={14} />}
                          label={t('surveyForm:fileField.uploaded')}
                          size="small"
                          color="success"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" display="block">
                        {(file.size / 1024).toFixed(1)} KB
                      </Typography>
                      {file.status === 'uploading' && (
                        <LinearProgress
                          variant="indeterminate"
                          sx={{ mt: 1, height: 4 }}
                        />
                      )}
                    </>
                  }
                />
                {file.status === 'complete' && file.id && (
                  <IconButton
                    onClick={() => handleDownloadFile(file)}
                    sx={{ ml: 1 }}
                  >
                    <DownloadCloud size={18} />
                  </IconButton>
                )}
              </ListItem>
            ))}
          </List>
        )}

        {error && helperText && (
          <Typography
            color="error"
            variant="caption"
            sx={{ mt: 1, display: 'block' }}
          >
            {helperText}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default SurveyFileField;
