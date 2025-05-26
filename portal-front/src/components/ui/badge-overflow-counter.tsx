'use client';

import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'filigran-ui';
import { Badge } from 'filigran-ui/servers';
import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useEventListener } from 'usehooks-ts';

interface BadgeOverflowCounterProps {
  badges: Readonly<BadgeOverflow[]>;
  className?: string;
}

export interface BadgeOverflow {
  id: string;
  name: string;
  color: string;
}

const BadgeOverflowCounter: FunctionComponent<BadgeOverflowCounterProps> = ({
  badges = [],
  className,
}) => {
  const containerRef = useRef(null);
  const [visibleTags, setVisibleTags] = useState<number>(badges.length);
  const updateVisibility = () => {
    if (!containerRef.current) {
      return;
    }
    const container: HTMLDivElement = containerRef.current;
    let totalWidth = 56;
    let lastVisibleIndex = badges.length;
    const children = Array.from(container.children) as unknown as HTMLElement[];
    for (let i = 0; i < children.length; i++) {
      totalWidth += children[i]!.offsetWidth;
      if (totalWidth > container.offsetWidth) {
        lastVisibleIndex = i;
        break;
      }
    }
    setVisibleTags(lastVisibleIndex);
  };

  useEffect(() => {
    updateVisibility();
  }, [badges]);
  useEventListener('resize', updateVisibility);

  const hiddenCount = badges.length - visibleTags;
  return (
    <div
      ref={containerRef}
      className={cn(
        'flex gap-s overflow-hidden flex-1 items-center',
        className
      )}>
      {badges.map(({ id, name, color }, index) => (
        <Badge
          className="whitespace-nowrap aria-hidden:invisible aria-hidden:absolute uppercase"
          aria-hidden={index >= visibleTags}
          key={id}
          color={color}>
          {name}
        </Badge>
      ))}
      {hiddenCount > 0 && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className="whitespace-nowrap cursor-pointer">
                +{hiddenCount}...
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-50">
              <div className="flex gap-s">
                {badges.map(({ id, name, color }, index) =>
                  index >= visibleTags ? (
                    <Badge
                      className="uppercase"
                      key={id}
                      color={color}>
                      {name}
                    </Badge>
                  ) : null
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default BadgeOverflowCounter;
