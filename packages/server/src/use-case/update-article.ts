import { ResultAsync, ok } from 'neverthrow';
import { ArticleStatus, SavedArticle } from '../domain/model/article';
import createDynamoDBClient from '../infra/client/dynamodb-client';
import { makeFindArticleById } from '../infra/repository/article/find-article-by-id';
import {
  toUpdateArticleCommand,
  updateArticle,
} from '../domain/commands/update-article-command';
import { makeSaveArticle } from '../infra/repository/article/save-article';

interface Input {
  articleId: string;
  update: {
    title?: string;
    body?: string;
    status?: ArticleStatus;
  };
}
type UpdateArticleUseCase = (input: Input) => ResultAsync<SavedArticle, Error>;

export const updateArticleUseCase: UpdateArticleUseCase = (input) => {
  const client = createDynamoDBClient();
  const findArticleById = makeFindArticleById(client);
  const saveArticle = makeSaveArticle(client);

  const command = ok(input.articleId)
    .asyncAndThen(findArticleById)
    .map((article) => toUpdateArticleCommand(article, input.update));

  return command.andThen(updateArticle).andThen(saveArticle);
};
