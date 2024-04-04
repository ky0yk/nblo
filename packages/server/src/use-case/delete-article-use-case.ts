import { DeleteArticleById } from '../domain/article/interface/article-repository';
import { ArticleId } from '../domain/article/model/article';
import { ResultAsync } from 'neverthrow';

interface Input {
  articleId: ArticleId;
}

type DeleteArticleUseCase = (input: Input) => ResultAsync<void, Error>;

export const makeDeleteArticleUseCase = (
  deleteArticleById: DeleteArticleById,
) => {
  const deleteArticleUseCase: DeleteArticleUseCase = (input) => {
    return deleteArticleById({ authorId: '1', articleId: input.articleId });
  };

  return deleteArticleUseCase;
};
