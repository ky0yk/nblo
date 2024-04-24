import { DeleteItemCommand, DeleteItemCommandInput, DeleteItemCommandOutput, DynamoDBClient, PutItemCommand, PutItemCommandInput, PutItemCommandOutput, QueryCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommandInput, QueryCommandOutput} from "@aws-sdk/lib-dynamodb";
import { ResultAsync } from "neverthrow";
export class DynamoDbResultClient {
  private readonly docClient: DynamoDBDocumentClient;

  constructor() {
    this.docClient = this.createDocumentClient();
  }

  private createDocumentClient(): DynamoDBDocumentClient {
    const ddbClient = new DynamoDBClient({
      region: "ap-northeast-1",
      endpoint: "http://localhost:8000",
    });
    return DynamoDBDocumentClient.from(ddbClient);
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    } else {
      return new Error("An unknown error occurred.");
    }
  }

  putItem(input: PutItemCommandInput): ResultAsync<PutItemCommandOutput, Error> {
    const command = new PutItemCommand(input);
    return ResultAsync.fromPromise(
      this.docClient.send(command),
      (error) => new Error(`DynamoDB put operation failed: ${error}`),
    );
  }

  deleteItem(input: DeleteItemCommandInput): ResultAsync<DeleteItemCommandOutput, Error> {
    const command = new DeleteItemCommand(input);
    return ResultAsync.fromPromise(
      this.docClient.send(command),
      (error) => new Error(`DynamoDB delete operation failed: ${error}`),
    );
  }

  queryItem(input: QueryCommandInput): ResultAsync<QueryCommandOutput, Error> {
    return ResultAsync.fromPromise(
      this.executeQuery(input),
      this.handleError,
    );
  }

  private async executeQuery(input: QueryCommandInput): Promise<QueryCommandOutput> {
    let result: QueryCommandOutput | undefined;
    let lastEvaluatedKey: QueryCommandOutput["LastEvaluatedKey"] | undefined = undefined;

    do {
      const command: QueryCommand = new QueryCommand({ ...input, ExclusiveStartKey: lastEvaluatedKey });
      const currentResult: QueryCommandOutput= await this.docClient.send(command);

      result = this.mergeQueryResults(result, currentResult);
      lastEvaluatedKey = currentResult.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    if (result) {
      return result;
    } else {
      throw new Error("No query results");
    }
  }

  private mergeQueryResults(
    prev: QueryCommandOutput | undefined,
    current: QueryCommandOutput,
  ): QueryCommandOutput {
    if (!prev) {
      return current;
    }

    return {
      Items: [...(prev.Items || []), ...(current.Items || [])],
      Count: (prev.Count || 0) + (current.Count || 0),
      ScannedCount: (prev.ScannedCount || 0) + (current.ScannedCount || 0),
      LastEvaluatedKey: current.LastEvaluatedKey,
      $metadata: current.$metadata,
    };
  }
}