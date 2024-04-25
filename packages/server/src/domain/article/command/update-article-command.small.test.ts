

import { SavedArticle } from '../model/article';
import { ArticleBody, ToBody, toBody } from '../model/article-body';
import { ArticleTitle, ToTitle, toTitle } from '../model/article-title';
import { ArticleStatus, ValidStatusTransition, validStatusTransition } from '../model/article-status';
import { UpdateDataEmptyError, makeUpdateArticle, toUpdateArticleCommand } from './update-article-command';
import { err } from 'neverthrow';

describe('updateArticle', () => {
  afterEach(() => {
    jest.resetAllMocks();
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
    const updateArticle = makeUpdateArticle(toTitle, toBody, validStatusTransition)
    const result = updateArticle(cmd);

    // then
    expect(result.isOk()).toBe(true);
    const validatedArticle = result._unsafeUnwrap();
    expect(validatedArticle.title).toBe(update.title);
    expect(validatedArticle.body).toBe(update.body);
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
    const updateArticle = makeUpdateArticle(toTitle, toBody, validStatusTransition)
    const result = updateArticle(cmd);


    // then
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(UpdateDataEmptyError);
  });

  test('無効なタイトルが提供された場合、エラーを返すこと', () => {
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

    const invalidUpdate = { title: 'invalid-title' };

    const mockToTitle: ToTitle = jest.fn(() => {
      return err(new Error())
    })

    // when
    const cmd = toUpdateArticleCommand(savedArticle, invalidUpdate);
    const updateArticle = makeUpdateArticle(mockToTitle, toBody, validStatusTransition)
    const result = updateArticle(cmd);

    // then
    expect(mockToTitle).toHaveBeenCalledTimes(1);
    expect(result.isErr()).toBe(true);
  });

  test('無効な本文が提供された場合、エラーを返すこと', () => {
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

    const mockToBody: ToBody = jest.fn(() => {
      return err(new Error())
    })

    const invalidUpdate = { body: 'invalid-body' };

    // when
    const cmd = toUpdateArticleCommand(savedArticle, invalidUpdate);
    const updateArticle = makeUpdateArticle(toTitle, mockToBody, validStatusTransition)
    const result = updateArticle(cmd);

    // then
    expect(mockToBody).toHaveBeenCalledTimes(1);
    expect(result.isErr()).toBe(true);
  });

  test('無効なステータスが提供された場合、エラーを返すこと', () => {
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

    const mockValidStatusTransition: ValidStatusTransition = jest.fn(() => {
      return err(new Error())
    })

    const invalidUpdate = { status: 'invalid-status' };

    // when
    const cmd = toUpdateArticleCommand(savedArticle, invalidUpdate);
    const updateArticle = makeUpdateArticle(toTitle, toBody, mockValidStatusTransition)
    const result = updateArticle(cmd);

    // then
    expect(result.isErr()).toBe(true);
  });
});
