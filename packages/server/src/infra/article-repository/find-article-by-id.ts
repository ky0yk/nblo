import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { ResultAsync } from 'neverthrow';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { SavedArticle } from '../../domain/article/model/article';
import { FindArticleById } from '../../domain/article/interface/repository';

const TABLE_NAME = process.env.TABLE_NAME;
const GSI_NAME = 'ArticleIdIndex';

export const makeFindArticleById = (client: DynamoDBClient) => {
  const findArticleById: FindArticleById = (articleId) => {
    return ResultAsync.fromPromise(
      client
        .send(
          new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: GSI_NAME,
            KeyConditionExpression: 'articleId = :articleId',
            ExpressionAttributeValues: {
              ':articleId': { S: articleId },
            },
          }),
        )
        .then((response) => {
          // GSIの検索結果は複数のアイテムを返す可能性があるため、最初のアイテムを選択
          console.log(response);
          if (!response.Items || response.Items.length === 0) {
            throw new Error('Article not found');
          }
          return unmarshall(response.Items[0]) as SavedArticle;
        }),
      (error: any) =>
        new Error(
          `Failed to get the article: ${error.message || error.toString()}`,
        ),
    );
  };

  return findArticleById;
};

// aws dynamodb query \
//     --table-name Articles \
//     --index-name ArticleIdIndex \
//     --key-condition-expression "articleId = :articleId" \
//     --expression-attribute-values '{":articleId":{"S":"<ArticleId>"}}' \
//     --endpoint-url http://localhost:8000
