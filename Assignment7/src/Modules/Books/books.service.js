import { booksModel } from "../../DB/Models/booksModel.js";

export const createBook = async (bodyData) => {
  const newBook = await booksModel.insertOne(bodyData);
  return newBook;
};
export const createManyBooks = async (bodyData) => {
  const newBooks = await booksModel.insertMany(bodyData);
  return newBooks;
};
export const updateBook = async () => {
  const updateBook = await booksModel.updateOne(
    { title: "Future" },
    { $set: { year: 2022 } },
  );
  return updateBook;
};
export const getBraveNewWorldBook = async (query) => {
  const { title } = query;
  const specificBook = await booksModel.findOne({ title });
  return specificBook;
};
export const getFromToBooks = async (query) => {
  const { from, to } = query;
  const specificBook = await booksModel
    .find({ year: { $gte: +from, $lte: +to } })
    .toArray();
  return specificBook;
};
export const getScienceFictionBooks = async (query) => {
  const { genre } = query;
  const specificBook = await booksModel
    .find({ genres: { $in: [genre] } })
    .toArray();
  return specificBook;
};
export const getSkipLimitSortBooks = async () => {
  const specificBook = await booksModel
    .aggregate([{ $skip: 2 }, { $limit: 3 }, { $sort: { year: -1 } }])
    .toArray();
  return specificBook;
};
export const getIntegerYearsBooks = async () => {
  const specificBook = await booksModel
    .aggregate([
      {
        $match: {
          year: { $type: "int" },
        },
      },
    ])
    .toArray();
  return specificBook;
};
export const getNotIncludeHorrorBooks = async () => {
  const specificBook = await booksModel
    .find({ genres: { $nin: ["Horror"] } })
    .toArray();
  return specificBook;
};
export const deletebyYearBooks = async (query) => {
  const { year } = query;
  const specificBook = await booksModel.deleteMany({ year: { $lt: +year } });
  return specificBook;
};
export const getAfter2000Books = async () => {
  const specificBook = await booksModel
    .aggregate([
      {
        $match: { year: { $gte: 2000 } },
      },
      { $sort: { year: -1 } },
    ])
    .toArray();
  return specificBook;
};
export const getAfter2000BooksProjection = async () => {
  const specificBook = await booksModel
    .aggregate([
      {
        $project: {
          title: 1,
          author: 1,
          year: 1,
          _id: 0,
        },
      },
      { $match: { year: { $gte: 2000 } } },
    ])
    .toArray();
  return specificBook;
};
export const unwindBooks = async () => {
  const specificBook = await booksModel
    .aggregate([{ $unwind: "$genres" }])
    .toArray();
  return specificBook;
};
