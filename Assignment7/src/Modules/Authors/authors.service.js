import { authorsCollection } from "../../DB/Models/authorsModel.js";

export const createImplicityAuthor = async () => {
  const newBook = await authorsCollection.insertOne({
    title: "Atomic Habits",
    author: "James Clear",
  });
  return newBook;
};
