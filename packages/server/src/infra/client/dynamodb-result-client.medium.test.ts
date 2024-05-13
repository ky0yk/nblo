import {
  DynamoDBClient,
  CreateTableCommand,
  DeleteTableCommand,
  PutItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { DynamoDbResultClient } from './dynamodb-result-client';

const tableName = 'TestTable';
const partitionKey = 'pk';
const sortKey = 'sk';

const ddbClient = new DynamoDBClient({
  region: 'ap-northeast-1',
  endpoint: 'http://localhost:8000',
});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const resultClient = new DynamoDbResultClient();

const createTable = async () => {
  const command = new CreateTableCommand({
    TableName: tableName,
    AttributeDefinitions: [
      { AttributeName: 'pk', AttributeType: 'S' },
      { AttributeName: 'sk', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'pk', KeyType: 'HASH' },
      { AttributeName: 'sk', KeyType: 'RANGE' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  });
  await docClient.send(command);
};

const deleteTable = async () => {
  const command = new DeleteTableCommand({
    TableName: tableName,
  });
  await docClient.send(command);
};

const getItem = async (pk: string, sk: string) => {
  const input: GetCommandInput = {
    TableName: tableName,
    Key: { [partitionKey]: pk, [sortKey]: sk },
  };
  const result = await docClient.send(new GetCommand(input));
  return result.Item;
};

const putItem = async (item: Record<string, any>) => {
  const input = { TableName: tableName, Item: item };
  await docClient.send(new PutCommand(input));
};
const deleteItem = async (pk: string, sk: string) => {
  const input = {
    TableName: tableName,
    Key: { [partitionKey]: pk, [sortKey]: sk },
  };
  await docClient.send(new DeleteCommand(input));
};

describe('DynamoDbResultClient', () => {
  beforeAll(async () => {
    await createTable();
  });
  afterAll(async () => {
    await deleteTable();
  });

  describe('.putItem', () => {
    afterEach(async () => {
      await deleteItem('1', '1');
    });

    test('DynamoDBへのアイテムの追加が成功した場合、追加したアイテムが返される', async () => {
      const item = marshall({
        [partitionKey]: '1',
        [sortKey]: '1',
        name: 'John Doe',
      });
      const input: PutItemCommandInput = {
        TableName: tableName,
        Item: item,
      };

      const result = await resultClient.putItem(input);

      expect(result.isOk()).toBe(true);
      const retrievedItem = await getItem('1', '1');
      expect(retrievedItem).toEqual({
        [partitionKey]: '1',
        [sortKey]: '1',
        name: 'John Doe',
      });
    });

    test('DynamoDBへのアイテムの追加が失敗した場合、適切なエラーが返される', async () => {
      const item = marshall({
        [partitionKey]: '1',
        [sortKey]: '1',
        name: 'John Doe',
      });
      const result = await resultClient.putItem({
        TableName: 'NonExistentTable',
        Item: item,
      });

      expect(result.isOk()).toBe(false);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
    });
  });

  describe('.deleteItem', () => {
    beforeEach(async () => {
      await putItem({ [partitionKey]: '1', [sortKey]: '1', name: 'Test Item' });
    });

    afterEach(async () => {
      await deleteItem('1', '1');
    });

    test('指定したキーに対応するアイテムが存在し、削除が成功した場合、成功を示す値が返される', async () => {
      const result = await resultClient.deleteItem({
        TableName: tableName,
        Key: marshall({ [partitionKey]: '1', [sortKey]: '1' }),
      });

      expect(result.isOk()).toBe(true);
    });

    test('指定したキーに対応するアイテムが存在しない場合、成功を示す値が返される', async () => {
      const result = await resultClient.deleteItem({
        TableName: tableName,
        Key: marshall({ [partitionKey]: '1', [sortKey]: '2' }),
      });

      expect(result.isOk()).toBe(true);
    });

    test('DynamoDBからのアイテムの削除が失敗した場合、適切なエラーが返される', async () => {
      const result = await resultClient.deleteItem({
        TableName: 'NonExistentTable',
        Key: marshall({ [partitionKey]: '1', [sortKey]: '1' }),
      });

      expect(result.isOk()).toBe(false);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
    });
  });

  describe('.queryItem', () => {
    beforeEach(async () => {
      await putItem({ [partitionKey]: '1', [sortKey]: '1', name: 'John' });
      await putItem({ [partitionKey]: '1', [sortKey]: '2', name: 'Jane' });
      await putItem({ [partitionKey]: '2', [sortKey]: '1', name: 'Alice' });
    });

    afterEach(async () => {
      await deleteItem('1', '1');
      await deleteItem('1', '2');
      await deleteItem('2', '1');
    });

    test('指定したパーティションキーに対応するアイテムが返される', async () => {
      const input: QueryCommandInput = {
        TableName: tableName,
        KeyConditionExpression: '#pk = :pkValue',
        ExpressionAttributeNames: { '#pk': partitionKey },
        ExpressionAttributeValues: marshall({ ':pkValue': '1' }),
      };

      const result = await resultClient.queryItem(input);

      expect(result.isOk()).toBe(true);

      const items = result
        ._unsafeUnwrap()
        .Items?.map((item) => unmarshall(item));
      expect(items).toHaveLength(2);
      expect(items).toContainEqual({
        [partitionKey]: '1',
        [sortKey]: '1',
        name: 'John',
      });
      expect(items).toContainEqual({
        [partitionKey]: '1',
        [sortKey]: '2',
        name: 'Jane',
      });
    });

    test('指定したパーティションキーに対応するアイテムが存在しない場合、空の配列が返される', async () => {
      const input: QueryCommandInput = {
        TableName: tableName,
        KeyConditionExpression: '#pk = :pkValue',
        ExpressionAttributeNames: { '#pk': partitionKey },
        ExpressionAttributeValues: marshall({ ':pkValue': '3' }),
      };

      const result = await resultClient.queryItem(input);

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap().Items).toHaveLength(0);
    });

    test('クエリが失敗した場合、適切なエラーが返される', async () => {
      const input: QueryCommandInput = {
        TableName: 'NonExistentTable',
        KeyConditionExpression: '#pk = :pkValue',
        ExpressionAttributeNames: { '#pk': partitionKey },
        ExpressionAttributeValues: marshall({ ':pkValue': '1' }),
      };

      const result = await resultClient.queryItem(input);

      expect(result.isOk()).toBe(false);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
    });
  });
});
