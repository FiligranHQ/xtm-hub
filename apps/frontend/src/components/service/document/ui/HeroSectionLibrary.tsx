import { UseTranslationsProps } from '@/i18n/config';

export const heroSectionLibraryTranslationKeys = {
  eyebrow: 'Service.LibraryHero.Eyebrow',
  defaultDescription: 'Service.LibraryHero.DefaultDescription',
} as const;

export interface HeroSectionLibraryTranslations {
  eyebrow: string;
  defaultDescription: string;
}

export const getHeroSectionLibraryTranslations = (
  t: UseTranslationsProps
): HeroSectionLibraryTranslations => {
  return {
    eyebrow: t(heroSectionLibraryTranslationKeys.eyebrow),
    defaultDescription: t(heroSectionLibraryTranslationKeys.defaultDescription),
  };
};

interface HeroSectionLibraryProps {
  name: string;
  translations: HeroSectionLibraryTranslations;
}

export const HeroSectionLibrary = ({
  name,
  translations,
}: HeroSectionLibraryProps) => {
  return (
    <section className="px-m pt-m pb-xxl text-center">
      <div className="max-w-lg flex flex-col gap-s mx-auto">
        <p className="text-primary font-bold">{translations.eyebrow}</p>
        <h1 className="text-[2rem] font-semibold text-foreground">{name}</h1>
        <p className="txt-sub-content">{translations.defaultDescription}</p>
      </div>
    </section>
  );
};
