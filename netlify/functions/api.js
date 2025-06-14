const { createServer } = require('http');
const { parse } = require('url');

// Import the built server
const app = require('../../dist/index.js');

const server = createServer(app);

exports.handler = async (event, context) => {
  return new Promise((resolve, reject) => {
    const { path, httpMethod, headers, body, queryStringParameters } = event;
    
    // Create a mock request object
    const req = {
      method: httpMethod,
      url: path + (queryStringParameters ? '?' + new URLSearchParams(queryStringParameters).toString() : ''),
      headers: headers || {},
      body: body || '',
      on: () => {},
      pipe: () => {},
    };

    // Create a mock response object
    const res = {
      statusCode: 200,
      headers: {},
      body: '',
      writeHead: function(status, headers) {
        this.statusCode = status;
        if (headers) {
          Object.assign(this.headers, headers);
        }
      },
      setHeader: function(name, value) {
        this.headers[name] = value;
      },
      write: function(chunk) {
        this.body += chunk;
      },
      end: function(chunk) {
        if (chunk) this.body += chunk;
        resolve({
          statusCode: this.statusCode,
          headers: this.headers,
          body: this.body,
        });
      },
      json: function(data) {
        this.setHeader('Content-Type', 'application/json');
        this.end(JSON.stringify(data));
      }
    };

    try {
      app(req, res);
    } catch (error) {
      reject(error);
    }
  });
};