import {
  DeleteItemCommand,
  DeleteItemCommandInput,
  DeleteItemCommandOutput,
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandInput,
  PutItemCommandOutput,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommandInput,
  QueryCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { ResultAsync } from 'neverthrow';

export class DynamoDbResultClient {
  private readonly docClient: DynamoDBDocumentClient;

  constructor() {
    this.docClient = this.createDocumentClient();
  }

  private createDocumentClient(): DynamoDBDocumentClient {
    const ddbClient = new DynamoDBClient({
      region: 'ap-northeast-1',
      endpoint: 'http://localhost:8000',
    });
    return DynamoDBDocumentClient.from(ddbClient);
  }

  putItem(
    input: PutItemCommandInput,
  ): ResultAsync<PutItemCommandOutput, Error> {
    const command = new PutItemCommand(input);
    return ResultAsync.fromPromise(
      this.docClient.send(command),
      (error) => new Error(`DynamoDB put operation failed: ${error}`),
    );
  }

  deleteItem(
    input: DeleteItemCommandInput,
  ): ResultAsync<DeleteItemCommandOutput, Error> {
    const command = new DeleteItemCommand(input);
    return ResultAsync.fromPromise(
      this.docClient.send(command),
      (error) => new Error(`DynamoDB delete operation failed: ${error}`),
    );
  }

  queryItem(input: QueryCommandInput): ResultAsync<QueryCommandOutput, Error> {
    const command = new QueryCommand(input);
    return ResultAsync.fromPromise(
      this.docClient.send(command),
      (error) => new Error(`DynamoDB query operation failed: ${error}`),
    );
  }
}
