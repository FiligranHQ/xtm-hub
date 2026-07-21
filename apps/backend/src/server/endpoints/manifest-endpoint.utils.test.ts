import { describe, expect, it } from 'vitest';
import {
  ManifestType,
  PlatformIdentifier,
} from '../../__generated__/resolvers-types';
import { MANIFEST_LIST_DEFAULT_COUNT } from '../../modules/shareable-resource/manifest/manifest.consts';
import {
  isIntegrationType,
  isProduct,
  isValidManifestName,
  parseCount,
} from './manifest-endpoint.utils';

describe('isValidManifestName', () => {
  it.each`
    name                                                  | expected | description
    ${'connector-manifest-7.260604.0-260526113805'}       | ${true}  | ${'nom standard valide'}
    ${'connector-manifest-7.260309.0-lts.5-260526113805'} | ${true}  | ${'variante LTS (minuscule) valide'}
    ${'connector-manifest-7.260604.0-2605'}               | ${false} | ${'datetime trop court'}
    ${'collector-manifest-7.260604.0-260526113805'}       | ${false} | ${'mauvais préfixe'}
    ${'../../secret'}                                     | ${false} | ${'tentative path traversal'}
    ${''}                                                 | ${false} | ${'chaîne vide'}
  `('renvoie $expected ($description)', ({ name, expected }) => {
    expect(isValidManifestName(name)).toBe(expected);
  });
});

describe('parseCount', () => {
  it.each`
    raw          | expected                       | description
    ${undefined} | ${MANIFEST_LIST_DEFAULT_COUNT} | ${'absent → défaut'}
    ${'5'}       | ${5}                           | ${'entier valide'}
    ${'0'}       | ${undefined}                   | ${'zéro rejeté (< 1)'}
    ${'-3'}      | ${undefined}                   | ${'négatif rejeté'}
    ${'1.5'}     | ${undefined}                   | ${'non entier rejeté'}
    ${'abc'}     | ${undefined}                   | ${'non numérique rejeté'}
    ${''}        | ${undefined}                   | ${'chaîne vide rejetée'}
    ${['5']}     | ${undefined}                   | ${'tableau rejeté (param dupliqué)'}
  `('$description', ({ raw, expected }) => {
    expect(parseCount(raw)).toBe(expected);
  });
});

describe('isProduct', () => {
  it.each`
    value                         | expected | description
    ${PlatformIdentifier.Opencti} | ${true}  | ${'valeur enum valide (opencti)'}
    ${'openaev'}                  | ${true}  | ${'valeur enum valide (openaev)'}
    ${'opengrc'}                  | ${false} | ${'produit hors enum'}
    ${'nope'}                     | ${false} | ${'string inconnue'}
    ${42}                         | ${false} | ${'nombre'}
    ${undefined}                  | ${false} | ${'undefined'}
    ${['opencti']}                | ${false} | ${'tableau'}
  `('$description → $expected', ({ value, expected }) => {
    expect(isProduct(value)).toBe(expected);
  });
});

describe('isIntegrationType', () => {
  it.each`
    value                     | expected | description
    ${ManifestType.Connector} | ${true}  | ${'valeur enum valide (connector)'}
    ${'injector'}             | ${false} | ${"type hors enum (contrat le liste, pas l'enum)"}
    ${'collector'}            | ${false} | ${'type hors enum'}
    ${'nope'}                 | ${false} | ${'string inconnue'}
    ${42}                     | ${false} | ${'nombre'}
    ${undefined}              | ${false} | ${'undefined'}
    ${['connector']}          | ${false} | ${'tableau'}
  `('$description → $expected', ({ value, expected }) => {
    expect(isIntegrationType(value)).toBe(expected);
  });
});
