import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from '@tiptap/extension-table';
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
  ButtonGroup,
  Button,
} from '@mui/material';
import { Undo, Redo, Sparkles } from 'lucide-react';
import {
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatListBulleted as BulletListIcon,
  FormatListNumbered as OrderedListIcon,
  FormatAlignLeft as AlignLeftIcon,
  FormatAlignCenter as AlignCenterIcon,
  FormatAlignRight as AlignRightIcon,
  TableBar as TableIcon,
} from '@mui/icons-material';
import { TextStyle } from '@tiptap/extension-text-style';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onValidate?: () => void;
  onAIAssist?: () => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onAIAssist,
  onValidate,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      FontFamily,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
        style: 'min-height: 200px; padding: 16px;',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <Paper elevation={0} sx={{ boxShadow: 'none', borderRadius: 0 }}>
      {/* Toolbar */}
      <Toolbar
        variant="dense"
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexWrap: 'wrap',
          gap: 1,
          minHeight: 'auto',
          py: 1,
        }}
      >
        {/* Text Formatting */}
        <ButtonGroup size="small" variant="outlined">
          <Tooltip title="Bold">
            <IconButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              color={editor.isActive('bold') ? 'primary' : 'default'}
              size="small"
            >
              <BoldIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              color={editor.isActive('italic') ? 'primary' : 'default'}
              size="small"
            >
              <ItalicIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Lists */}
        <ButtonGroup size="small" variant="outlined">
          <Tooltip title="Bullet List">
            <IconButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              color={editor.isActive('bulletList') ? 'primary' : 'default'}
              size="small"
            >
              <BulletListIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Numbered List">
            <IconButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              color={editor.isActive('orderedList') ? 'primary' : 'default'}
              size="small"
            >
              <OrderedListIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Alignment */}
        <ButtonGroup size="small" variant="outlined">
          <Tooltip title="Align Left">
            <IconButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              color={
                editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'
              }
              size="small"
            >
              <AlignLeftIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Center">
            <IconButton
              onClick={() =>
                editor.chain().focus().setTextAlign('center').run()
              }
              color={
                editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'
              }
              size="small"
            >
              <AlignCenterIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Right">
            <IconButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              color={
                editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'
              }
              size="small"
            >
              <AlignRightIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Table */}
        <Tooltip title="Insert Table">
          <IconButton onClick={addTable} size="small">
            <TableIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={editor.getAttributes('textStyle').fontFamily || 'Arial'}
            onChange={e =>
              editor.chain().focus().setFontFamily(e.target.value).run()
            }
            displayEmpty
            size="small"
          >
            <MenuItem value="Arial">Arial</MenuItem>
            <MenuItem value="Times New Roman">Times New Roman</MenuItem>
            <MenuItem value="Courier New">Courier New</MenuItem>
            <MenuItem value="Helvetica">Helvetica</MenuItem>
          </Select>
        </FormControl>

        <Divider orientation="vertical" flexItem />

        {/* Undo/Redo */}
        <ButtonGroup size="small" variant="outlined">
          <Tooltip title="Undo">
            <IconButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              size="small"
            >
              <Undo size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Redo">
            <IconButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              size="small"
            >
              <Redo size={16} />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        {/* AI Assist */}
        {onAIAssist && (
          <>
            <Divider orientation="vertical" flexItem />
            <Tooltip title="AI Assistant">
              <Button
                onClick={onAIAssist}
                startIcon={<Sparkles size={20} />}
                size="small"
                variant="contained"
                color="secondary"
              >
                AI Assist
              </Button>
            </Tooltip>
          </>
        )}

        {onValidate && (
          <Tooltip title="Validate">
            <Button
              onClick={onValidate}
              size="small"
              variant="contained"
              color="secondary"
            >
              Validate
            </Button>
          </Tooltip>
        )}
      </Toolbar>

      {/* Editor Content */}
      <Box
        sx={{
          '& .ProseMirror': {
            outline: 'none',
            minHeight: '200px',
            p: 2,
            '& table': {
              borderCollapse: 'collapse',
              margin: 0,
              overflow: 'hidden',
              tableLayout: 'fixed',
              width: '100%',
              '& td, & th': {
                border: '1px solid #ccc',
                boxSizing: 'border-box',
                minWidth: '1em',
                padding: '6px 8px',
                position: 'relative',
                verticalAlign: 'top',
                '&.selectedCell': {
                  backgroundColor: '#E3F2FD',
                },
              },
              '& th': {
                backgroundColor: '#f1f1f1',
                fontWeight: 'bold',
                textAlign: 'left',
              },
            },
            '& .tableWrapper': {
              margin: '1.5rem 0',
              overflowX: 'auto',
            },
            '& .resize-cursor': {
              cursor: 'ew-resize',
              cursorColor: 'blue',
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Paper>
  );
};

export default RichTextEditor;
