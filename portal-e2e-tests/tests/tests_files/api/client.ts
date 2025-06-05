import { APIRequestContext, request } from '@playwright/test';
import gql from 'graphql-tag';
import { DocumentNode } from 'graphql/language';
import { APIResponse } from 'playwright-core';

export class ApiClient {
  private context: APIRequestContext;
  private authCookie: string;

  private constructor(context: APIRequestContext) {
    this.context = context;
  }

  static async init(): Promise<ApiClient> {
    const context = await request.newContext({
      baseURL: process.env.E2E_API_URL ?? 'http://localhost:4002',
    });

    return new ApiClient(context);
  }

  async login(
    email: string = 'admin@filigran.io',
    password: string = 'admin'
  ): Promise<void> {
    const loginQuery = gql`
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          id
        }
      }
    `;

    const result = await this.callGraphQL(loginQuery, { email, password });
    const headers = result.headers();
    this.authCookie = headers['set-cookie'];
  }

  async callGraphQL(
    query: DocumentNode,
    variables?: Record<string, unknown>
  ): Promise<APIResponse> {
    return this.context.post('/graphql-api', {
      data: JSON.stringify({
        query: query.loc.source.body,
        variables,
      }),
      headers: {
        'Content-Type': 'application/json',
        Cookie: this.authCookie,
      },
    });
  }
}
