import { ArticleId, SavedArticle } from '../../../domain/article/model/article';
import { ResultAsync } from 'neverthrow';
import { FindArticleById } from '../../../domain/article/interface/article-repository';

interface Input {
  articleId: ArticleId;
}
type GetArticleUseCase = (input: Input) => ResultAsync<SavedArticle, Error>;

export const makeGetOwnArticleUseCase = (findArticleById: FindArticleById) => {
  const getOwnArticleUseCase: GetArticleUseCase = (input) => {
    return findArticleById(input.articleId);
  };

  return getOwnArticleUseCase;
};
