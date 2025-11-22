// Lambda function for authentication endpoints
const UserService = require('../services/UserService');
const jwt = require('jsonwebtoken');

const userService = new UserService();

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json'
};

// User Registration
exports.register = async (event) => {
  try {
    const { name, email, password, role, specialty } = JSON.parse(event.body);

    if (!name || !email || !password || !role) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const user = await userService.createUser({
      name, email, password, role, specialty
    });

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ 
        message: 'User created successfully',
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      })
    };
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.message === 'Email already exists') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email already used. Please use a different email.' })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Registration failed due to server error' })
    };
  }
};

// User Login
exports.login = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and password are required' })
      };
    }

    const user = await userService.validatePassword(email, password);
    
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token,
        role: user.role,
        name: user.name,
        specialty: user.specialty || null
      })
    };
  } catch (error) {
    console.error('Login error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Login failed due to server error' })
    };
  }
};