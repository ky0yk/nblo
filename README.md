# nblo

[neverthorw](https://github.com/supermacro/neverthrow)を使ったブログ API のサンプルです。

## API 概要

[WordPress REST API](https://developer.wordpress.org/rest-api/) を参考にしています。以下のエンドポイントがあります。

| メソッド | パス              | 説明                                                                             | 制限     | クエリパラメータ          |
| -------- | ----------------- | -------------------------------------------------------------------------------- | -------- | ------------------------- |
| POST     | /v1/articles      | 新しい記事を作成します。                                                         | 著者のみ | -                         |
| GET      | /v1/articles      | 公開されている記事のリストを取得します。認証済み著者は非公開記事も取得できます。 | -        | author, sort, page, limit |
| GET      | /v1/articles/{id} | 特定の記事を取得します。非公開記事の場合、認証が必要です。                       | -        | -                         |
| PUT      | /v1/articles/{id} | 記事を更新します。                                                               | 著者のみ | -                         |
| DELETE   | /v1/articles/{id} | 記事を削除します。                                                               | 著者のみ | -                         |

### クエリパラメータの説明

- **author**: 特定の著者による記事をフィルタリングします。
- **sort**: 記事を日付でソートします。
- **page**: 表示するページ番号です。
- **limit**: 1 ページあたりに表示する記事の数です。
