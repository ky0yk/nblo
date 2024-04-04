import {
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
  ReturnValue,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
  UpdateCommand,
  UpdateCommandInput,
  DeleteCommand,
  DeleteCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { ResultAsync, ok, err, okAsync } from 'neverthrow';

export class DynamoDbResultClient {
  private docClient: DynamoDBDocumentClient;

  constructor() {
    const region = process.env.AWS_REGION || 'ap-northeast-1';
    this.docClient = DynamoDBDocumentClient.from(
      new DynamoDBClient({
        region,
        endpoint: 'http://localhost:8000',
      }),
      {
        marshallOptions: {
          removeUndefinedValues: true,
        },
      },
    );
  }

  public putItem(input: PutCommandInput): ResultAsync<unknown, Error> {
    return ResultAsync.fromPromise(
      this.docClient.send(new PutCommand(input)),
      (error) => new Error(`Failed to put item: ${(error as Error).message}`),
    ).map(() => ok(input.Item));
  }

  public getItem(input: GetCommandInput): ResultAsync<unknown, Error> {
    return ResultAsync.fromPromise(
      this.docClient.send(new GetCommand(input)),
      (error) => new Error(`Failed to get item`),
    ).map((result) =>
      result.Item ? ok(result.Item) : err(new Error('Item not found')),
    );
  }

  public updateItem(input: UpdateCommandInput): ResultAsync<unknown, Error> {
    const updateInput = {
      ...input,
      ReturnValues: 'ALL_NEW' as ReturnValue,
    };

    return ResultAsync.fromPromise(
      this.docClient.send(new UpdateCommand(updateInput)),
      (error) => new Error(`Failed to update item`),
    ).map((result) => {
      if (result.Attributes) {
        return ok(result.Attributes);
      } else {
        return err(new Error('No item returned after update.'));
      }
    });
  }

  public deleteItem(input: DeleteCommandInput): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
      this.docClient.send(new DeleteCommand(input)),
      (error: unknown) => {
        return new Error('Failed to delete item');
      },
    ).map(() => {});
  }

  private executeQuery(
    input: QueryCommandInput,
  ): ResultAsync<QueryCommandOutput, Error> {
    return ResultAsync.fromPromise(
      this.docClient.send(new QueryCommand(input)),
      (error) =>
        new Error(
          `Failed to query items: ${
            error instanceof Error ? error.message : 'An unknown error occurred'
          }`,
        ),
    );
  }

  public queryRecursively(
    input: QueryCommandInput,
    limit: number,
    exclusiveStartKey?: Record<string, any>,
    accumulatedResults: QueryCommandOutput = {
      Items: [],
      Count: 0,
      ScannedCount: 0,
      $metadata: {},
    },
  ): ResultAsync<QueryCommandOutput, Error> {
    if (limit <= 0) {
      okAsync(accumulatedResults);
    }

    const updatedInput: QueryCommandInput = {
      ...input,
      ExclusiveStartKey: exclusiveStartKey,
      Limit: limit,
    };

    return this.executeQuery(updatedInput).andThen((result) => {
      const newItems = result.Items ?? [];
      const existingItems = accumulatedResults.Items ?? [];

      const updatedAccumulatedResults: QueryCommandOutput = {
        ...accumulatedResults,
        Items: existingItems.concat(newItems),
        Count: (accumulatedResults.Count ?? 0) + (result.Count ?? 0),
        ScannedCount:
          (accumulatedResults.ScannedCount ?? 0) + (result.ScannedCount ?? 0),
        LastEvaluatedKey: result.LastEvaluatedKey,
      };

      if (
        result.LastEvaluatedKey &&
        existingItems.length + newItems.length < limit
      ) {
        return this.queryRecursively(
          input,
          limit - existingItems.length - newItems.length,
          result.LastEvaluatedKey,
          updatedAccumulatedResults,
        );
      } else {
        return ok(updatedAccumulatedResults);
      }
    });
  }
}
