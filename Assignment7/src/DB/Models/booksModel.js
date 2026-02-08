import { db } from "../connection.js";

await db.createCollection("books", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title"],
      properties: {
        title: {
          bsonType: "string",
          minLength: 1,
        },
      },
    },
  },
});

export const booksModel = db.collection("books");

// index belongs to the collection
await booksModel.createIndex({ title: 1 });
