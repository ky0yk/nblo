import { DeleteArticleById } from '../domain/interface/repository';
import { ArticleId } from '../domain/model/article';
import { ResultAsync } from 'neverthrow';

interface Input {
  articleId: ArticleId;
}

type DeleteArticleUseCase = (input: Input) => ResultAsync<void, Error>;

export const makeDeleteArticleUseCase = (
  deleteArticleById: DeleteArticleById,
) => {
  const deleteArticleUseCase: DeleteArticleUseCase = (input) => {
    console.log('delete usecase');
    return deleteArticleById({ authorId: '1', articleId: input.articleId });
  };

  return deleteArticleUseCase;
};
