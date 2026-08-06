import { localizedCardDescription, localizedCardName } from '@/utils/services';
import { LibraryUpdateMetadatas } from './LibraryUpdateMetadatas';

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
    <section className="px-m pt-m pb-xxl text-center">
      <div className="flex flex-col gap-s">
        <p className="text-primary font-bold">{eyebrow}</p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-s">
          <div />
          <h1 className="heading-2xl">{name}</h1>
          {showLibraryUpdate && (
            <div className="justify-self-start">
              <LibraryUpdateMetadatas />
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-s">
          <p className="max-w-lg txt-sub-content">{description}</p>
        </div>
      </div>
    </section>
  );
};
