import { ArticleStatus, ToArticleStatus } from '../model/article-status';
import { err, ok } from 'neverthrow';
import {
  makeCreateArticle,
  toCreateArticleCommand,
} from './create-article-command';
import { ToTitle } from '../model/article-title';
import { ToBody } from '../model/article-body';

describe('createArticle', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('有効な作成コマンドが提供された場合、新しい記事を正常に作成すること', () => {
    // given
    const cmd = toCreateArticleCommand('author1', 'Valid Title', 'Valid Body');

    const mockToTitle: ToTitle = jest.fn().mockReturnValue(ok('Valid Title'));
    const mockToBody: ToBody = jest.fn().mockReturnValue(ok('Valid Body'));
    const mockToArticleStatus: ToArticleStatus = jest
      .fn()
      .mockReturnValue(ok(ArticleStatus.Draft));

    // when
    const createArticle = makeCreateArticle(
      mockToTitle,
      mockToBody,
      mockToArticleStatus,
    );
    const result = createArticle(cmd);

    // then
    expect(result.isOk()).toBe(true);
    const validatedArticle = result._unsafeUnwrap();
    expect(validatedArticle.title).toBe('Valid Title');
    expect(validatedArticle.body).toBe('Valid Body');
    expect(validatedArticle.status).toBe(ArticleStatus.Draft);
  });

  test('無効なタイトルが提供された場合、エラーを返すこと', () => {
    // given
    const cmd = toCreateArticleCommand(
      'author1',
      'Invalid Title',
      'Valid Body',
    );

    const mockToTitle: ToTitle = jest
      .fn()
      .mockReturnValue(err(new Error('Invalid title')));
    const mockToBody: ToBody = jest.fn().mockReturnValue(ok('Valid Body'));
    const mockToArticleStatus: ToArticleStatus = jest
      .fn()
      .mockReturnValue(ok(ArticleStatus.Draft));

    // when
    const createArticle = makeCreateArticle(
      mockToTitle,
      mockToBody,
      mockToArticleStatus,
    );
    const result = createArticle(cmd);

    // then
    expect(result.isErr()).toBe(true);
  });

  test('無効な本文が提供された場合、エラーを返すこと', () => {
    // given
    const cmd = toCreateArticleCommand(
      'author1',
      'Valid Title',
      'Invalid Body',
    );

    const mockToTitle: ToTitle = jest.fn().mockReturnValue(ok('Valid Title'));
    const mockToBody: ToBody = jest
      .fn()
      .mockReturnValue(err(new Error('Invalid body')));
    const mockToArticleStatus: ToArticleStatus = jest
      .fn()
      .mockReturnValue(ok(ArticleStatus.Draft));

    // when
    const createArticle = makeCreateArticle(
      mockToTitle,
      mockToBody,
      mockToArticleStatus,
    );
    const result = createArticle(cmd);

    // then
    expect(result.isErr()).toBe(true);
  });

  test('無効なステータスが提供された場合、エラーを返すこと', () => {
    // given
    const cmd = toCreateArticleCommand(
      'author1',
      'Valid Title',
      'Valid Body',
      'Invalid Status',
    );

    const mockToTitle: ToTitle = jest.fn().mockReturnValue(ok('Valid Title'));
    const mockToBody: ToBody = jest.fn().mockReturnValue(ok('Valid Body'));
    const mockToArticleStatus: ToArticleStatus = jest
      .fn()
      .mockReturnValue(err(new Error('Invalid status')));

    // when
    const createArticle = makeCreateArticle(
      mockToTitle,
      mockToBody,
      mockToArticleStatus,
    );
    const result = createArticle(cmd);

    // then
    expect(result.isErr()).toBe(true);
  });
});
