jest.mock('../model/article-title', () => ({
  toTitle: jest.fn(),
}));
jest.mock('../model/article-body', () => ({
  toBody: jest.fn(),
}));
jest.mock('../model/article-status');

import { SavedArticle } from '../model/article';
import { ArticleBody, toBody } from '../model/article-body';
import { ArticleTitle, toTitle } from '../model/article-title';
import { setToTitleError, resetToTitleMock } from '../model/article-title.mock';
import { setToBodyError, resetToBodyMock } from '../model/article-body.mock';
import { ArticleStatus } from '../model/article-status';
import {
  mockToValidStatusError,
  resetToValidStatusMock,
} from '../model/article-status.mock';
import {
  UpdateDataEmptyError,
  toUpdateArticleCommand,
  updateArticle,
} from './update-article-command';

describe('updateArticle', () => {
  beforeEach(() => {
    resetToTitleMock();
    resetToBodyMock();
    resetToValidStatusMock();
  });

  test('有効な更新データが提供された場合、更新された記事を返すこと', () => {
    // given
    const savedArticle: SavedArticle = {
      articleId: '1',
      authorId: 'author1',
      title: 'Original Title' as ArticleTitle,
      body: 'Original Body' as ArticleBody,
      status: ArticleStatus.Draft,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const update = {
      title: 'Updated Title',
      body: 'Updated Body',
      status: ArticleStatus.Published,
    };

    // when
    const cmd = toUpdateArticleCommand(savedArticle, update);
    const result = updateArticle(cmd);

    // then
    expect(result.isOk()).toBe(true);
    const validatedArticle = result._unsafeUnwrap();
    expect(validatedArticle.title).toBe('Mocked Title');
    expect(validatedArticle.body).toBe('Mocked Body');
    expect(validatedArticle.status).toBe(ArticleStatus.Published);
  });

  test('更新データが空の場合、エラーを返すこと', () => {
    // given
    const savedArticle: SavedArticle = {
      articleId: '1',
      authorId: 'author1',
      title: 'Original Title' as ArticleTitle,
      body: 'Original Body' as ArticleBody,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const emptyUpdate = {};

    // when
    const cmd = toUpdateArticleCommand(savedArticle, emptyUpdate);
    const result = updateArticle(cmd);

    // then
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(UpdateDataEmptyError);
  });

  test('無効なタイトルが提供された場合、エラーを返すこと', () => {
    // given
    setToTitleError();

    const savedArticle: SavedArticle = {
      articleId: '1',
      authorId: 'author1',
      title: 'Original Title' as ArticleTitle,
      body: 'Original Body' as ArticleBody,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const invalidUpdate = { title: 'invalid-title' };

    // when
    const cmd = toUpdateArticleCommand(savedArticle, invalidUpdate);
    const result = updateArticle(cmd);

    // then
    expect(toTitle).toHaveBeenCalledTimes(1);
    expect(result.isErr()).toBe(true);
  });

  test('無効な本文が提供された場合、エラーを返すこと', () => {
    // given
    setToBodyError();

    const savedArticle: SavedArticle = {
      articleId: '1',
      authorId: 'author1',
      title: 'Original Title' as ArticleTitle,
      body: 'Original Body' as ArticleBody,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const invalidUpdate = { body: 'invalid-body' };

    // when
    const cmd = toUpdateArticleCommand(savedArticle, invalidUpdate);
    const result = updateArticle(cmd);

    // then
    expect(toBody).toHaveBeenCalledTimes(1);
    expect(result.isErr()).toBe(true);
  });

  test('無効なステータスが提供された場合、エラーを返すこと', () => {
    // given
    mockToValidStatusError();

    const savedArticle: SavedArticle = {
      articleId: '1',
      authorId: 'author1',
      title: 'Original Title' as ArticleTitle,
      body: 'Original Body' as ArticleBody,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const invalidUpdate = { status: 'invalid-status' };

    // when
    const cmd = toUpdateArticleCommand(savedArticle, invalidUpdate);
    const result = updateArticle(cmd);

    // then
    expect(result.isErr()).toBe(true);
  });
});