import { ArticleId, SavedArticle } from '../../../domain/article/model/article';
import { ok, err, okAsync } from 'neverthrow';
import { ValidatePublishedArticle } from '../../../domain/article/service/article-service';
import { FindArticleById } from '../../../domain/article/interface/article-repository';
import { makeGetPublicArticleUseCase } from './get-public-article-use-case';
import { ArticleTitle } from '@/domain/article/model/article-title';
import { ArticleBody } from '@/domain/article/model/article-body';
import { ArticleStatus } from '../../../domain/article/model/article-status';

describe('makeGetPublicArticleUseCase', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('公開済みの記事を取得できる', async () => {
    // given
    const articleId = 'article-id' as unknown as ArticleId;
    const input = { articleId };
    const publishedArticle: SavedArticle = {
      articleId,
      authorId: 'author1',
      title: 'Original Title' as unknown as ArticleTitle,
      body: 'Original Body' as unknown as ArticleBody,
      status: ArticleStatus.Published,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockFindArticleById: FindArticleById = jest.fn(() => {
      return okAsync(publishedArticle);
    });
    const mockValidatePublishedArticle: ValidatePublishedArticle = jest.fn(
      (article) => {
        return ok(article);
      },
    );

    // when
    const getPublicArticleUseCase = makeGetPublicArticleUseCase(
      mockValidatePublishedArticle,
      mockFindArticleById,
    );
    const result = await getPublicArticleUseCase(input);

    // then
    expect(result._unsafeUnwrap()).toEqual(publishedArticle);
    expect(mockFindArticleById).toHaveBeenCalledTimes(1);
    expect(mockFindArticleById).toHaveBeenCalledWith(articleId);
    expect(mockValidatePublishedArticle).toHaveBeenCalledTimes(1);
    expect(mockValidatePublishedArticle).toHaveBeenCalledWith(publishedArticle);
  });

  test('公開済みでない記事の場合、エラーを返す', async () => {
    // given
    const articleId = 'article-id' as unknown as ArticleId;
    const input = { articleId };
    const draftArticle: SavedArticle = {
      articleId,
      authorId: 'author1',
      title: 'Original Title' as unknown as ArticleTitle,
      body: 'Original Body' as unknown as ArticleBody,
      status: ArticleStatus.Draft,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const articleNotPublishedError = new Error('Article is not published');

    const mockFindArticleById: FindArticleById = jest.fn(() => {
      return okAsync(draftArticle);
    });
    const mockValidatePublishedArticle: ValidatePublishedArticle = jest.fn(
      () => {
        return err(articleNotPublishedError);
      },
    );

    // when
    const getPublicArticleUseCase = makeGetPublicArticleUseCase(
      mockValidatePublishedArticle,
      mockFindArticleById,
    );
    const result = await getPublicArticleUseCase(input);

    // then
    expect(result._unsafeUnwrapErr()).toBe(articleNotPublishedError);
    expect(mockFindArticleById).toHaveBeenCalledTimes(1);
    expect(mockFindArticleById).toHaveBeenCalledWith(articleId);
    expect(mockValidatePublishedArticle).toHaveBeenCalledTimes(1);
    expect(mockValidatePublishedArticle).toHaveBeenCalledWith(draftArticle);
  });

  test('公開済みでない記事の場合、エラーを返す', async () => {
    // given
    const articleId = 'article-id' as unknown as ArticleId;
    const input = { articleId };
    const draftArticle: SavedArticle = {
      articleId,
      authorId: 'author1',
      title: 'Original Title' as unknown as ArticleTitle,
      body: 'Original Body' as unknown as ArticleBody,
      status: ArticleStatus.Draft,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const articleNotPublishedError = new Error('Article is not published');

    const mockFindArticleById: FindArticleById = jest.fn(() => {
      return okAsync(draftArticle);
    });
    const mockValidatePublishedArticle: ValidatePublishedArticle = jest.fn(
      () => {
        return err(articleNotPublishedError);
      },
    );

    // when
    const getPublicArticleUseCase = makeGetPublicArticleUseCase(
      mockValidatePublishedArticle,
      mockFindArticleById,
    );
    const result = await getPublicArticleUseCase(input);

    // then
    expect(result._unsafeUnwrapErr()).toBe(articleNotPublishedError);
    expect(mockFindArticleById).toHaveBeenCalledTimes(1);
    expect(mockFindArticleById).toHaveBeenCalledWith(articleId);
    expect(mockValidatePublishedArticle).toHaveBeenCalledTimes(1);
    expect(mockValidatePublishedArticle).toHaveBeenCalledWith(draftArticle);
  });
});
