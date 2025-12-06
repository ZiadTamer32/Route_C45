const path = require("node:path");
const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const EventEmitter = require("node:events");
const os = require("node:os");

// 1) Write a function that logs the current file path and directory.
console.log("File path:", __filename);
console.log("Directory:", __dirname);

// 2) Write a function that takes a file path and returns its file name.
const fileName = (filePath) => path.basename(filePath);
console.log(fileName(__filename));

// 3) Write a function that builds a path from an object.
const pathFromObj = (obj) => path.format(obj);
console.log(pathFromObj({ dir: "/folder", name: "app", ext: ".js" }));

// 4) Write a function that returns the file extension from a given file path.
const fileExtension = (filePath) => path.extname(filePath);
console.log(fileExtension(__filename));

// 5) Write a function that parses a given path and returns its name and ext.
const fileParse = (filePath) => path.parse(filePath);
console.log(fileParse(__filename));

// 6) Write a function that checks whether a given path is absolute.
const isAbsolutePath = (filePath) => path.isAbsolute(filePath);
console.log(isAbsolutePath(__filename));

// 7) Write a function that joins multiple segments
const fileJoin = (...segments) => path.join(...segments);
console.log(fileJoin("folder", "app", "index.js"));

// 8) Write a function that resolves a relative path to an absolute one.
const fileResolve = (filePath) => path.resolve(filePath);
console.log(fileResolve("folder/app/index.js"));

// 9) Write a function that joins two paths.
const fileJoin2 = (path1, path2) => path.join(path1, path2);
console.log(fileJoin2("/folder1", "folder2/file.txt"));

// 10) Write a function that deletes a file asynchronously.
const fileDelete = async (filePath) => {
  try {
    await fsPromises.unlink(filePath);
  } catch (error) {
    console.error(error);
  }
};
fileDelete("data.txt");

// 11) Write a function that creates a folder synchronously.
const folderCreate = (folderPath) => {
  try {
    const data = fs.mkdirSync(folderPath);
    console.log("Folder created:", folderPath);
  } catch (err) {
    console.error("Error creating folder:", err);
  }
};
// folderCreate("src");

// 12) Create an event emitter that listens for a "start" event and logs a welcome message.
const emitter = new EventEmitter();
emitter.on("start", () => {
  console.log("Welcome to the event emitter!");
});
emitter.emit("start");

// 13) Emit a custom "login" event with a username parameter.
emitter.on("login", (username) => {
  console.log(`User logged in: ${username}`);
});
emitter.emit("login", "Ziad");

// 14) Read a file synchronously and log its contents.
const fileRead = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, { encoding: "utf-8" });
    console.log(data);
  } catch (err) {
    console.error("Error reading file:", err);
  }
};
fileRead("test.txt");

// 15) Write asynchronously to a file.
const fileWrite = async (filePath, data) => {
  try {
    await fsPromises.writeFile(filePath, data);
  } catch (err) {
    console.error("Error writing file:", err);
  }
};
// fileWrite("data.txt", "Hello, world!");

// 16) Check if a directory exists.
console.log(fs.existsSync("./test.txt"));

// 17) Write a function that returns the OS platform and CPU architecture.
console.log({ platform: os.platform(), Arch: os.arch() });
