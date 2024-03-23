import { DynamoDBClient, DeleteTableCommand } from '@aws-sdk/client-dynamodb';
import 'dotenv/config';

const client = new DynamoDBClient({
  endpoint: 'http://localhost:8000',
});

const tableName = process.env.TABLE_NAME;

if (!tableName) {
  console.error('TABLE_NAME environment variable is not set.');
  process.exit(1);
}

const deleteTable = async () => {
  try {
    const data = await client.send(
      new DeleteTableCommand({ TableName: tableName }),
    );
    console.log('Table Deleted:', data);
  } catch (err) {
    console.error('Error deleting table:', err);
  }
};

deleteTable();
