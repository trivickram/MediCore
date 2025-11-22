// DynamoDB service layer for user operations
const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

class UserService {
  constructor() {
    this.tableName = `${process.env.DYNAMODB_TABLE}-users`;
  }

  async createUser(userData) {
    const { name, email, password, role, specialty } = userData;
    
    // Check if user already exists
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    
    const user = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      role: role || 'patient',
      ...(role === 'doctor' && specialty && { specialty }),
      consultedDoctors: [],
      consultedPatients: [],
      pendingConsultations: [],
      createdAt: new Date().toISOString()
    };

    const params = {
      TableName: this.tableName,
      Item: user
    };

    await dynamodb.put(params).promise();
    return { id: userId, name, email, role, specialty };
  }

  async getUserByEmail(email) {
    const params = {
      TableName: this.tableName,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    };

    const result = await dynamodb.query(params).promise();
    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
  }

  async getUserById(id) {
    const params = {
      TableName: this.tableName,
      Key: { id }
    };

    const result = await dynamodb.get(params).promise();
    return result.Item || null;
  }

  async updateUser(id, updates) {
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

  async validatePassword(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async searchDoctors(query) {
    const params = {
      TableName: this.tableName,
      FilterExpression: '#role = :role AND (contains(#name, :query) OR contains(specialty, :query))',
      ExpressionAttributeNames: {
        '#role': 'role',
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':role': 'doctor',
        ':query': query
      }
    };

    const result = await dynamodb.scan(params).promise();
    return result.Items || [];
  }
}

module.exports = UserService;