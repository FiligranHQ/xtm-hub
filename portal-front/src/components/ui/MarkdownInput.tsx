import MDEditor from '@uiw/react-md-editor';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import rehypeSanitize from 'rehype-sanitize';

const MarkdownInput = ({
  value,
  onChange,
  placeholder,
}: {
  value?: string;
  onChange: (v: string | undefined) => void;
  placeholder: string;
}) => {
  const t = useTranslations();
  const { theme } = useTheme();

  return (
    <div data-color-mode={theme}>
      <MDEditor
        value={value}
        onChange={onChange}
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
          placeholder: t(placeholder),
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
