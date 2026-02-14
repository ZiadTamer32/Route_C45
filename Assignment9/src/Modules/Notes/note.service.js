import mongoose from "mongoose";
import noteModel from "../../DB/Models/noteModel.js";
import userModel from "../../DB/Models/userModel.js";

export async function createNote(userId, bodyData) {
  const existingUser = await userModel.findOne({ _id: userId });

  if (!existingUser) {
    throw new Error("User not found.", { cause: { statusCode: 404 } });
  }

  const newNote = await noteModel.create({
    ...bodyData,
    userId: existingUser._id,
  });

  return newNote;
}
export async function updateNote(userId, params, bodyData) {
  const { noteId } = params;
  const note = await noteModel.findOne({ _id: noteId });
  if (!note) {
    throw new Error("Note not found.", { cause: { statusCode: 404 } });
  }

  if (note.userId.toString() !== userId) {
    throw new Error("You are not the owner.", { cause: { statusCode: 401 } });
  }

  await noteModel.updateOne({ _id: noteId }, { $set: bodyData });

  const updatedNote = await noteModel.findOne({ _id: noteId });

  return updatedNote;
}
export async function replaceNote(userId, params, bodyData) {
  const { noteId } = params;

  const note = await noteModel.findOne({ _id: noteId });
  if (!note) {
    throw new Error("Note not found.", { cause: { statusCode: 404 } });
  }

  if (note.userId.toString() !== userId) {
    throw new Error("You are not the owner.", { cause: { statusCode: 401 } });
  }

  const newNoteData = { ...bodyData, userId };

  await noteModel.replaceOne({ _id: noteId }, newNoteData);

  const updatedNote = await noteModel.findOne({ _id: noteId });
  return updatedNote;
}

export async function updateAllTitle(userId, bodyData) {
  const { title } = bodyData;

  if (!title) {
    throw new Error("Title is required.", { cause: { statusCode: 400 } });
  }

  const titleUpdated = await noteModel.updateMany(
    { userId },
    { $set: { title } },
  );
  return titleUpdated;
}

export async function getNotes(userId, queries) {
  let { page = 1, limit = 5 } = queries;

  page = Number(page);
  limit = Number(limit);

  const skip = (page - 1) * limit;

  const id = new mongoose.Types.ObjectId(userId);

  const notes = await noteModel.aggregate([
    {
      $match: { userId: id },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]);

  return notes;
}
export async function getSpecificId(userId, noteId) {
  const note = await noteModel.findById(noteId);

  if (note.userId.toString() !== userId) {
    throw new Error("You are not the owner.", { cause: { statusCode: 401 } });
  }

  if (!note) {
    throw new Error("Note not found.", { cause: { statusCode: 404 } });
  }

  return note;
}

export async function getNotesByContent(userId, queries) {
  let { content } = queries;

  const id = new mongoose.Types.ObjectId(userId);

  const notes = await noteModel.aggregate([
    {
      $match: {
        content: { $regex: content, $options: "i" },
        userId: id,
      },
    },
  ]);

  return notes;
}

export async function getUserNotesWithUserInfo(userId) {
  const notes = await noteModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        title: 1,
        userId: 1,
        createdAt: 1,
        "user.email": 1,
      },
    },
  ]);

  return notes;
}

export async function getUserNotesByTitle(userId, queries) {
  const { title } = queries;
  const notes = await noteModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        title: { $regex: title, $options: "i" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        title: 1,
        userId: 1,
        createdAt: 1,
        "user.name": 1,
        "user.email": 1,
      },
    },
  ]);

  return notes;
}

export async function deleteNote(userId, noteId) {
  const note = await noteModel.findById(noteId);

  if (!note) {
    throw new Error("Note not found.", { cause: { statusCode: 404 } });
  }

  if (note.userId.toString() !== userId) {
    throw new Error("You are not the owner.", { cause: { statusCode: 401 } });
  }

  await noteModel.deleteOne({ _id: noteId });

  return note;
}

export async function deleteAllUserNotes(userId) {
  const result = await noteModel.deleteMany({
    userId: new mongoose.Types.ObjectId(userId),
  });

  return result;
}
