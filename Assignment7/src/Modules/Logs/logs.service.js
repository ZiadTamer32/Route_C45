import { db } from "../../DB/connection.js";
import { logsCollection } from "../../DB/Models/logsModel.js";

export const createCappedCollection = async () => {
  const result = await db.createCollection("logs", {
    capped: true,
    size: 1048576, // 1MB
  });
  return result;
};

export const createLog = async (bodyData) => {
  const newLog = await logsCollection.insertOne(bodyData);
  return newLog;
};

export const lookupLogs = async () => {
  const specificsLogs = await logsCollection
    .aggregate([
      {
        $lookup: {
          from: "books",
          localField: "book_id",
          foreignField: "_id",
          as: "bookData",
        },
      },
    ])
    .toArray();
  return specificsLogs;
};
