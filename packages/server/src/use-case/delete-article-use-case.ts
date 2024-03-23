import { DeleteArticleById } from '../domain/interface/repository';
import { ArticleId, SavedArticle } from '../domain/model/article';
import { ResultAsync } from 'neverthrow';

interface Input {
  articleId: ArticleId;
}

type DeleteArticleUseCase = (input: Input) => ResultAsync<void, Error>;

export const makeDeleteArticleUseCase = (
  deleteArticleById: DeleteArticleById,
) => {
  const deleteArticleUseCase: DeleteArticleUseCase = (
    input,
  ): ResultAsync<void, Error> => {
    return deleteArticleById(input.articleId);
  };

  return deleteArticleUseCase;
};
