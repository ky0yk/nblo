import { AttributeValue, DeleteItemCommand, DeleteItemCommandInput, DeleteItemCommandOutput, DynamoDB, DynamoDBClient, PutItemCommand, PutItemCommandInput, PutItemCommandOutput, QueryCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommandInput, QueryCommandOutput} from "@aws-sdk/lib-dynamodb";
import { ResultAsync, ok, okAsync } from "neverthrow";

export class DynamoDbResultClient {
  private readonly docClient: DynamoDBDocumentClient;

  constructor() {
    const ddbClient = new DynamoDBClient({
      region: "ap-northeast-1",
      endpoint: "http://localhost:8000",
    });
    this.docClient = DynamoDBDocumentClient.from(ddbClient);
  }

  putItem(input: PutItemCommandInput): ResultAsync<PutItemCommandOutput, Error> {
    const command = new PutItemCommand(input);

    return ResultAsync.fromPromise(
      this.docClient.send(command),
      (error) =>
        new Error(
          `DynamoDB put operation failed: ${error}`,
        ),
    )
  }

  deleteItem(
    input: DeleteItemCommandInput,
  ): ResultAsync<DeleteItemCommandOutput, Error> {
    const command = new DeleteItemCommand(input);

    return ResultAsync.fromPromise(
      this.docClient.send(command),
      (error) =>
        new Error(
          `DynamoDB delete operation failed: ${error}`,
        ),
    );
  };

  queryRecursively(
    params: QueryCommandInput,
    limit: number,
    partitionKey: string,
    accumulatedResults: QueryCommandOutput = { Items: [], $metadata: {} },
    exclusiveStartKey?: Record<string, AttributeValue>,
  ): ResultAsync<QueryCommandOutput, Error> {
    if (limit <= 0) {
      return okAsync(accumulatedResults);
    }
  
    const paramsWithExclusiveStartKey = exclusiveStartKey
      ? { ...params, ExclusiveStartKey: { [partitionKey]: exclusiveStartKey[partitionKey] } }
      : { ...params };
    const remainingLimit = limit - (accumulatedResults.Items?.length || 0);
    paramsWithExclusiveStartKey.Limit = remainingLimit;
  
    return ResultAsync.fromPromise(
      this.docClient.send(new QueryCommand(paramsWithExclusiveStartKey)),
      (error: unknown) => {
        return error instanceof Error ? error : new Error(`DynamoDB query failed: ${error}`);
      }
    ).andThen((result) => {
      const newItems = result.Items ?? [];
      const newAccumulatedResults: QueryCommandOutput = {
        Items: [...(accumulatedResults.Items || []), ...newItems],
        Count: (accumulatedResults.Count || 0) + (result.Count || 0),
        ScannedCount: (accumulatedResults.ScannedCount || 0) + (result.ScannedCount || 0),
        LastEvaluatedKey: result.LastEvaluatedKey,
        $metadata: result.$metadata,
      };
  
      const remainingLimit = limit - (newAccumulatedResults.Items?.length || 0);
  
      // 残りのアイテムがあり、さらに取得する必要がある場合は再帰的にこの関数を呼び出す
      if (result.LastEvaluatedKey && remainingLimit > 0) {
        return this.queryRecursively(
          params,
          limit,
          partitionKey,
          newAccumulatedResults,
          result.LastEvaluatedKey
        );
      } else {
        // すべての必要なアイテムが取得できた場合は結果を返す
        return okAsync(newAccumulatedResults);
      }
    });
  }
}