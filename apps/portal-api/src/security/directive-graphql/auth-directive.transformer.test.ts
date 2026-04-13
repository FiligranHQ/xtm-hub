import { GraphQLSchema } from 'graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_DIRECTIVE_NAME } from './validator/auth.validator';
import { SERVICE_CAPABILITY_DIRECTIVE_NAME } from './validator/service-capability.validator';

type MapperHandlers = {
  TYPE: (type: { name: string }) => unknown;
  OBJECT_FIELD: (
    fieldConfig: { resolve?: unknown },
    _fieldName: string,
    typeName: string
  ) => unknown;
};

const getDirectiveMock = vi.hoisted(() => vi.fn());
const mapSchemaMock = vi.hoisted(() => vi.fn());
const createSecureFieldResolverMock = vi.hoisted(() => vi.fn());
const createSystemTokenResolverMock = vi.hoisted(() => vi.fn());
const createPlatformTokenResolverMock = vi.hoisted(() => vi.fn());
const directiveNames = vi.hoisted(() => ({
  systemToken: 'system_token',
  platformToken: 'platform_token',
}));

vi.mock('@graphql-tools/utils', () => ({
  getDirective: getDirectiveMock,
  mapSchema: mapSchemaMock,
  MapperKind: {
    TYPE: 'TYPE',
    OBJECT_FIELD: 'OBJECT_FIELD',
  },
}));

vi.mock('./directive.resolver', () => ({
  createSecureFieldResolver: createSecureFieldResolverMock,
}));

vi.mock('./validator/system-token.validator', () => ({
  createSystemTokenResolver: createSystemTokenResolverMock,
  SYSTEM_TOKEN_DIRECTIVE_NAME: directiveNames.systemToken,
}));

vi.mock('./validator/platform-token-validator', () => ({
  createPlatformTokenResolver: createPlatformTokenResolverMock,
  PLATFORM_TOKEN_DIRECTIVE_NAME: directiveNames.platformToken,
}));

import { createAuthDirectiveTransformer } from './auth-directive.transformer';

describe('createAuthDirectiveTransformer', () => {
  const schema = {} as GraphQLSchema;
  const isAuthenticatedFn = vi.fn();
  const hasCapabilityFn = vi.fn();
  const hasServiceCapabilityFn = vi.fn();

  const secureResolver = vi.fn();
  const systemTokenResolver = vi.fn();
  const platformTokenResolver = vi.fn();

  let mapperHandlers: MapperHandlers;
  let directiveRegistry: Map<object, Record<string, unknown>>;

  const setDirective = (
    target: object,
    directiveName: string,
    directiveArgs: unknown
  ) => {
    const existing = directiveRegistry.get(target) ?? {};
    directiveRegistry.set(target, {
      ...existing,
      [directiveName]: directiveArgs,
    });
  };

  const applyTransformer = () => {
    const transformer = createAuthDirectiveTransformer(
      isAuthenticatedFn,
      hasCapabilityFn,
      hasServiceCapabilityFn
    );

    return transformer(schema);
  };

  beforeEach(() => {
    vi.clearAllMocks();

    directiveRegistry = new Map();

    getDirectiveMock.mockImplementation(
      (_schema: GraphQLSchema, target: object, directiveName: string) => {
        const directives = directiveRegistry.get(target);
        const directiveArgs = directives?.[directiveName];

        return directiveArgs ? [directiveArgs] : undefined;
      }
    );

    mapSchemaMock.mockImplementation(
      (_schema: GraphQLSchema, handlers: MapperHandlers) => {
        mapperHandlers = handlers;
        return _schema;
      }
    );

    createSecureFieldResolverMock.mockReturnValue(secureResolver);
    createSystemTokenResolverMock.mockReturnValue(systemTokenResolver);
    createPlatformTokenResolverMock.mockReturnValue(platformTokenResolver);
  });

  it('collects type directives and inherits them at field level', () => {
    // Given
    const queryType = { name: 'Query' };
    const originalResolve = vi.fn();
    const fieldConfig = { resolve: originalResolve };
    const typeAuthDirective = { portalCapa: ['READ'] };
    const typeServiceDirective = { requires: ['UPLOAD'] };

    setDirective(queryType, AUTH_DIRECTIVE_NAME, typeAuthDirective);
    setDirective(
      queryType,
      SERVICE_CAPABILITY_DIRECTIVE_NAME,
      typeServiceDirective
    );

    applyTransformer();

    // When
    mapperHandlers.TYPE(queryType);
    mapperHandlers.OBJECT_FIELD(fieldConfig, 'listServices', 'Query');

    // Then
    expect(getDirectiveMock).toHaveBeenCalledWith(
      schema,
      queryType,
      AUTH_DIRECTIVE_NAME
    );
    expect(getDirectiveMock).toHaveBeenCalledWith(
      schema,
      queryType,
      SERVICE_CAPABILITY_DIRECTIVE_NAME
    );
    expect(createSecureFieldResolverMock).toHaveBeenCalledWith(
      originalResolve,
      expect.objectContaining({
        isAuthenticatedFn,
        hasCapabilityFn,
        hasServiceCapabilityFn,
        authDirective: typeAuthDirective,
        serviceCapaDirective: typeServiceDirective,
      })
    );
    expect(fieldConfig).toMatchObject({ resolve: secureResolver });
  });

  it('gives priority to field directives over type directives', () => {
    // Given
    const queryType = { name: 'Query' };
    const originalResolve = vi.fn();
    const fieldConfig = { resolve: originalResolve };

    const typeAuthDirective = { portalCapa: ['TYPE_READ'] };
    const fieldAuthDirective = { portalCapa: ['FIELD_READ'] };
    const typeServiceDirective = { requires: ['TYPE_UPLOAD'] };
    const fieldServiceDirective = { requires: ['FIELD_UPLOAD'] };

    setDirective(queryType, AUTH_DIRECTIVE_NAME, typeAuthDirective);
    setDirective(
      queryType,
      SERVICE_CAPABILITY_DIRECTIVE_NAME,
      typeServiceDirective
    );
    setDirective(fieldConfig, AUTH_DIRECTIVE_NAME, fieldAuthDirective);
    setDirective(
      fieldConfig,
      SERVICE_CAPABILITY_DIRECTIVE_NAME,
      fieldServiceDirective
    );

    applyTransformer();

    // When
    mapperHandlers.TYPE(queryType);
    mapperHandlers.OBJECT_FIELD(fieldConfig, 'listServices', 'Query');

    // Then
    expect(createSecureFieldResolverMock).toHaveBeenCalledWith(
      originalResolve,
      expect.objectContaining({
        authDirective: fieldAuthDirective,
        serviceCapaDirective: fieldServiceDirective,
      })
    );
    expect(createSecureFieldResolverMock).not.toHaveBeenCalledWith(
      originalResolve,
      expect.objectContaining({
        authDirective: typeAuthDirective,
        serviceCapaDirective: typeServiceDirective,
      })
    );
  });

  it('returns the field as-is when no directive is present', () => {
    // Given
    const fieldResolve = vi.fn();
    const fieldConfig = { resolve: fieldResolve };
    applyTransformer();

    // When
    const mappedField = mapperHandlers.OBJECT_FIELD(
      fieldConfig,
      'health',
      'Query'
    );

    // Then
    expect(mappedField).toBe(fieldConfig);
    expect(fieldConfig).toMatchObject({ resolve: fieldResolve });
    expect(createSecureFieldResolverMock).not.toHaveBeenCalled();
    expect(createSystemTokenResolverMock).not.toHaveBeenCalled();
    expect(createPlatformTokenResolverMock).not.toHaveBeenCalled();
  });

  it.each`
    description                                                       | fieldDirectives                                                                                                                                  | expectedResolverFactory
    ${'uses createSystemTokenResolver with highest priority'}         | ${{ [directiveNames.systemToken]: { required: ['ManagePlatformRegistration'] }, [directiveNames.platformToken]: {}, [AUTH_DIRECTIVE_NAME]: {} }} | ${createSystemTokenResolverMock}
    ${'uses createPlatformTokenResolver when system_token is absent'} | ${{ [directiveNames.platformToken]: {}, [AUTH_DIRECTIVE_NAME]: {} }}                                                                             | ${createPlatformTokenResolverMock}
    ${'uses createSecureFieldResolver otherwise'}                     | ${{ [AUTH_DIRECTIVE_NAME]: { portalCapa: ['READ'] } }}                                                                                           | ${createSecureFieldResolverMock}
  `(
    'selects the right resolver: $description',
    ({ fieldDirectives, expectedResolverFactory }) => {
      // Given
      const originalResolve = vi.fn();
      const fieldConfig = { resolve: originalResolve };

      Object.entries(fieldDirectives).forEach(
        ([directiveName, directiveArgs]) => {
          setDirective(fieldConfig, directiveName, directiveArgs);
        }
      );

      applyTransformer();

      // When
      mapperHandlers.OBJECT_FIELD(fieldConfig, 'securedField', 'Query');

      // Then
      if (expectedResolverFactory === createSystemTokenResolverMock) {
        expect(createSystemTokenResolverMock).toHaveBeenCalledWith(
          originalResolve,
          fieldDirectives[directiveNames.systemToken]
        );
        expect(fieldConfig).toMatchObject({ resolve: systemTokenResolver });
      }

      if (expectedResolverFactory === createPlatformTokenResolverMock) {
        expect(createPlatformTokenResolverMock).toHaveBeenCalledWith(
          originalResolve
        );
        expect(fieldConfig).toMatchObject({ resolve: platformTokenResolver });
      }

      if (expectedResolverFactory === createSecureFieldResolverMock) {
        expect(createSecureFieldResolverMock).toHaveBeenCalledWith(
          originalResolve,
          expect.objectContaining({
            authDirective: fieldDirectives[AUTH_DIRECTIVE_NAME],
          })
        );
        expect(fieldConfig).toMatchObject({ resolve: secureResolver });
      }
    }
  );

  it('inherits system_token TYPE directive and applies createSystemTokenResolver on field without local directive', () => {
    // Given
    const queryType = { name: 'Query' };
    const originalResolve = vi.fn();
    const fieldConfig = { resolve: originalResolve };
    const typeSystemTokenDirective = {
      required: ['ManagePlatformRegistration'],
    };

    setDirective(
      queryType,
      directiveNames.systemToken,
      typeSystemTokenDirective
    );

    applyTransformer();

    // When
    mapperHandlers.TYPE(queryType);
    mapperHandlers.OBJECT_FIELD(fieldConfig, 'securedField', 'Query');

    // Then
    expect(createSystemTokenResolverMock).toHaveBeenCalledWith(
      originalResolve,
      typeSystemTokenDirective
    );
    expect(fieldConfig).toMatchObject({ resolve: systemTokenResolver });
    expect(createPlatformTokenResolverMock).not.toHaveBeenCalled();
    expect(createSecureFieldResolverMock).not.toHaveBeenCalled();
  });

  it('inherits platform_token TYPE directive and applies createPlatformTokenResolver on field without local directive', () => {
    // Given
    const queryType = { name: 'Query' };
    const originalResolve = vi.fn();
    const fieldConfig = { resolve: originalResolve };
    const typePlatformTokenDirective = {};

    setDirective(
      queryType,
      directiveNames.platformToken,
      typePlatformTokenDirective
    );

    applyTransformer();

    // When
    mapperHandlers.TYPE(queryType);
    mapperHandlers.OBJECT_FIELD(fieldConfig, 'securedField', 'Query');

    // Then
    expect(createPlatformTokenResolverMock).toHaveBeenCalledWith(
      originalResolve
    );
    expect(fieldConfig).toMatchObject({ resolve: platformTokenResolver });
    expect(createSystemTokenResolverMock).not.toHaveBeenCalled();
    expect(createSecureFieldResolverMock).not.toHaveBeenCalled();
  });

  it('configures mapSchema with TYPE and OBJECT_FIELD handlers', () => {
    // Given
    const mappedSchema = applyTransformer();

    // Then
    expect(mapSchemaMock).toHaveBeenCalledWith(
      schema,
      expect.objectContaining({
        TYPE: expect.any(Function),
        OBJECT_FIELD: expect.any(Function),
      })
    );
    expect(mappedSchema).toBe(schema);
  });
});
