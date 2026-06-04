const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const { randomUUID } = require("crypto");

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const TABLE_NAME = process.env.TABLE_NAME || "Todos";

exports.handler = async (event) => {
  try {
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    const { title } = body;
    if (!title || typeof title !== "string" || title.trim() === "") {
      return errorResponse(400, "Title is required");
    }

    const todo = {
      id: randomUUID(),
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    await client.send(
      new PutItemCommand({
        TableName: TABLE_NAME,
        Item: marshall(todo),
      })
    );

    return {
      statusCode: 201,
      headers: corsHeaders(),
      body: JSON.stringify({ todo }),
    };
  } catch (err) {
    console.error("createTodo error:", err);
    return errorResponse(500, "Failed to create todo");
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