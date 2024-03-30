import {
  createArticle,
  toCreateArticleCommand,
} from '../domain/article/command/create-article-command';
import { ArticleStatus } from '../domain/article/model/article-status';
import { ResultAsync, ok } from 'neverthrow';
import { SavedArticle } from '../domain/article/model/article';
import { SaveArticle } from '../domain/article/interface/repository';

interface Input {
  authorId: string;
  title: string;
  body: string;
  status?: string;
}
type CreateArticleUseCase = (input: Input) => ResultAsync<SavedArticle, Error>;

export const makeCreateArticleUseCase = (saveArticle: SaveArticle) => {
  const createArticleUseCase: CreateArticleUseCase = (input) => {
    const command = toCreateArticleCommand(
      input.authorId,
      input.title,
      input.body,
      input.status ? input.status : ArticleStatus.Draft,
    );

    return ok(command).andThen(createArticle).asyncAndThen(saveArticle);
  };

  return createArticleUseCase;
};
