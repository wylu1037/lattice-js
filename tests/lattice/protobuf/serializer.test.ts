import {
  deserializeMessage,
  serializeMessage
} from "@/lattice/protobuf/serializer";

describe("protobuf serializer", () => {
  const proto = `syntax = "proto3";

    message Message {
      string name = 1;
      int32 value = 2;
    }
  `;

  it("should marshal and unmarshal a message", async () => {
    const message = await serializeMessage(
      proto,
      `{
        "name": "Toaster",
        "value": 1
      }`
    );
    const unmarshaledMessage = await deserializeMessage(proto, message);
    expect(unmarshaledMessage).toEqual(
      JSON.stringify({
        name: "Toaster",
        value: 1
      })
    );
  });
});