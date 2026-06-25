import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  getHeroSectionLibraryTranslations,
  heroSectionLibraryTranslationKeys,
  HeroSectionLibrary,
} from './HeroSectionLibrary';

describe('getHeroSectionLibraryTranslations', () => {
  it('returns the expected keys using the provided t function', () => {
    const t = (key: string) => key;
    const result = getHeroSectionLibraryTranslations(t);

    expect(result.eyebrow).toBe(heroSectionLibraryTranslationKeys.eyebrow);
    expect(result.defaultDescription).toBe(
      heroSectionLibraryTranslationKeys.defaultDescription
    );
  });
});

describe('HeroSectionLibrary', () => {
  const translations = {
    eyebrow: 'Library eyebrow',
    defaultDescription: 'Default description text',
  };

  it('renders the eyebrow', () => {
    render(<HeroSectionLibrary name="My Library" translations={translations} />);
    expect(screen.getByText('Library eyebrow')).toBeInTheDocument();
  });

  it('renders the name', () => {
    render(<HeroSectionLibrary name="My Library" translations={translations} />);
    expect(screen.getByText('My Library')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<HeroSectionLibrary name="My Library" translations={translations} />);
    expect(screen.getByText('Default description text')).toBeInTheDocument();
  });
});
