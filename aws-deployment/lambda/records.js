// Lambda functions for health records management
const RecordService = require('../services/RecordService');

const recordService = new RecordService();

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json'
};

// Add new health record
exports.add = async (event) => {
  try {
    const { bp, sugar, heartRate } = JSON.parse(event.body);
    const userId = event.requestContext.authorizer.userId;

    if (!bp || !sugar || !heartRate) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required vital signs data' })
      };
    }

    const record = await recordService.createRecord({
      userId,
      bp,
      sugar,
      heartRate
    });

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ 
        message: 'Vitals added successfully',
        record
      })
    };
  } catch (error) {
    console.error('Add record error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to add vitals' })
    };
  }
};

// Get user's health records
exports.getMy = async (event) => {
  try {
    const userId = event.requestContext.authorizer.userId;

    const records = await recordService.getRecordsByUserId(userId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(records)
    };
  } catch (error) {
    console.error('Get records error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch records' })
    };
  }
};