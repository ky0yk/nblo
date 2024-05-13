import {
  ArticleId,
  SavedArticle,
  ValidatedArticle,
} from '@/domain/article/model/article';
import { ArticleStatus } from '../../../domain/article/model/article-status';
import { ArticleTitle } from '@/domain/article/model/article-title';
import { ArticleBody } from '@/domain/article/model/article-body';
import {
  FindArticleById,
  SaveArticle,
} from '@/domain/article/interface/article-repository';
import { err, errAsync, ok, okAsync } from 'neverthrow';
import {
  UpdateArticle,
  UpdateArticleCommand,
} from '@/domain/article/command/update-article-command';
import { makeUpdateArticleUseCase } from './update-article';

interface Input {
  articleId: string;
  update: {
    title?: string;
    body?: string;
    status?: ArticleStatus;
  };
}

describe('makeUpdateArticleUseCase', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('記事を正常に更新できる', async () => {
    // given
    const articleId = 'article-id' as unknown as ArticleId;
    const input: Input = {
      articleId,
      update: {
        title: 'Updated Title',
        body: 'Updated Body',
        status: ArticleStatus.Published,
      },
    };
    const foundArticle: SavedArticle = {
      articleId: '1',
      authorId: 'author1',
      title: 'Original Title' as unknown as ArticleTitle,
      body: 'Original Body' as unknown as ArticleBody,
      status: ArticleStatus.Draft,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updateCommand: UpdateArticleCommand = {
      article: foundArticle,
      update: input.update,
    };
    const updatedArticle: ValidatedArticle = {
      articleId,
      authorId: 'author1',
      title: 'Original Title' as unknown as ArticleTitle,
      body: 'Original Body' as unknown as ArticleBody,
      status: ArticleStatus.Published,
    };
    const mockFindArticleById: FindArticleById = jest.fn(() => {
      return okAsync(foundArticle);
    });
    const mockUpdateArticle: UpdateArticle = jest.fn(() => {
      return ok(updatedArticle);
    });
    const mockSaveArticle: SaveArticle = jest.fn(() => {
      return okAsync(foundArticle);
    });

    // when
    const updateArticleUseCase = makeUpdateArticleUseCase(
      mockUpdateArticle,
      mockFindArticleById,
      mockSaveArticle,
    );
    const result = await updateArticleUseCase(input);

    // then
    expect(result._unsafeUnwrap()).toEqual(foundArticle);
    expect(mockFindArticleById).toHaveBeenCalledTimes(1);
    expect(mockFindArticleById).toHaveBeenCalledWith(articleId);
    expect(mockUpdateArticle).toHaveBeenCalledTimes(1);
    expect(mockUpdateArticle).toHaveBeenCalledWith(updateCommand);
    expect(mockSaveArticle).toHaveBeenCalledTimes(1);
    expect(mockSaveArticle).toHaveBeenCalledWith(updatedArticle);
  });

  test('記事が存在しない場合、エラーを返す', async () => {
    // given
    const articleId = 'article-id' as unknown as ArticleId;
    const input: Input = {
      articleId,
      update: {
        title: 'Updated Title',
        body: 'Updated Body',
        status: ArticleStatus.Published,
      },
    };
    const notFoundError = new Error('Article not found');

    const mockFindArticleById: FindArticleById = jest.fn(() => {
      return errAsync(notFoundError);
    });
    const mockUpdateArticle: UpdateArticle = jest.fn();
    const mockSaveArticle: SaveArticle = jest.fn();

    // when
    const updateArticleUseCase = makeUpdateArticleUseCase(
      mockUpdateArticle,
      mockFindArticleById,
      mockSaveArticle,
    );
    const result = await updateArticleUseCase(input);

    // then
    expect(result._unsafeUnwrapErr()).toBe(notFoundError);
    expect(mockFindArticleById).toHaveBeenCalledTimes(1);
    expect(mockFindArticleById).toHaveBeenCalledWith(articleId);
    expect(mockUpdateArticle).not.toHaveBeenCalled();
    expect(mockSaveArticle).not.toHaveBeenCalled();
  });

  test('記事の更新に失敗した場合、エラーを返す', async () => {
    // given
    const articleId = 'article-id' as unknown as ArticleId;
    const input: Input = {
      articleId,
      update: {
        title: 'Updated Title',
        body: 'Updated Body',
        status: ArticleStatus.Published,
      },
    };
    const foundArticle: SavedArticle = {
      articleId: '1',
      authorId: 'author1',
      title: 'Original Title' as unknown as ArticleTitle,
      body: 'Original Body' as unknown as ArticleBody,
      status: ArticleStatus.Draft,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updateCommand: UpdateArticleCommand = {
      article: foundArticle,
      update: input.update,
    };
    const domainError = new Error('Domain error');

    const mockFindArticleById: FindArticleById = jest.fn(() => {
      return okAsync(foundArticle);
    });
    const mockUpdateArticle: UpdateArticle = jest.fn(() => {
      return err(domainError);
    });
    const mockSaveArticle: SaveArticle = jest.fn();

    // when
    const updateArticleUseCase = makeUpdateArticleUseCase(
      mockUpdateArticle,
      mockFindArticleById,
      mockSaveArticle,
    );
    const result = await updateArticleUseCase(input);

    // then
    expect(result._unsafeUnwrapErr()).toBe(domainError);
    expect(mockFindArticleById).toHaveBeenCalledTimes(1);
    expect(mockFindArticleById).toHaveBeenCalledWith(articleId);
    expect(mockUpdateArticle).toHaveBeenCalledTimes(1);
    expect(mockUpdateArticle).toHaveBeenCalledWith(updateCommand);
    expect(mockSaveArticle).not.toHaveBeenCalled();
  });

  test('記事の保存に失敗した場合、エラーを返す', async () => {
    // given
    const articleId = 'article-id' as unknown as ArticleId;
    const input: Input = {
      articleId,
      update: {
        title: 'Updated Title',
        body: 'Updated Body',
        status: ArticleStatus.Published,
      },
    };
    const foundArticle: SavedArticle = {
      articleId: '1',
      authorId: 'author1',
      title: 'Original Title' as unknown as ArticleTitle,
      body: 'Original Body' as unknown as ArticleBody,
      status: ArticleStatus.Draft,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updateCommand: UpdateArticleCommand = {
      article: foundArticle,
      update: input.update,
    };
    const updatedArticle: ValidatedArticle = {
      articleId,
      authorId: 'author1',
      title: 'Original Title' as unknown as ArticleTitle,
      body: 'Original Body' as unknown as ArticleBody,
      status: ArticleStatus.Published,
    };
    const infraError = new Error('Infrastructure error');

    const mockFindArticleById: FindArticleById = jest.fn(() => {
      return okAsync(foundArticle);
    });
    const mockUpdateArticle: UpdateArticle = jest.fn(() => {
      return ok(updatedArticle);
    });
    const mockSaveArticle: SaveArticle = jest.fn(() => {
      return errAsync(infraError);
    });

    // when
    const updateArticleUseCase = makeUpdateArticleUseCase(
      mockUpdateArticle,
      mockFindArticleById,
      mockSaveArticle,
    );
    const result = await updateArticleUseCase(input);

    // then
    expect(result._unsafeUnwrapErr()).toBe(infraError);
    expect(mockFindArticleById).toHaveBeenCalledTimes(1);
    expect(mockFindArticleById).toHaveBeenCalledWith(articleId);
    expect(mockUpdateArticle).toHaveBeenCalledTimes(1);
    expect(mockUpdateArticle).toHaveBeenCalledWith(updateCommand);
    expect(mockSaveArticle).toHaveBeenCalledTimes(1);
    expect(mockSaveArticle).toHaveBeenCalledWith(updatedArticle);
  });
});
