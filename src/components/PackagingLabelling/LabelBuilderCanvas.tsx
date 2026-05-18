import React, { useRef, useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import { Box, Button, Stack, TextField, MenuItem, Typography } from '@mui/material';
import type { LabelDesignElement } from '../../types/packaging-labelling.types';

const BIND_KEYS = [
  { value: '', label: '(static text)' },
  { value: 'operator_name', label: 'Operator name' },
  { value: 'product_name', label: 'Product name' },
  { value: 'packaging_name', label: 'Packaging name' },
  { value: 'batch_number', label: 'Batch number' },
  { value: 'batch_date', label: 'Batch date' },
  { value: 'material_composition_label', label: 'Material composition' },
  { value: 'declaration_number', label: 'Declaration number' },
];

type Props = {
  widthMm: number;
  heightMm: number;
  elements: LabelDesignElement[];
  onChange: (elements: LabelDesignElement[]) => void;
  readOnly?: boolean;
};

const SCALE = 3;

export const LabelBuilderCanvas: React.FC<Props> = ({
  widthMm,
  heightMm,
  elements,
  onChange,
  readOnly,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const idRef = useRef(0);

  const w = widthMm * SCALE;
  const h = heightMm * SCALE;

  const selected = elements.find(e => e.id === selectedId);

  const addText = () => {
    const id = `el-${++idRef.current}`;
    onChange([
      ...elements,
      {
        id,
        type: 'text',
        x: 20,
        y: 20,
        text: 'Text',
        fontSize: 14,
        bindKey: '',
      },
    ]);
    setSelectedId(id);
  };

  const addQrPlaceholder = () => {
    const id = `el-${++idRef.current}`;
    onChange([
      ...elements,
      { id, type: 'qr', x: w - 80, y: h - 80, width: 70, height: 70 },
    ]);
    setSelectedId(id);
  };

  const updateSelected = (patch: Partial<LabelDesignElement>) => {
    if (!selectedId) return;
    onChange(elements.map(e => (e.id === selectedId ? { ...e, ...patch } : e)));
  };

  return (
    <Stack spacing={2}>
      {!readOnly && (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={addText}>
            Add text
          </Button>
          <Button size="small" variant="outlined" onClick={addQrPlaceholder}>
            Add QR area
          </Button>
        </Stack>
      )}
      <Box sx={{ border: '1px solid', borderColor: 'divider', bgcolor: '#fafafa' }}>
        <Stage
          width={w}
          height={h}
          onMouseDown={e => {
            if (e.target === e.target.getStage()) setSelectedId(null);
          }}
        >
          <Layer>
            <Rect x={0} y={0} width={w} height={h} fill="white" />
            {elements.map(el => {
              if (el.type === 'qr') {
                return (
                  <Rect
                    key={el.id}
                    x={el.x}
                    y={el.y}
                    width={el.width ?? 60}
                    height={el.height ?? 60}
                    stroke="#1976d2"
                    dash={[4, 4]}
                    fill="#e3f2fd"
                    draggable={!readOnly}
                    onClick={() => setSelectedId(el.id)}
                    onDragEnd={ev =>
                      onChange(
                        elements.map(e =>
                          e.id === el.id
                            ? { ...e, x: ev.target.x(), y: ev.target.y() }
                            : e
                        )
                      )
                    }
                  />
                );
              }
              return (
                <Text
                  key={el.id}
                  x={el.x}
                  y={el.y}
                  text={el.bindKey ? `[${el.bindKey}]` : el.text ?? ''}
                  fontSize={el.fontSize ?? 14}
                  fill="#111"
                  draggable={!readOnly}
                  onClick={() => setSelectedId(el.id)}
                  onDragEnd={ev =>
                    onChange(
                      elements.map(e =>
                        e.id === el.id
                          ? { ...e, x: ev.target.x(), y: ev.target.y() }
                          : e
                      )
                    )
                  }
                />
              );
            })}
          </Layer>
        </Stage>
      </Box>
      {selected && !readOnly && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Selected element
          </Typography>
          {selected.type === 'text' && (
            <Stack spacing={1}>
              <TextField
                size="small"
                label="Static text"
                value={selected.text ?? ''}
                disabled={!!selected.bindKey}
                onChange={e => updateSelected({ text: e.target.value })}
              />
              <TextField
                select
                size="small"
                label="Data binding"
                value={selected.bindKey ?? ''}
                onChange={e =>
                  updateSelected({
                    bindKey: e.target.value,
                    text: e.target.value ? '' : selected.text,
                  })
                }
              >
                {BIND_KEYS.map(k => (
                  <MenuItem key={k.value} value={k.value}>
                    {k.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          )}
        </Box>
      )}
    </Stack>
  );
};
