import {
  DynamoDBClient,
  CreateTableCommand,
  ScalarAttributeType,
  KeyType,
  CreateTableCommandInput,
} from '@aws-sdk/client-dynamodb';
import 'dotenv/config';

const client = new DynamoDBClient({
  endpoint: 'http://localhost:8000',
});

const tableName = process.env.TABLE_NAME;

if (!tableName) {
  throw new Error('TABLE_NAME environment variable is not set.');
}

const params: CreateTableCommandInput = {
  TableName: tableName,
  KeySchema: [
    { AttributeName: 'authorId', KeyType: KeyType.HASH },
    { AttributeName: 'articleId', KeyType: KeyType.RANGE },
  ],
  AttributeDefinitions: [
    { AttributeName: 'authorId', AttributeType: ScalarAttributeType.S },
    { AttributeName: 'articleId', AttributeType: ScalarAttributeType.S }, // GSIのキーとしても使用
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 10,
    WriteCapacityUnits: 10,
  },
  GlobalSecondaryIndexes: [
    {
      IndexName: 'ArticleIdIndex',
      KeySchema: [{ AttributeName: 'articleId', KeyType: KeyType.HASH }],
      Projection: {
        ProjectionType: 'ALL',
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10,
      },
    },
  ],
};

const createTable = async () => {
  try {
    const data = await client.send(new CreateTableCommand(params));
    console.log('Table Created:', data);
  } catch (err) {
    console.error('Error creating table:', err);
  }
};

createTable();
