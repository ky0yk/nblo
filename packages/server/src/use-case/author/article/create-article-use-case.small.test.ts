import {
    CreateArticle,
    toCreateArticleCommand,
  } from '../../../domain/article/command/create-article-command';
  import { ResultAsync, ok, err, okAsync, errAsync } from 'neverthrow';
  import { SavedArticle, ValidatedArticle } from '../../../domain/article/model/article';
  import { SaveArticle } from '../../../domain/article/interface/article-repository';
import { ArticleTitle } from '@/domain/article/model/article-title';
import { ArticleBody } from '@/domain/article/model/article-body';
import { ArticleStatus } from '../../../domain/article/model/article-status';
  
  interface Input {
    authorId: string;
    title: string;
    body: string;
    status?: string;
  }
  type CreateArticleUseCase = (input: Input) => ResultAsync<SavedArticle, Error>;
  
  export const makeCreateArticleUseCase = (createArticle: CreateArticle, saveArticle: SaveArticle) => {
    const createArticleUseCase: CreateArticleUseCase = (input) => {
      const command = toCreateArticleCommand(
        input.authorId,
        input.title,
        input.body,
        input.status,
      );
  
      return ok(command).andThen(createArticle).asyncAndThen(saveArticle);
    };
  
    return createArticleUseCase;
  };
  
  describe('makeCreateArticleUseCase', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });
  
    test('記事を正常に保存できる', async () => {
      // given
      const input = {
        authorId: 'author1',
        title: 'Original Title',
        body: 'Original Body',
      };
      const validatedArticle: ValidatedArticle = {
        authorId: 'author1',
        title: 'Original Title' as unknown as ArticleTitle,
        body: 'Original Body' as unknown as ArticleBody,
        status: ArticleStatus.Draft,
      };
      const savedArticle: SavedArticle = {
        articleId: '1',
        authorId: 'author1',
        title: 'Original Title' as unknown as ArticleTitle,
        body: 'Original Body' as unknown as ArticleBody,
        status: ArticleStatus.Draft,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
  
      const mockCreateArticle: CreateArticle = jest.fn(() => {
        return ok(validatedArticle);
      });
      const mockSaveArticle: SaveArticle = jest.fn(() => {
        return okAsync(savedArticle);
      });
  
      // when
      const createArticleUseCase = makeCreateArticleUseCase(mockCreateArticle, mockSaveArticle);
      const result = await createArticleUseCase(input);
  
      // then
      expect(result._unsafeUnwrap()).toEqual(savedArticle);
      expect(mockCreateArticle).toHaveBeenCalledTimes(1);
      expect(mockSaveArticle).toHaveBeenCalledTimes(1);
      expect(mockSaveArticle).toHaveBeenCalledWith(validatedArticle);
    });
  
    test('記事の作成に失敗した場合、エラーを返す', async () => {
      // given
      const input = {
        authorId: 'author1',
        title: 'Original Title',
        body: 'Original Body',
      };
      const domainError = new Error('Domain error');
  
      const mockCreateArticle: CreateArticle = jest.fn(() => {
        return err(domainError);
      });
      const mockSaveArticle: SaveArticle = jest.fn();
  
      // when
      const createArticleUseCase = makeCreateArticleUseCase(mockCreateArticle, mockSaveArticle);
      const result = await createArticleUseCase(input);
  
      // then
      expect(result._unsafeUnwrapErr()).toBe(domainError);
      expect(mockCreateArticle).toHaveBeenCalledTimes(1);
      expect(mockSaveArticle).not.toHaveBeenCalled();
    });
  
    test('記事の保存に失敗した場合、エラーを返す', async () => {
      // given
      const input = {
        authorId: 'author1',
        title: 'Original Title',
        body: 'Original Body',
      };
      const validatedArticle: ValidatedArticle = {
        authorId: 'author1',
        title: 'Original Title' as unknown as ArticleTitle,
        body: 'Original Body' as unknown as ArticleBody,
        status: ArticleStatus.Draft,
      };
      const infraError = new Error('Infrastructure error');
  
      const mockCreateArticle: CreateArticle = jest.fn(() => {
        return ok(validatedArticle);
      });
      const mockSaveArticle: SaveArticle = jest.fn(() => {
        return errAsync(infraError);
      });
  
      // when
      const createArticleUseCase = makeCreateArticleUseCase(mockCreateArticle, mockSaveArticle);
      const result = await createArticleUseCase(input);
  
      // then
      expect(result._unsafeUnwrapErr()).toBe(infraError);
      expect(mockCreateArticle).toHaveBeenCalledTimes(1);
      expect(mockSaveArticle).toHaveBeenCalledTimes(1);
      expect(mockSaveArticle).toHaveBeenCalledWith(validatedArticle);
    });
  });