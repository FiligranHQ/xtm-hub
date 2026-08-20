import { localizedCardDescription, localizedCardName } from '@/utils/services';
import { LibraryUpdateMetadata } from './LibraryUpdateMetadata';

export const heroSectionLibraryTranslationKeys = {
  eyebrow: 'Service.LibraryHero.Eyebrow',
} as const;

interface HeroSectionLibraryServiceInstance {
  slug?: string | null;
  name: string;
  description?: string | null;
}

export interface HeroSectionLibraryProps {
  name: string;
  eyebrow: string;
  description: string;
  showLibraryUpdate?: boolean;
}

type HeroSectionLibraryTranslator = Parameters<typeof localizedCardName>[1];

export const getHeroSectionLibraryProps = (
  serviceInstance: HeroSectionLibraryServiceInstance,
  t: HeroSectionLibraryTranslator
): HeroSectionLibraryProps => {
  return {
    name: localizedCardName(serviceInstance, t),
    eyebrow: t(heroSectionLibraryTranslationKeys.eyebrow),
    description: localizedCardDescription(serviceInstance, t),
  };
};

export const HeroSectionLibrary = ({
  name,
  eyebrow,
  description,
  showLibraryUpdate = false,
}: HeroSectionLibraryProps) => {
  return (
    <section className="pt-m pb-xxl">
      <div className="flex flex-col gap-s">
        <p className="text-primary font-bold">{eyebrow}</p>
        <div className="flex flex-row items-center">
          <h1 className="heading-2xl">{name}</h1>
          {showLibraryUpdate && (
            <div className="flex items-center">
              <LibraryUpdateMetadata />
            </div>
          )}
        </div>
        <div className="flex gap-s">
          <p className="max-w-lg txt-sub-content">{description}</p>
        </div>
      </div>
    </section>
  );
};
