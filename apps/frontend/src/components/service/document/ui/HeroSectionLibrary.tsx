import { localizedCardDescription, localizedCardName } from '@/utils/services';

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
}: HeroSectionLibraryProps) => {
  return (
    <section className="px-m pt-m pb-xxl text-center">
      <div className="max-w-lg flex flex-col gap-s mx-auto">
        <p className="text-primary font-bold">{eyebrow}</p>
        <h1 className="text-[2rem] font-semibold text-foreground">{name}</h1>
        <p className="txt-sub-content">{description}</p>
      </div>
    </section>
  );
};
