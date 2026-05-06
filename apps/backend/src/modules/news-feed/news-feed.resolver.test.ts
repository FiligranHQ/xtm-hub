import express from 'express';
import { describe, expect, it, vi } from 'vitest';
import { GRAPHQL_RESOLVE_INFO } from '../../../tests/tests.const';
import { UserLoadUserBy } from '../../model/user';
import { UnknownErrorCode } from '../../utils/error/error.code';
import { NewsFeedApp } from './news-feed.app';
import newsFeedResolver from './news-feed.resolver';

const makeMockContext = (platformId: string | null, token: string | null) => ({
  req: {
    headers: {
      'xtm-hub-platform-id': platformId ?? undefined,
      'xtm-hub-platform-token': token ?? undefined,
    },
  } as unknown as express.Request,
  res: {} as express.Response,
  user: undefined as unknown as UserLoadUserBy,
});

describe('consume provisioned news feed items GraphQL mutation', () => {
  it('should consume provisioned news feed items with extracted platformId and token and return the result', async () => {
    // Given
    const platformId = 'platform-abc';
    const token = 'token-xyz';
    const mockResult = { news_feed_items: [], available_news_feed_types: [] };
    vi.spyOn(NewsFeedApp, 'consumeProvisionedNewsFeedItems').mockResolvedValue(
      mockResult
    );
    const context = makeMockContext(platformId, token);

    // When
    const result = await newsFeedResolver.Mutation!
      .consumeProvisionedNewsFeedItems!({}, {}, context, GRAPHQL_RESOLVE_INFO);

    // Then
    expect(NewsFeedApp.consumeProvisionedNewsFeedItems).toHaveBeenCalledWith({
      platformId,
      token,
    });
    expect(result).toBe(mockResult);
  });

  it('should consume provisioned news feed items with null platformId when header is missing', async () => {
    // Given
    const token = 'token-xyz';
    const mockResult = { news_feed_items: [], available_news_feed_types: [] };
    vi.spyOn(NewsFeedApp, 'consumeProvisionedNewsFeedItems').mockResolvedValue(
      mockResult
    );
    const context = makeMockContext(null, token);

    // When
    await newsFeedResolver.Mutation!.consumeProvisionedNewsFeedItems!(
      {},
      {},
      context,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(NewsFeedApp.consumeProvisionedNewsFeedItems).toHaveBeenCalledWith({
      platformId: null,
      token,
    });
  });

  it('should throw a mapped GraphQL error with UnknownError when the app throws', async () => {
    // Given
    vi.spyOn(NewsFeedApp, 'consumeProvisionedNewsFeedItems').mockRejectedValue(
      new Error('UNEXPECTED')
    );
    const context = makeMockContext('platform-abc', 'token-xyz');

    // When
    const call = newsFeedResolver.Mutation!.consumeProvisionedNewsFeedItems!(
      {},
      {},
      context,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    await expect(call).rejects.toThrow(UnknownErrorCode.UnknownError);
  });
});
