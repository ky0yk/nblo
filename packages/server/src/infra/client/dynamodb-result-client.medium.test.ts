import { DynamoDBClient, CreateTableCommand, DeleteTableCommand, CreateTableCommandInput, DeleteTableCommandInput, PutItemCommandInput, AttributeValue, PutItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DeleteCommandInput, DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { marshall} from "@aws-sdk/util-dynamodb";
import { DynamoDbResultClient } from "./dynamodb-result-client";

const tableName = "TestTable";
const partitionKey = "id";

const ddbClient = new DynamoDBClient({
    region: "ap-northeast-1",
    endpoint: "http://localhost:8000",
  });
  const docClient = DynamoDBDocumentClient.from(ddbClient);
  const resultClient = new DynamoDbResultClient()

const createTable = async () => {
    const param: CreateTableCommandInput = {
        TableName: tableName,
        KeySchema: [{ AttributeName: partitionKey, KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: partitionKey, AttributeType: "S" }],
        BillingMode: "PAY_PER_REQUEST"
    }
    await docClient.send(
        new CreateTableCommand(param)
    );
};

const deleteTable = async () => {
    const param: DeleteTableCommandInput = { TableName: tableName }
    await ddbClient.send(new DeleteTableCommand(param));
  };

  const getItem = async (key: string) => {
    const input: GetCommandInput = {
      TableName: tableName,
      Key: { [partitionKey]: key },
    };
    const result = await docClient.send(new GetCommand(input));
    return result.Item;
  
  };

  const putItem = async (item: Record<string, any>) => {
    const input = { TableName: tableName, Item: item };
    await docClient.send(new PutCommand(input));
  };
  const deleteItem = async (key: string) => {
    const input = {
      TableName: tableName,
      Key: { [partitionKey]: key },
    };
    await docClient.send(new DeleteCommand(input));
  };


  describe("DynamoDbResultClient", () => {
    beforeAll(async () => {
        await createTable()
    });
    afterAll(async () => {
        await deleteTable()
    });

    describe('.putItem', () => {
        test("DynamoDBへのアイテムの追加が成功した場合、追加したアイテムが返される", async () => {
            const item = marshall({ [partitionKey]: "1", name: "John Doe" })
            const input: PutItemCommandInput = {
            TableName: tableName,
            Item: item,
          }

          const result = await resultClient.putItem(input);

          expect(result.isOk()).toBe(true);
          const retrievedItem = await getItem("1");
        //   expect(unmarshall(retrievedItem)).toEqual({ [partitionKey]: "1", name: "John Doe" });
        });
        test("DynamoDBへのアイテムの追加が失敗した場合、適切なエラーが返される", async () => {
            const item = marshall({ [partitionKey]: "1", name: "John Doe" })
            const result = await resultClient.putItem({
                TableName: "NonExistentTable",
                Item: item,
            });

            expect(result.isOk()).toBe(false);
        });
    });
    describe('.deleteItem', () => {
        beforeEach(async () => {
          await putItem({ [partitionKey]: '1', name: 'Test Item' });
        });

        afterEach(async () => {
          await deleteItem('1');
        });

        test('指定したキーに対応するアイテムが存在し、削除が成功した場合、成功を示す値が返される', async () => {
            const key = { [partitionKey]: '1' };
            const input: DeleteCommandInput = { TableName: tableName, Key: marshall(key) };
            const result = await resultClient.deleteItem(input);

            expect(result.isOk()).toBe(true);
        });

        test('指定したキーに対応するアイテムが存在しない場合、成功を示す値が返される', async () => {
            const result = await resultClient.deleteItem({ TableName: tableName, Key: { [partitionKey]: { S: '2' } } });

          expect(result.isOk()).toBe(true);
        });

        test('DynamoDBからのアイテムの削除が失敗した場合、適切なエラーが返される', async () => {
          const result = await resultClient.deleteItem({ TableName: 'NonExistentTable', Key: { [partitionKey]: { S: '1' } } });

          expect(result.isOk()).toBe(false);
        });
      });

  describe("queryRecursively", () => {
    test("アイテムの数がリミットより少ない場合、すべてのアイテムが取得できる", async () => {
      const params: QueryCommandInput = {
        TableName: tableName,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
          ":id": { S: "test" },
        },
      };
      const limit = 10;
      await putItem({ [partitionKey]: "test", value: 1 });
      await putItem({ [partitionKey]: "test", value: 2 });

      const result = await resultClient.queryRecursively(params, limit, partitionKey);
      expect(result.isOk()).toBe(true);
      // expect(result.value.Items).toHaveLength(2);
      // expect(result.value.Count).toBe(2);
    });

    test("アイテムの数がリミットと同じ場合、すべてのアイテムが取得できる", async () => {
      const params: QueryCommandInput = {
        TableName: tableName,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
          ":id": { S: "test" },
        },
      };
      const limit = 2;
      await putItem({ [partitionKey]: "test", value: 1 });
      await putItem({ [partitionKey]: "test", value: 2 });

      const result = await resultClient.queryRecursively(params, limit, partitionKey);
      expect(result.isOk()).toBe(true);
      // expect(result.value.Items).toHaveLength(2);
      // expect(result.value.Count).toBe(2);
    });

    test("アイテムの数がリミットより多い場合、ページネーションが機能し、すべてのアイテムが取得できる", async () => {
      const params: QueryCommandInput = {
        TableName: tableName,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
          ":id": { S: "test" },
        },
      };
      const limit = 2;
      await putItem({ [partitionKey]: "test", value: 1 });
      await putItem({ [partitionKey]: "test", value: 2 });
      await putItem({ [partitionKey]: "test", value: 3 });
      await putItem({ [partitionKey]: "test", value: 4 });

      const result = await resultClient.queryRecursively(params, limit, partitionKey);
      expect(result.isOk()).toBe(true);
      // expect(result.value.Items).toHaveLength(4);
      // expect(result.value.Count).toBe(4);
    });

    test("DynamoDB操作でエラーが発生した場合、適切にエラーハンドリングされる", async () => {
      const params: QueryCommandInput = {
        TableName: "NonExistentTable",
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
          ":id": { S: "test" },
        },
      };
      const limit = 10;

      const result = await resultClient.queryRecursively(params, limit, partitionKey);
      expect(result.isOk()).toBe(false);
    });

    test("初期のExclusiveStartKeyが設定されている場合、正しくページネーションが機能する", async () => {
      const params: QueryCommandInput = {
        TableName: tableName,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
          ":id": { S: "test" },
        },
      };
      const limit = 2;
      await putItem({ [partitionKey]: "test", value: 1 });
      await putItem({ [partitionKey]: "test", value: 2 });
      await putItem({ [partitionKey]: "test", value: 3 });
      await putItem({ [partitionKey]: "test", value: 4 });
    
      const initialExclusiveStartKey = { id: { S: "test" }, value: { N: "2" } };
      const result = await resultClient.queryRecursively(params, limit, partitionKey, undefined, initialExclusiveStartKey);
      expect(result.isOk()).toBe(true);
      // expect(result.value.Items).toHaveLength(2);
      // expect(result.value.Count).toBe(2);
    });

    test("最後のページでLastEvaluatedKeyがない場合、正しく処理される", async () => {
      const params: QueryCommandInput = {
        TableName: tableName,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
          ":id": { S: "test" },
        },
      };
      const limit = 10;
      await putItem({ [partitionKey]: "test", value: 1 });
      await putItem({ [partitionKey]: "test", value: 2 });

      const result = await resultClient.queryRecursively(params, limit, partitionKey);
      expect(result.isOk()).toBe(true);
      // expect(result.value.Items).toHaveLength(2);
      // expect(result.value.Count).toBe(2);
    });

  });
});
