// DynamoDB service layer for health records
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

class RecordService {
  constructor() {
    this.tableName = `${process.env.DYNAMODB_TABLE}-records`;
  }

  async createRecord(recordData) {
    const { userId, bp, sugar, heartRate } = recordData;
    const recordId = uuidv4();
    
    const record = {
      id: recordId,
      userId,
      bp,
      sugar,
      heartRate,
      createdAt: new Date().toISOString()
    };

    const params = {
      TableName: this.tableName,
      Item: record
    };

    await dynamodb.put(params).promise();
    return record;
  }

  async getRecordsByUserId(userId) {
    const params = {
      TableName: this.tableName,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false // Sort by creation date descending
    };

    const result = await dynamodb.query(params).promise();
    return result.Items || [];
  }

  async getRecordById(id) {
    const params = {
      TableName: this.tableName,
      Key: { id }
    };

    const result = await dynamodb.get(params).promise();
    return result.Item || null;
  }

  async updateRecord(id, updates) {
    const updateExpressions = [];
    const attributeNames = {};
    const attributeValues = {};

    Object.keys(updates).forEach((key) => {
      updateExpressions.push(`#${key} = :${key}`);
      attributeNames[`#${key}`] = key;
      attributeValues[`:${key}`] = updates[key];
    });

    const params = {
      TableName: this.tableName,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: attributeNames,
      ExpressionAttributeValues: attributeValues,
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamodb.update(params).promise();
    return result.Attributes;
  }

  async deleteRecord(id) {
    const params = {
      TableName: this.tableName,
      Key: { id }
    };

    await dynamodb.delete(params).promise();
    return true;
  }
}

module.exports = RecordService;