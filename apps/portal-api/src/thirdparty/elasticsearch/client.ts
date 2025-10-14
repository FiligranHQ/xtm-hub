import { Client, ClientOptions, estypes } from '@elastic/elasticsearch';

import fs from 'fs';
import portalConfig from '../../config';
import { logApp } from '../../utils/app-logger.util';

class ElasticSearchService {
  private elasticsearchClient: Client;

  constructor() {
    const config: ClientOptions = {
      node: `${portalConfig.elasticsearch.protocol}://${portalConfig.elasticsearch.host}:${portalConfig.elasticsearch.port}`,
    };

    config.auth = {
      username: portalConfig.elasticsearch.username,
      password: portalConfig.elasticsearch.password,
    };
    const ca_path = portalConfig.elasticsearch.tls.ca_path;
    config.tls = {
      ca: ca_path ? fs.readFileSync(ca_path) : undefined,
      rejectUnauthorized: portalConfig.elasticsearch.tls.reject_unauthorized,
    };
    this.elasticsearchClient = new Client(config);
  }

  getIndices() {
    return this.elasticsearchClient.indices;
  }
  async search<T = unknown>(
    params: estypes.SearchRequest
  ): Promise<estypes.SearchResponse<T>> {
    try {
      return this.elasticsearchClient.search<T>(params);
    } catch (error) {
      logApp.error('ES search error', { error });
      throw error;
    }
  }

  async simpleSearch<T = unknown>({
    index,
    query,
    sort,
    size = 10,
  }: {
    index: string;
    query?: estypes.QueryDslQueryContainer;
    sort?: estypes.Sort;
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

  async create<T = unknown>(
    params: estypes.CreateRequest
  ): Promise<estypes.CreateResponse> {
    try {
      return this.elasticsearchClient.create<T>(params);
    } catch (error) {
      logApp.error('ES create error', { error });
      throw error;
    }
  }

  async index<T = unknown>(
    params: estypes.IndexRequest
  ): Promise<estypes.IndexResponse> {
    try {
      return this.elasticsearchClient.index<T>(params);
    } catch (error) {
      logApp.error('ES index error', { error });
      throw error;
    }
  }

  async delete(params: estypes.DeleteRequest): Promise<estypes.DeleteResponse> {
    try {
      return this.elasticsearchClient.delete(params);
    } catch (error) {
      logApp.error('ES delete error', { error });
      throw error;
    }
  }
  async updateByQuery(
    params: estypes.UpdateByQueryRequest
  ): Promise<estypes.UpdateByQueryResponse> {
    try {
      return this.elasticsearchClient.updateByQuery(params);
    } catch (error) {
      logApp.error('ES updateByQuery error', { error });
      throw error;
    }
  }
  async bulk(params: estypes.BulkRequest): Promise<estypes.BulkResponse> {
    try {
      return this.elasticsearchClient.bulk(params);
    } catch (error) {
      logApp.error('ES bulk error', { error });
      throw error;
    }
  }

  async deleteByQuery(
    params: estypes.DeleteByQueryRequest
  ): Promise<estypes.DeleteByQueryResponse> {
    try {
      return this.elasticsearchClient.deleteByQuery(params);
    } catch (error) {
      logApp.error('ES deleteByQuery error', { error });
      throw error;
    }
  }

  async count(params: estypes.CountRequest): Promise<number> {
    try {
      const result = await this.elasticsearchClient.count(params);
      return result.count;
    } catch (error) {
      logApp.error('ES count error', { error });
      throw error;
    }
  }
}

export default ElasticSearchService;

export const esDbClient = new ElasticSearchService();
