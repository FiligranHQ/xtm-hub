import MDEditor from '@uiw/react-md-editor';
import { useTheme } from 'next-themes';
import type { CSSProperties } from 'react';
import rehypeSanitize from 'rehype-sanitize';

// The editor and its toolbar both paint this library variable.
const editorStyle = {
  '--md-editor-background-color': 'var(--bg-input-default)',
  color: 'var(--text-default-primary)',
} as CSSProperties;

const MarkdownInput = ({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value?: string;
  onChange: (v: string | undefined) => void;
  placeholder: string;
  disabled?: boolean;
}) => {
  const { theme } = useTheme();

  return (
    <div data-color-mode={theme}>
      <MDEditor
        value={value}
        onChange={onChange}
        highlightEnable={false}
        style={editorStyle}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
          style: {
            background: 'transparent',
            color: 'var(--text-default-primary)',
          },
        }}
        textareaProps={{
          placeholder,
          disabled,
          style: {
            background: 'transparent',
            color: 'var(--text-default-primary)',
          },
        }}
      />
    </div>
  );
};

export default MarkdownInput;
