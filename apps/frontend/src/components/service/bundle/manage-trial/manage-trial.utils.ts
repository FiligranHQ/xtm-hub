export const formatEmailList = (
  emails: string[],
  maxVisible: number = 3
): { visible: string; hiddenCount: number } => {
  const visible = emails.slice(0, maxVisible).join(', ');
  const hiddenCount = Math.max(emails.length - maxVisible, 0);

  return { visible, hiddenCount };
};
