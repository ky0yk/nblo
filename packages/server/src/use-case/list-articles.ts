import { AuthorId, SavedArticle } from '../domain/model/article';
import {
  fetchArticlesByAuthor,
  fetchOwnArticles,
  fetchArticles,
} from '../infra/ddb-repository/article/fetch-articles';

export type QueryParams = {
  authorId?: AuthorId;
  sort?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  token?: string;
};

interface ArticleSummary {
  articleId: string;
  authorId: string;
  title: string;
  createdAt: string;
}

export const listArticlesUseCase = (params: QueryParams) => {
  // トークンがあるとき
  if (params.token) {
    return fetchOwnArticles(params).map(toSummary);
  }
  // 著者IDが指定されているとき
  else if (params.authorId) {
    return fetchArticlesByAuthor(params).map(toSummary);
  }
  // どの条件にも当てはまらないとき
  else {
    return fetchArticles(params).map(toSummary);
  }
};

const toSummary = (article: SavedArticle): ArticleSummary => {
  return {
    articleId: article.articleId,
    authorId: article.authorId,
    title: article.title,
    createdAt: article.createdAt,
  };
};
