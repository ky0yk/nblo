import { ArticleBody } from './article-body';
import { ArticleStatus } from './article-status';
import { ArticleTitle } from './article-title';

export type ArticleId = string; //uuid
export type AuthorId = string;

export interface ValidatedArticle {
  articleId?: ArticleId;
  authorId: AuthorId;
  title: ArticleTitle;
  body: ArticleBody;
  status: ArticleStatus;
  createdAt?: string;
}

export interface SavedArticle {
  articleId: ArticleId;
  authorId: AuthorId;
  title: ArticleTitle;
  body: ArticleBody;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
}
