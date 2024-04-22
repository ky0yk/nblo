import { ResultAsync, ok } from 'neverthrow';
import { SavedArticle } from '../../../domain/article/model/article';
import {
  UpdateArticle,
  toUpdateArticleCommand,
} from '../../../domain/article/command/update-article-command';

import { ArticleStatus } from '../../../domain/article/model/article-status';
import {
  FindArticleById,
  SaveArticle,
} from '../../../domain/article/interface/article-repository';

interface Input {
  articleId: string;
  update: {
    title?: string;
    body?: string;
    status?: ArticleStatus;
  };
}
type UpdateArticleUseCase = (input: Input) => ResultAsync<SavedArticle, Error>;

export const makeUpdateArticleUseCase = (
  updateArticle: UpdateArticle,
  findArticleById: FindArticleById,
  saveArticle: SaveArticle,
) => {
  const updateArticleUseCase: UpdateArticleUseCase = (input) => {
    const command = ok(input.articleId)
      .asyncAndThen(findArticleById)
      .map((article) => toUpdateArticleCommand(article, input.update));

    return command.andThen(updateArticle).andThen(saveArticle);
  };

  return updateArticleUseCase;
};
