import { makeExecutableSchema } from '@graphql-tools/schema';
import * as relayNode from 'graphql-relay/node/node.js';
import { toGlobalId } from 'graphql-relay/node/node.js';
import { describe, expect, it, vi } from 'vitest';
import { idDirectiveTransformer } from './id-directive.transformer';

const schemaDefinition = `
  directive @id(type: String!) on FIELD_DEFINITION | ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION

  scalar DeploymentRequestId

  type DeploymentRequest {
    service_instance_id: ID! @id(type: "ServiceInstance")
  }

  input ReorderInput {
    id: DeploymentRequestId! @id(type: "DeploymentRequest")
  }

  input NestedInnerInput {
    deploymentRequestId: ID! @id(type: "DeploymentRequest")
  }

  input NestedOuterInput {
    nested: NestedInnerInput!
  }

  type Query {
    deploymentRequest(id: DeploymentRequestId! @id(type: "DeploymentRequest")): DeploymentRequest!
    deploymentRequests(ids: [ID!]! @id(type: "DeploymentRequest")): [String!]!
    encodedServiceInstanceId: ID! @id(type: "ServiceInstance")
    encodedServiceInstanceIds: [ID!]! @id(type: "ServiceInstance")
    nullableDecodedArg(id: ID @id(type: "DeploymentRequest")): String!
    nullableEncodedServiceInstanceId: ID @id(type: "ServiceInstance")
    mixedFlow(id: ID! @id(type: "DeploymentRequest")): ID! @id(type: "ServiceInstance")
    passthrough(id: ID!, label: String!): String!
  }

  type Mutation {
    reorder(input: ReorderInput!): String!
    nestedDecode(input: NestedOuterInput!): String!
  }
`;

describe('idDirectiveTransformer', () => {
  it('throws when @id is applied on id field of a Node implementor to prevent double encoding', () => {
    const invalidSchemaDefinition = `
      directive @id(type: String!) on FIELD_DEFINITION | ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION

      interface Node {
        id: ID!
      }

      type Organization implements Node {
        id: ID! @id(type: "Organization")
      }

      type Query {
        organization: Organization!
      }
    `;

    const schema = makeExecutableSchema({
      typeDefs: invalidSchemaDefinition,
      resolvers: {
        Query: {
          organization: () => ({ id: 'org-1' }),
        },
      },
    });

    expect(() => idDirectiveTransformer(schema)).toThrow(
      'Invalid @id usage on Organization.id: Node ids are already globally encoded by the Node.id resolver.'
    );
  });

  it('decodes a directive annotated argument before resolver execution', async () => {
    const resolverSpy = vi
      .fn()
      .mockReturnValue({ service_instance_id: 'svc-1' });

    const schema = idDirectiveTransformer(
      makeExecutableSchema({
        typeDefs: schemaDefinition,
        resolvers: {
          Query: {
            deploymentRequest: (_root: unknown, args: { id: string }) => {
              resolverSpy(args.id);
              return { service_instance_id: 'svc-1' };
            },
          },
        },
      })
    );

    const queryField = schema.getQueryType()?.getFields().deploymentRequest;

    // Given
    const args = { id: toGlobalId('DeploymentRequest', 'dep-1') };

    // When
    const result = await queryField?.resolve?.({}, args, {}, {} as never);

    // Then
    expect(result).toMatchObject({ service_instance_id: 'svc-1' });
    expect(resolverSpy).toHaveBeenCalledOnce();
    expect(resolverSpy).toHaveBeenCalledWith('dep-1');
  });

  it('throws a bad request error when global id parsing fails for an @id argument', async () => {
    const fromGlobalIdSpy = vi
      .spyOn(relayNode, 'fromGlobalId')
      .mockImplementationOnce(() => {
        throw new Error('invalid global id payload');
      });

    const schema = idDirectiveTransformer(
      makeExecutableSchema({
        typeDefs: schemaDefinition,
        resolvers: {
          Query: {
            deploymentRequest: () => ({ service_instance_id: 'svc-1' }),
          },
        },
      })
    );

    const queryField = schema.getQueryType()?.getFields().deploymentRequest;

    // Given
    const args = { id: 'malformed-global-id' };

    // When
    const call = queryField?.resolve?.({}, args, {}, {} as never);

    // Then
    await expect(call).rejects.toThrow(
      'Invalid global id for type DeploymentRequest'
    );

    fromGlobalIdSpy.mockRestore();
  });

  it('rejects mismatched global id type for a directive annotated argument', async () => {
    const schema = idDirectiveTransformer(
      makeExecutableSchema({
        typeDefs: schemaDefinition,
        resolvers: {
          Query: {
            deploymentRequest: () => ({ service_instance_id: 'svc-1' }),
          },
        },
      })
    );

    const queryField = schema.getQueryType()?.getFields().deploymentRequest;

    // Given
    const args = { id: toGlobalId('Organization', 'org-1') };

    // When
    const call = queryField?.resolve?.({}, args, {}, {} as never);

    // Then
    await expect(call).rejects.toThrow(
      'Expected global id of type DeploymentRequest'
    );
  });

  it('decodes list argument values for a directive annotated argument list', async () => {
    const resolverSpy = vi.fn();

    const schema = idDirectiveTransformer(
      makeExecutableSchema({
        typeDefs: schemaDefinition,
        resolvers: {
          Query: {
            deploymentRequests: (_root: unknown, args: { ids: string[] }) => {
              resolverSpy(args.ids);
              return args.ids;
            },
          },
        },
      })
    );

    const queryField = schema.getQueryType()?.getFields().deploymentRequests;

    // Given
    const args = {
      ids: [
        toGlobalId('DeploymentRequest', 'dep-1'),
        toGlobalId('DeploymentRequest', 'dep-2'),
      ],
    };

    // When
    const result = await queryField?.resolve?.({}, args, {}, {} as never);

    // Then
    expect(result).toMatchObject(['dep-1', 'dep-2']);
    expect(resolverSpy).toHaveBeenCalledWith(['dep-1', 'dep-2']);
  });

  it('encodes list field results for a directive annotated field list', async () => {
    const schema = idDirectiveTransformer(
      makeExecutableSchema({
        typeDefs: schemaDefinition,
        resolvers: {
          Query: {
            encodedServiceInstanceIds: () => ['svc-1', 'svc-2'],
          },
        },
      })
    );

    const queryField = schema
      .getQueryType()
      ?.getFields().encodedServiceInstanceIds;

    // When
    const result = await queryField?.resolve?.({}, {}, {}, {} as never);

    // Then
    expect(result).toMatchObject([
      toGlobalId('ServiceInstance', 'svc-1'),
      toGlobalId('ServiceInstance', 'svc-2'),
    ]);
  });

  it('decodes directive annotated input object fields recursively', async () => {
    const mutationSpy = vi.fn();

    const schema = idDirectiveTransformer(
      makeExecutableSchema({
        typeDefs: schemaDefinition,
        resolvers: {
          Mutation: {
            nestedDecode: (
              _root: unknown,
              args: { input: { nested: { deploymentRequestId: string } } }
            ) => {
              mutationSpy(args.input.nested.deploymentRequestId);
              return 'ok';
            },
          },
        },
      })
    );

    const mutationField = schema.getMutationType()?.getFields().nestedDecode;

    // Given
    const args = {
      input: {
        nested: {
          deploymentRequestId: toGlobalId('DeploymentRequest', 'dep-99'),
        },
      },
    };

    // When
    const result = await mutationField?.resolve?.({}, args, {}, {} as never);

    // Then
    expect(result).toBe('ok');
    expect(mutationSpy).toHaveBeenCalledWith('dep-99');
  });

  it('keeps nullable @id argument and nullable @id field as null', async () => {
    const argSpy = vi.fn();

    const schema = idDirectiveTransformer(
      makeExecutableSchema({
        typeDefs: schemaDefinition,
        resolvers: {
          Query: {
            nullableDecodedArg: (
              _root: unknown,
              args: { id: string | null }
            ) => {
              argSpy(args.id);
              return 'ok';
            },
            nullableEncodedServiceInstanceId: () => null,
          },
        },
      })
    );

    const nullableArgField = schema
      .getQueryType()
      ?.getFields().nullableDecodedArg;
    const nullableField = schema
      .getQueryType()
      ?.getFields().nullableEncodedServiceInstanceId;

    // When
    const argResult = await nullableArgField?.resolve?.(
      {},
      { id: null },
      {},
      {} as never
    );
    const fieldResult = await nullableField?.resolve?.({}, {}, {}, {} as never);

    // Then
    expect(argResult).toBe('ok');
    expect(fieldResult).toBeNull();
    expect(argSpy).toHaveBeenCalledWith(null);
  });

  it('supports decode+encode flow in the same resolver for @id argument and @id field', async () => {
    const resolverSpy = vi.fn();

    const schema = idDirectiveTransformer(
      makeExecutableSchema({
        typeDefs: schemaDefinition,
        resolvers: {
          Query: {
            mixedFlow: (_root: unknown, args: { id: string }) => {
              resolverSpy(args.id);
              return `svc-for-${args.id}`;
            },
          },
        },
      })
    );

    const queryField = schema.getQueryType()?.getFields().mixedFlow;

    // Given
    const args = { id: toGlobalId('DeploymentRequest', 'dep-7') };

    // When
    const result = await queryField?.resolve?.({}, args, {}, {} as never);

    // Then
    expect(resolverSpy).toHaveBeenCalledWith('dep-7');
    expect(result).toBe(toGlobalId('ServiceInstance', 'svc-for-dep-7'));
  });

  it('does not transform values for non-annotated arguments or fields', async () => {
    const resolverSpy = vi.fn();

    const schema = idDirectiveTransformer(
      makeExecutableSchema({
        typeDefs: schemaDefinition,
        resolvers: {
          Query: {
            passthrough: (
              _root: unknown,
              args: { id: string; label: string }
            ) => {
              resolverSpy(args);
              return `${args.id}:${args.label}`;
            },
          },
        },
      })
    );

    const queryField = schema.getQueryType()?.getFields().passthrough;

    // Given
    const encodedId = toGlobalId('DeploymentRequest', 'dep-55');
    const args = { id: encodedId, label: 'stable' };

    // When
    const result = await queryField?.resolve?.({}, args, {}, {} as never);

    // Then
    expect(resolverSpy).toHaveBeenCalledWith({
      id: encodedId,
      label: 'stable',
    });
    expect(result).toBe(`${encodedId}:stable`);
  });

  it('encodes a directive annotated field result as a relay global id', async () => {
    const schema = idDirectiveTransformer(
      makeExecutableSchema({
        typeDefs: schemaDefinition,
        resolvers: {
          Query: {
            encodedServiceInstanceId: () => 'svc-1',
          },
        },
      })
    );

    const queryField = schema
      .getQueryType()
      ?.getFields().encodedServiceInstanceId;

    // When
    const encodedResult = await queryField?.resolve?.({}, {}, {}, {} as never);

    // Then
    expect(encodedResult).toBe(toGlobalId('ServiceInstance', 'svc-1'));
  });

  it('decodes directive annotated input object fields', async () => {
    const mutationSpy = vi.fn().mockImplementation((_id: string) => 'ok');

    const schema = idDirectiveTransformer(
      makeExecutableSchema({
        typeDefs: schemaDefinition,
        resolvers: {
          Mutation: {
            reorder: (_root: unknown, args: { input: { id: string } }) => {
              mutationSpy(args.input.id);
              return 'ok';
            },
          },
        },
      })
    );

    const mutationField = schema.getMutationType()?.getFields().reorder;

    // Given
    const args = {
      input: {
        id: toGlobalId('DeploymentRequest', 'dep-99'),
      },
    };

    // When
    const result = await mutationField?.resolve?.({}, args, {}, {} as never);

    // Then
    expect(result).toBe('ok');
    expect(mutationSpy).toHaveBeenCalledWith('dep-99');
  });

  it('decodes nested @id fields when input object types are mutually referential', async () => {
    const circularSchemaDefinition = `
      directive @id(type: String!) on FIELD_DEFINITION | ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION

      input CircularAInput {
        label: String!
        b: CircularBInput!
      }

      input CircularBInput {
        deploymentRequestId: ID! @id(type: "DeploymentRequest")
        a: CircularAInput
      }

      type Mutation {
        circularDecode(input: CircularAInput!): String!
      }

      type Query {
        _noop: String
      }
    `;

    const mutationSpy = vi.fn();

    const schema = idDirectiveTransformer(
      makeExecutableSchema({
        typeDefs: circularSchemaDefinition,
        resolvers: {
          Mutation: {
            circularDecode: (
              _root: unknown,
              args: {
                input: {
                  label: string;
                  b: {
                    deploymentRequestId: string;
                    a: {
                      label: string;
                      b: {
                        deploymentRequestId: string;
                      };
                    };
                  };
                };
              }
            ) => {
              mutationSpy(args.input);
              return 'ok';
            },
          },
        },
      })
    );

    const mutationField = schema.getMutationType()?.getFields().circularDecode;

    // Given
    const args = {
      input: {
        label: 'root',
        b: {
          deploymentRequestId: toGlobalId('DeploymentRequest', 'dep-1'),
          a: {
            label: 'child',
            b: {
              deploymentRequestId: toGlobalId('DeploymentRequest', 'dep-2'),
            },
          },
        },
      },
    };

    // When
    const result = await mutationField?.resolve?.({}, args, {}, {} as never);

    // Then
    expect(result).toBe('ok');
    expect(mutationSpy).toHaveBeenCalledOnce();
    expect(mutationSpy.mock.calls[0]![0]).toMatchObject({
      label: 'root',
      b: {
        deploymentRequestId: 'dep-1',
        a: {
          label: 'child',
          b: {
            deploymentRequestId: 'dep-2',
          },
        },
      },
    });
  });
});
