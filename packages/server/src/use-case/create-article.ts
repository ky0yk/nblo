import { ResultAsync, ok } from 'neverthrow';
import { SavedArticle } from '../domain/model/article';
import { makeSaveArticle } from '../infra/repository/article/save-article';
import createDynamoDBClient from '../infra/client/dynamodb-client';
import {
  createArticle,
  toCreateArticleCommand,
} from '../domain/commands/create-article-command';
import { ArticleStatus } from '../domain/model/article-status';

interface Input {
  authorId: string;
  title: string;
  body: string;
  status?: string;
}
type CreateArticleUseCase = (input: Input) => ResultAsync<SavedArticle, Error>;

export const createArticleUseCase: CreateArticleUseCase = (input) => {
  const client = createDynamoDBClient();
  const saveArticle = makeSaveArticle(client);

  const command = toCreateArticleCommand(
    input.authorId,
    input.title,
    input.body,
    input.status ? input.status : ArticleStatus.Draft,
  );

  return ok(command).andThen(createArticle).asyncAndThen(saveArticle);
};
