import { ArticleStatus } from '../model/article-status';
import { toCreateArticleCommand } from './create-article-command';

describe('toCreateArticleCommand', () => {
  test('必須パラメーターが提供され、statusが省略された場合、デフォルトでdraftに設定される', () => {
    // given
    const authorId = 'author1';
    const title = 'Test Title';
    const body = 'Test Body';

    // when
    const command = toCreateArticleCommand(authorId, title, body);

    // then
    expect(command).toEqual({
      authorId,
      title,
      body,
      status: ArticleStatus.Draft,
    });
  });

  test('オプショナルなstatusパラメータが提供されたとき、それが返されるオブジェクトに正しく含まれていること', () => {
    // given
    const status = 'public';

    // when
    const command = toCreateArticleCommand(
      'author1',
      'Test Title',
      'Test Body',
      status,
    );

    // then
    expect(command).toHaveProperty('status', 'public');
  });
});
