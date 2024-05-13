import {
  CreateArticle,
  toCreateArticleCommand,
} from '../../../domain/article/command/create-article-command';
import { ResultAsync, ok } from 'neverthrow';
import { SavedArticle } from '../../../domain/article/model/article';
import { SaveArticle } from '../../../domain/article/interface/article-repository';

interface Input {
  authorId: string;
  title: string;
  body: string;
  status?: string;
}
type CreateArticleUseCase = (input: Input) => ResultAsync<SavedArticle, Error>;

export const makeCreateArticleUseCase = (
  createArticle: CreateArticle,
  saveArticle: SaveArticle,
) => {
  const createArticleUseCase: CreateArticleUseCase = (input) => {
    const command = toCreateArticleCommand(
      input.authorId,
      input.title,
      input.body,
      input.status,
    );

    return ok(command).andThen(createArticle).asyncAndThen(saveArticle);
  };

  return createArticleUseCase;
};
