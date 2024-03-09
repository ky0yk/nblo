export type ArticleId = string; //uuid
export type AuthorId = string;

export type ArticleTitle = string & { readonly brand: unique symbol };
export type ArticleBody = string & { readonly brand: unique symbol };

export enum ArticleStatus {
  Draft = 'draft',
  Published = 'published',
  Private = 'private',
}

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
