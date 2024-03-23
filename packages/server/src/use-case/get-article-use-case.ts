import { ArticleId, SavedArticle } from '../domain/model/article';
import { ResultAsync } from 'neverthrow';
import { filterPublishedArticle } from '../domain/service/article-service';
import { FindArticleById } from '../domain/interface/repository';

interface Input {
  articleId: ArticleId;
  isUserTheAuthor?: boolean;
}
type GetArticleUseCase = (input: Input) => ResultAsync<SavedArticle, Error>;

export const makeGetArticleUseCase = (findArticleById: FindArticleById) => {
  const getArticleUseCase: GetArticleUseCase = (input) => {
    const { articleId, isUserTheAuthor } = input;

    return isUserTheAuthor
      ? findArticleById(articleId)
      : findArticleById(articleId).andThen(filterPublishedArticle);
  };

  return getArticleUseCase;
};
