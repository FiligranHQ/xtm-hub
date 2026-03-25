import MDEditor from '@uiw/react-md-editor';
import { useTheme } from 'next-themes';
import rehypeSanitize from 'rehype-sanitize';

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
        style={{
          background: 'hsl(var(--page-background))',
          color: 'hsl(var(--text-foreground))',
        }}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
          style: {
            background: 'transparent',
            color: 'hsl(var(--text-foreground))',
          },
        }}
        textareaProps={{
          placeholder,
          disabled,
          style: {
            background: 'transparent',
            color: 'hsl(var(--text-foreground))',
          },
        }}
      />
    </div>
  );
};

export default MarkdownInput;
