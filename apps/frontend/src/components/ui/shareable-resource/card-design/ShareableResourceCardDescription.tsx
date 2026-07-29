'use client';

interface ShareableResourceCardDescriptionProps {
  description?: string | null;
}

export const ShareableResourceCardDescription = ({
  description,
}: ShareableResourceCardDescriptionProps) => {
  return (
    <p className="text-muted-foreground text-sm overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] sm:[-webkit-line-clamp:5]">
      {description}
    </p>
  );
};
