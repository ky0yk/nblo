import { DynamoDBClient, CreateTableCommand, DeleteTableCommand, CreateTableCommandInput, DeleteTableCommandInput, PutItemCommandInput, AttributeValue, PutItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DeleteCommandInput, DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { marshall, unmarshall} from "@aws-sdk/util-dynamodb";
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
      const command = new CreateTableCommand({
          TableName: tableName,
          AttributeDefinitions: [
              { AttributeName: "pk", AttributeType: "S" },
              { AttributeName: "sk", AttributeType: "S" }
          ],
          KeySchema: [
              { AttributeName: "pk", KeyType: "HASH" },
              { AttributeName: "sk", KeyType: "RANGE" }
          ],
          BillingMode: "PAY_PER_REQUEST"
      });
      await docClient.send(command);
  }
  
  const deleteTable = async () => {
      const command = new DeleteTableCommand({
          TableName: tableName
      });
      await docClient.send(command);
  }
  

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
      describe('.queryItem', () => {
        beforeEach(async () => {
          // テストデータの準備
          await resultClient.putItem({ TableName: tableName, Item: marshall({ pk: "user#1", sk: "2021-01-01#item1", name: "Item 1" }) });
          await resultClient.putItem({ TableName: tableName, Item: marshall({ pk: "user#1", sk: "2021-01-02#item2", name: "Item 2" }) });
          await resultClient.putItem({ TableName: tableName, Item: marshall({ pk: "user#1", sk: "2021-01-03#item3", name: "Item 3" }) });
        });
    
        afterEach(async () => {
          // テストデータのクリーンアップ
          await resultClient.deleteItem({ TableName: tableName, Key: marshall({ pk: "user#1", sk: "2021-01-01#item1" }) });
          await resultClient.deleteItem({ TableName: tableName, Key: marshall({ pk: "user#1", sk: "2021-01-02#item2" }) });
          await resultClient.deleteItem({ TableName: tableName, Key: marshall({ pk: "user#1", sk: "2021-01-03#item3" }) });
        });
    
        test('指定されたパーティションキーでアイテムをクエリする', async () => {
          const queryInput = {
            TableName: tableName,
            KeyConditionExpression: "pk = :pkVal",
            ExpressionAttributeValues: { ":pkVal": { S: "user#1" } }
          };
          const result = await resultClient.queryItem(queryInput);
    
          expect(result.isOk()).toBe(true);
          const items = result._unsafeUnwrap().Items;
          expect(items!.length).toEqual(3);

          const names = items!.map(item => unmarshall(item)).map(unmarshalledItem => unmarshalledItem.name);
          expect(names).toEqual(["Item 1", "Item 2", "Item 3"]);
        });
    
        test('クエリ条件に一致するアイテムがない場合の動作を確認する', async () => {
          const queryInput = {
            TableName: tableName,
            KeyConditionExpression: "pk = :pkVal",
            ExpressionAttributeValues: { ":pkVal": { S: "user#999" } }
          };
          const result = await resultClient.queryItem(queryInput);
    
          expect(result.isOk()).toBe(true);
          const items = result._unsafeUnwrap();
          expect(items.Items!.length).toEqual(0);
        });

        test('クエリが失敗した場合、適切なエラーが返される', async () => {
          const queryInput = {
            TableName: 'non-exist-table',
            KeyConditionExpression: "pk = :pkVal",
            ExpressionAttributeValues: { ":pkVal": { S: "user#1" } }
          };
          const result = await resultClient.queryItem(queryInput);

          expect(result.isOk()).toBe(false);
        });
      });
    });