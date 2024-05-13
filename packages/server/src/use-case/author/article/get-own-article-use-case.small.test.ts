import { FindArticleById } from '../../../domain/article/interface/article-repository';
import { ArticleId, SavedArticle } from '@/domain/article/model/article';
import { errAsync, okAsync } from 'neverthrow';
import { makeGetOwnArticleUseCase } from './get-own-article-use-case';
import { ArticleTitle } from '@/domain/article/model/article-title';
import { ArticleBody } from '@/domain/article/model/article-body';
import { ArticleStatus } from '../../../domain/article/model/article-status';

describe('makeGetOwnArticleUseCase', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('記事を正常に取得できる', async () => {
    // given
    const articleId = 'article-id' as unknown as ArticleId;
    const input = { articleId };
    const savedArticle: SavedArticle = {
      articleId: '1',
      authorId: 'author1',
      title: 'Original Title' as ArticleTitle,
      body: 'Original Body' as ArticleBody,
      status: ArticleStatus.Draft,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockFindArticleById: FindArticleById = jest.fn(() => {
      return okAsync(savedArticle);
    });

    // when
    const getOwnArticleUseCase = makeGetOwnArticleUseCase(mockFindArticleById);
    const result = await getOwnArticleUseCase(input);

    // then
    expect(result._unsafeUnwrap()).toEqual(savedArticle);
    expect(mockFindArticleById).toHaveBeenCalledTimes(1);
    expect(mockFindArticleById).toHaveBeenCalledWith(articleId);
  });

  test('記事の取得中にエラーが発生した場合、エラーを返す', async () => {
    // given
    const articleId = 'article-id' as unknown as ArticleId;
    const input = { articleId };

    const mockFindArticleById: FindArticleById = jest.fn(() => {
      return errAsync(new Error());
    });

    // when
    const getOwnArticleUseCase = makeGetOwnArticleUseCase(mockFindArticleById);
    const result = await getOwnArticleUseCase(input);

    // then
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
    expect(mockFindArticleById).toHaveBeenCalledTimes(1);
    expect(mockFindArticleById).toHaveBeenCalledWith(articleId);
  });
});
