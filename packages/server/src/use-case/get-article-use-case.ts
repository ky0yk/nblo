import { ArticleId, SavedArticle } from '../domain/article/model/article';
import { ResultAsync } from 'neverthrow';
import { filterPublishedArticle } from '../domain/article/service/article-service';
import { FindArticleById } from '../domain/article/interface/article-repository';

interface Input {
  articleId: ArticleId;
  isUserTheAuthor?: boolean;
}
type GetArticleUseCase = (input: Input) => ResultAsync<SavedArticle, Error>;

export const makeGetArticleUseCase = (findArticleById: FindArticleById) => {
  const getArticleUseCase: GetArticleUseCase = (input) => {
    const { articleId, isUserTheAuthor } = input;

    return true
      ? findArticleById(articleId)
      : findArticleById(articleId).andThen(filterPublishedArticle);
  };

  return getArticleUseCase;
};
