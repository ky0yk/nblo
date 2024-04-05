# nblo

[neverthorw](https://github.com/supermacro/neverthrow)を使ったブログ API のサンプルです。

## API 概要

以下の API があります。

### Author API

著者が自身の記事を管理するために使用します。

| メソッド | パス                       | 説明                                                   | 認証 | クエリパラメータ  |
| -------- | -------------------------- | ------------------------------------------------------ | ---- | ----------------- |
| POST     | `/v1/author/articles`      | 新しい記事を作成します。                               | 必要 | -                 |
| GET      | `/v1/author/articles`      | 自分が作成した記事のリストを状態を問わず取得します。   | 必要 | sort, page, limit |
| GET      | `/v1/author/articles/{id}` | 自分が作成した指定された記事を状態を問わず取得します。 | 必要 | -                 |
| PUT      | `/v1/author/articles/{id}` | 自分が作成した指定された記事を更新します。             | 必要 | -                 |
| DELETE   | `/v1/author/articles/{id}` | 自分が作成した指定された記事を削除します。             | 必要 | -                 |

### Visitor API

読者が公開されている記事のリストや、詳細を取得するために使用します。

| メソッド | パス                | 説明                                     | 認証 | クエリパラメータ          |
| -------- | ------------------- | ---------------------------------------- | ---- | ------------------------- |
| GET      | `/v1/articles`      | 公開されている記事のリストを取得します。 | -    | author, sort, page, limit |
| GET      | `/v1/articles/{id}` | 公開されている特定の記事を取得します。   | -    | -                         |
