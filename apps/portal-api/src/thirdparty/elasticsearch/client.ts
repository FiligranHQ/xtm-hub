import { Client, ClientOptions } from '@elastic/elasticsearch';
import IndicesApi from '@elastic/elasticsearch/lib/api/api/indices.js';
import {
  CreateRequest,
  CreateResponse,
  DeleteRequest,
  DeleteResponse,
  IndexRequest,
  IndexResponse,
  QueryDslQueryContainer,
  SearchRequest,
  SearchResponse,
  Sort,
} from '@elastic/elasticsearch/lib/api/types.js';
import portalConfig from '../../config';
import { logApp } from '../../utils/app-logger.util';

export class ElasticSearchService {
  private elasticsearchClient: Client;

  constructor() {
    const config: ClientOptions = {
      node: `${portalConfig.elasticsearch.protocol}://${portalConfig.elasticsearch.host}:${portalConfig.elasticsearch.port}`,
    };

    config.auth = {
      username: portalConfig.elasticsearch.username,
      password: portalConfig.elasticsearch.password,
    };

    this.elasticsearchClient = new Client(config);
  }

  getIndices(): IndicesApi {
    return this.elasticsearchClient.indices;
  }
  /* eslint-disable @typescript-eslint/no-explicit-any */
  async search<T = any>(params: SearchRequest): Promise<SearchResponse<T>> {
    try {
      return this.elasticsearchClient.search<T>(params);
    } catch (error) {
      logApp.error('ES search error', { error });
      throw error;
    }
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async simpleSearch<T = any>({
    index,
    query,
    sort,
    size = 10,
  }: {
    index: string;
    query?: QueryDslQueryContainer;
    sort?: Sort;
    size: number;
  }): Promise<T[]> {
    const result = await this.search<T>({
      index,
      query,
      size,
      sort,
    });

    return result.hits.hits.map((hit) => hit._source);
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async create<T = any>(params: CreateRequest): Promise<CreateResponse> {
    try {
      return this.elasticsearchClient.create<T>(params);
    } catch (error) {
      logApp.error('ES create error', { error });
      throw error;
    }
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async index<T = any>(params: IndexRequest): Promise<IndexResponse> {
    try {
      return this.elasticsearchClient.index<T>(params);
    } catch (error) {
      logApp.error('ES index error', { error });
      throw error;
    }
  }

  async delete(params: DeleteRequest): Promise<DeleteResponse> {
    try {
      return this.elasticsearchClient.delete(params);
    } catch (error) {
      logApp.error('ES delete error', { error });
      throw error;
    }
  }
}

export const esDbClient = new ElasticSearchService();
