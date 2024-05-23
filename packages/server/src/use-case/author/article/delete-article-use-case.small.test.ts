import { DeleteArticleById } from '../../../domain/article/interface/article-repository';
import { makeDeleteArticleUseCase } from './delete-article-use-case';
import { ArticleId, AuthorId } from '@/domain/article/model/article';
import { errAsync, okAsync } from 'neverthrow';

describe('makeDeleteArticleUseCase', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('記事を正常に削除できる', async () => {
    // given
    const authorId = '1' as AuthorId;
    const articleId = 'article-id' as ArticleId;
    const input = { authorId, articleId };

    const mockDeleteArticleById: DeleteArticleById = jest.fn(() => {
      return okAsync(undefined);
    });

    // when
    const deleteArticleUseCase = makeDeleteArticleUseCase(
      mockDeleteArticleById,
    );
    const result = await deleteArticleUseCase(input);

    // then
    expect(result._unsafeUnwrap()).toEqual(undefined);
    expect(mockDeleteArticleById).toHaveBeenCalledTimes(1);
    expect(mockDeleteArticleById).toHaveBeenCalledWith({ authorId, articleId });
  });

  test('記事の削除中にエラーが発生した場合、エラーを返す', async () => {
    // given
    const authorId = '1' as AuthorId;
    const articleId = 'article-id' as ArticleId;
    const input = { articleId };

    const mockDeleteArticleById: DeleteArticleById = jest.fn(
      () => {
        return errAsync(new Error());
      },
    );

    // when
    const deleteArticleUseCase = makeDeleteArticleUseCase(
      mockDeleteArticleById,
    );
    const result = await deleteArticleUseCase(input);

    // then
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
    expect(mockDeleteArticleById).toHaveBeenCalledTimes(1);
    expect(mockDeleteArticleById).toHaveBeenCalledWith({ authorId, articleId });
  });
});
