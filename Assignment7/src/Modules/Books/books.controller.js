import { Router } from "express";
import {
  createBook,
  createManyBooks,
  deletebyYearBooks,
  getAfter2000Books,
  getAfter2000BooksProjection,
  getBraveNewWorldBook,
  getFromToBooks,
  getIntegerYearsBooks,
  getNotIncludeHorrorBooks,
  getScienceFictionBooks,
  getSkipLimitSortBooks,
  unwindBooks,
  updateBook,
} from "./books.service.js";

const booksRouter = Router();

booksRouter.post("/create-emplicity", async (req, res) => {
  const result = await createBook(req.body);
  return res.status(201).json({ result });
});

booksRouter.post("/index", async (req, res) => {
  const result = await createBook(req.body);
  return res.status(201).json({ result });
});

booksRouter.post("/", async (req, res) => {
  const result = await createBook(req.body);
  return res.status(201).json({ result });
});
booksRouter.post("/batch", async (req, res) => {
  const result = await createManyBooks(req.body);
  return res.status(201).json({ result });
});
booksRouter.patch("/Future", async (req, res) => {
  const result = await updateBook();
  return res.status(201).json({ result });
});
booksRouter.get("/title", async (req, res) => {
  const result = await getBraveNewWorldBook(req.query);
  return res.status(200).json({ result });
});
booksRouter.get("/year", async (req, res) => {
  const result = await getFromToBooks(req.query);
  return res.status(200).json({ result });
});
booksRouter.get("/genre", async (req, res) => {
  const result = await getScienceFictionBooks(req.query);
  return res.status(200).json({ result });
});
booksRouter.get("/skip-limit", async (req, res) => {
  const result = await getSkipLimitSortBooks();
  return res.status(200).json({ numOfResult: result.length, result });
});
booksRouter.get("/year-integer", async (req, res) => {
  const result = await getIntegerYearsBooks();
  return res.status(200).json({ numOfResult: result.length, result });
});
booksRouter.get("/exclude-genres", async (req, res) => {
  const result = await getNotIncludeHorrorBooks();
  return res.status(200).json({ numOfResult: result.length, result });
});
booksRouter.delete("/before-year", async (req, res) => {
  const result = await deletebyYearBooks(req.query);
  return res.status(200).json({ result });
});
booksRouter.get("/aggregate1", async (req, res) => {
  const result = await getAfter2000Books();
  return res.status(200).json({ numOfResult: result.length, result });
});
booksRouter.get("/aggregate2", async (req, res) => {
  const result = await getAfter2000BooksProjection();
  return res.status(200).json({ numOfResult: result.length, result });
});
booksRouter.get("/aggregate3", async (req, res) => {
  const result = await unwindBooks();
  return res.status(200).json({ numOfResult: result.length, result });
});

export default booksRouter;
