import { okAsync, errAsync } from 'neverthrow';
import {
  makeDeleteArticleById,
  makeFindArticleById,
  makeSaveArticle,
} from './article-ddb-repository';
import {
  AuthorId,
  ValidatedArticle,
  SavedArticle,
  ArticleId,
} from '@/domain/article/model/article';
import { ArticleTitle } from '@/domain/article/model/article-title';
import { ArticleBody } from '@/domain/article/model/article-body';
import { ArticleStatus } from '../../domain/article/model/article-status';
import { DynamoDbResultClient } from '../client/dynamodb-result-client';
import { marshall } from '@aws-sdk/util-dynamodb';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'fixed-uuid'),
}));

describe('makeSaveArticle', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  test('articleIdとcreatedAtが存在しない場合は、それぞれ新しいUUIDと現在時刻が挿入される', async () => {
    // given
    const mockDate = new Date('2020-01-01T00:00:00.000Z');
    jest.useFakeTimers().setSystemTime(mockDate);

    const input: ValidatedArticle = {
      authorId: 'author1' as AuthorId,
      title: 'Test Title' as ArticleTitle,
      body: 'Test Body' as ArticleBody,
      status: ArticleStatus.Draft,
    };

    const expectedArticle: SavedArticle = {
      ...input,
      articleId: 'fixed-uuid',
      createdAt: mockDate.toISOString(),
      updatedAt: mockDate.toISOString(),
    };

    const mockDdbResultClient = {
      putItem: jest.fn().mockReturnValue(okAsync(expectedArticle)),
    };

    const saveArticle = makeSaveArticle(
      mockDdbResultClient as unknown as DynamoDbResultClient,
    );

    // when
    const result = await saveArticle(input);

    // then
    expect(result._unsafeUnwrap()).toEqual(expectedArticle);
    expect(mockDdbResultClient.putItem).toHaveBeenCalledWith({
      TableName: 'Articles',
      Item: expectedArticle,
    });
  });

  test('articleIdとcreatedAtが存在する場合は、それらの値が使用される', async () => {
    // given
    const mockDate = new Date('2020-01-01T00:00:00.000Z');
    jest.useFakeTimers().setSystemTime(mockDate);

    const input: ValidatedArticle = {
      authorId: 'author1' as AuthorId,
      title: 'Test Title' as ArticleTitle,
      body: 'Test Body' as ArticleBody,
      status: ArticleStatus.Draft,
      articleId: 'existing-article-id' as ArticleId,
      createdAt: new Date('2019-01-01T00:00:00.000Z').toISOString(),
    };

    const expectedArticle: SavedArticle = {
      ...input,
      articleId: 'existing-article-id' as ArticleId,
      createdAt: new Date('2019-01-01T00:00:00.000Z').toISOString(),
      updatedAt: mockDate.toISOString(),
    };

    const mockDdbResultClient = {
      putItem: jest.fn().mockReturnValue(okAsync(expectedArticle)),
    };

    const saveArticle = makeSaveArticle(
      mockDdbResultClient as unknown as DynamoDbResultClient,
    );

    // when
    const result = await saveArticle(input);

    // then
    expect(result._unsafeUnwrap()).toEqual(expectedArticle);
    expect(mockDdbResultClient.putItem).toHaveBeenCalledWith({
      TableName: 'Articles',
      Item: expectedArticle,
    });
  });

  test('DynamoDBへのputItemが失敗した場合は、エラーが返される', async () => {
    // given
    const input: ValidatedArticle = {
      authorId: 'author1' as AuthorId,
      title: 'Test Title' as ArticleTitle,
      body: 'Test Body' as ArticleBody,
      status: ArticleStatus.Draft,
      articleId: 'existing-article-id' as ArticleId,
    };
    const mockError = new Error('Failed to put item');
    const mockDdbResultClient = {
      putItem: jest.fn().mockReturnValue(errAsync(mockError)),
    };

    const saveArticle = makeSaveArticle(
      mockDdbResultClient as unknown as DynamoDbResultClient,
    );

    // when
    const result = await saveArticle(input);

    // then
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
  });
});

describe('makeFindArticleById', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('指定したarticleIdの記事が存在する場合、その記事が返される', async () => {
    // given
    const existingArticleId = 'existing-article-id';
    const expectedArticle: SavedArticle = {
      articleId: existingArticleId as ArticleId,
      authorId: 'author1' as AuthorId,
      title: 'Test Title' as ArticleTitle,
      body: 'Test Body' as ArticleBody,
      status: ArticleStatus.Draft,
      createdAt: '2023-04-01T00:00:00.000Z',
      updatedAt: '2023-04-01T00:00:00.000Z',
    };

    const mockDdbResultClient = {
      queryItem: jest.fn().mockReturnValue(
        okAsync({
          Items: [marshall(expectedArticle)],
        }),
      ),
    };

    const findArticleById = makeFindArticleById(
      mockDdbResultClient as unknown as DynamoDbResultClient,
    );

    // when
    const result = await findArticleById(existingArticleId);

    // then
    expect(result._unsafeUnwrap()).toEqual(expectedArticle);
  });

  test('指定したarticleIdの記事が存在しない場合、エラーが返される', async () => {
    // given
    const nonExistingArticleId = 'non-existing-article-id';

    const mockDdbResultClient = {
      queryItem: jest.fn().mockReturnValue(
        okAsync({
          Items: [],
        }),
      ),
    };

    const findArticleById = makeFindArticleById(
      mockDdbResultClient as unknown as DynamoDbResultClient,
    );

    // when
    const result = await findArticleById(nonExistingArticleId);

    // then
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
  });

  test('DynamoDBクエリ中にエラーが発生した場合、エラーが返される', async () => {
    // given
    const articleId = 'article-id';
    const mockError = new Error('Failed to query DynamoDB');

    const mockDdbResultClient = {
      queryItem: jest.fn().mockReturnValue(errAsync(mockError)),
    };

    const findArticleById = makeFindArticleById(
      mockDdbResultClient as unknown as DynamoDbResultClient,
    );

    // when
    const result = await findArticleById(articleId);

    // then
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
  });
});

describe('makeDeleteArticleById', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('指定したauthorIdとarticleIdの組み合わせで記事が削除できる場合、成功を示す値が返される', async () => {
    // given
    const authorId = 'author1' as AuthorId;
    const articleId = 'article1' as ArticleId;

    const mockDdbResultClient = {
      deleteItem: jest.fn().mockReturnValue(okAsync({})),
    };

    const deleteArticleById = makeDeleteArticleById(
      mockDdbResultClient as unknown as DynamoDbResultClient,
    );

    // when
    const result = await deleteArticleById({ authorId, articleId });

    // then
    expect(result._unsafeUnwrap()).toBe(undefined);
    expect(mockDdbResultClient.deleteItem).toHaveBeenCalledWith({
      TableName: process.env.TABLE_NAME,
      Key: {
        authorId,
        articleId,
      },
    });
  });

  test('指定したauthorIdとarticleIdの組み合わせで記事が存在しない場合、エラーが返される', async () => {
    // given
    const authorId = 'author1' as AuthorId;
    const articleId = 'article1' as ArticleId;
    const mockError = new Error('Article not found');

    const mockDdbResultClient = {
      deleteItem: jest.fn().mockReturnValue(errAsync(mockError)),
    };

    const deleteArticleById = makeDeleteArticleById(
      mockDdbResultClient as unknown as DynamoDbResultClient,
    );

    // when
    const result = await deleteArticleById({ authorId, articleId });

    // then
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
  });

  test('DynamoDBの削除処理中にエラーが発生した場合、エラーが返される', async () => {
    // given
    const authorId = 'author1' as AuthorId;
    const articleId = 'article1' as ArticleId;
    const mockError = new Error('DynamoDB error');

    const mockDdbResultClient = {
      deleteItem: jest.fn().mockReturnValue(errAsync(mockError)),
    };

    const deleteArticleById = makeDeleteArticleById(
      mockDdbResultClient as unknown as DynamoDbResultClient,
    );

    // when
    const result = await deleteArticleById({ authorId, articleId });

    // then
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
  });
});
