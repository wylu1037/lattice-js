import * as protobuf from "protobufjs";

/**
 * Get the first(main) protobuf message type from a proto content string.
 * @param protoContent - The proto content string.
 * @returns The protobuf message type.
 */
async function getMessageProtoType(
  protoContent: string
): Promise<protobuf.Type> {
  const parseResult = await protobuf.parse(protoContent);
  const root = parseResult.root;
  if (!root) {
    throw new Error("No root object found in the proto file");
  }
  if (!root.nested) {
    throw new Error("No nested objects found in the proto file");
  }

  const firstMessageName = Object.values(root.nested).find(
    (nested) => nested instanceof protobuf.Type
  )?.name;

  if (!firstMessageName) {
    throw new Error("No message found in the proto file");
  }

  return parseResult.root.lookupType(firstMessageName);
}

/**
 * Serialize a message to a protobuf message.
 * @param messageTypeOrProtoContent - The protobuf message type or the proto content string.
 * @param json - The json string to serialize.
 * @returns The serialized message.
 */
async function serializeMessage(
  messageTypeOrProtoContent: protobuf.Type | string,
  json: string
): Promise<Uint8Array> {
  const messageType =
    typeof messageTypeOrProtoContent === "string"
      ? await getMessageProtoType(messageTypeOrProtoContent)
      : messageTypeOrProtoContent;

  const obj = JSON.parse(json);
  const message = messageType.fromObject(obj);
  return messageType.encode(message).finish();
}

/**
 * Deserialize a protobuf message to a json string.
 * @param messageTypeOrProtoContent - The protobuf message type or the proto content string.
 * @param data - The serialized message.
 * @returns The json string.
 */
async function deserializeMessage(
  messageTypeOrProtoContent: protobuf.Type | string,
  data: Uint8Array
): Promise<string> {
  const messageType =
    typeof messageTypeOrProtoContent === "string"
      ? await getMessageProtoType(messageTypeOrProtoContent)
      : messageTypeOrProtoContent;

  const message = messageType.decode(data);
  /**
    const obj = messageType.toObject(message, {
      longs: String,
      enums: String,
      bytes: String
    });
   */
  const obj = messageType.toObject(message, { defaults: false });
  return JSON.stringify(obj);
}

export { getMessageProtoType, serializeMessage, deserializeMessage };