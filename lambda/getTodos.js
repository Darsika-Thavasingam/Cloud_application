const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const TABLE_NAME = process.env.TABLE_NAME || "Todos";

exports.handler = async (event) => {
  try {
    const result = await client.send(
      new ScanCommand({ TableName: TABLE_NAME })
    );

    const todos = (result.Items || []).map(unmarshall);
    todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ todos }),
    };
  } catch (err) {
    console.error("getTodos error:", err);
    return errorResponse(500, "Failed to fetch todos");
  }
};

function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function errorResponse(statusCode, message) {
  return {
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify({ error: message }),
  };
}