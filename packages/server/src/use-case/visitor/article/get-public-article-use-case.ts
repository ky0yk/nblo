import { ArticleId, SavedArticle } from '../../../domain/article/model/article';
import { ResultAsync } from 'neverthrow';
import { ValidatePublishedArticle } from '../../../domain/article/service/article-service';
import { FindArticleById } from '../../../domain/article/interface/article-repository';

interface Input {
  articleId: ArticleId;
}
type GetArticleUseCase = (input: Input) => ResultAsync<SavedArticle, Error>;

export const makeGetPublicArticleUseCase = (
  validatePublishedArticle: ValidatePublishedArticle,
  findArticleById: FindArticleById,
) => {
  const getPublicArticleUseCase: GetArticleUseCase = (input) => {
    return findArticleById(input.articleId).andThen(validatePublishedArticle);
  };

  return getPublicArticleUseCase;
};
