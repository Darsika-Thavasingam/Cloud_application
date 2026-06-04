const { DynamoDBClient, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const TABLE_NAME = process.env.TABLE_NAME || "Todos";

exports.handler = async (event) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return errorResponse(400, "Missing path parameter: id");
    }

    await client.send(
      new DeleteItemCommand({
        TableName: TABLE_NAME,
        Key: marshall({ id }),
      })
    );

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ message: "Todo deleted successfully", id }),
    };
  } catch (err) {
    console.error("deleteTodo error:", err);
    return errorResponse(500, "Failed to delete todo");
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