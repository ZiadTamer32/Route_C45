const path = require("node:path");
const fs = require("node:fs");
const http = require("node:http");
const { createGzip } = require("node:zlib");

// 1) Use a readable stream to read a file in chunks and log each chunk.
const bigPath = path.resolve("./big.txt");

const readableBigStream = fs.createReadStream(bigPath, { encoding: "utf-8" });

readableBigStream.on("data", (chunk) => {
  console.log("New chunk received:");
  console.log(chunk);
});

readableBigStream.on("end", () => {
  console.log("Finished reading file.");
});

readableBigStream.on("error", (err) => {
  console.log(err);
});

// 2) Use readable and writable streams to copy content from one file to another.

const sourcePath = path.resolve("./source.txt");
const destPath = path.resolve("./dest.txt");

const readableSourceStream = fs.createReadStream(sourcePath, {
  encoding: "utf-8",
});
const writableDestStream = fs.createWriteStream(destPath);

readableSourceStream.on("data", (chunk) => {
  writableDestStream.write(chunk);
});

readableSourceStream.on("end", () => {
  writableDestStream.end();
  console.log("File copy completed.");
});

readableSourceStream.on("error", (err) => {
  console.log(err);
});

writableDestStream.on("error", (err) => {
  console.log(err);
});

// 3) Create a pipeline that reads a file, compresses it, and writes it to another file.

const dataPath = path.resolve("./data.txt");

const readableDataStream = fs.createReadStream(dataPath, { encoding: "utf-8" });
const writableDataCompressedStream = fs.createWriteStream("./data.txt.gz");
const gzip = createGzip();

readableDataStream.pipe(gzip).pipe(writableDataCompressedStream);

writableDataCompressedStream.on("finish", () => {
  console.log("File compression completed.");
});

writableDataCompressedStream.on("error", (err) => {
  console.log(err);
});

// ========================================================================================================
// Part2: Simple CRUD Operations Using HTTP
const PORT = 3000;

const usersPath = path.resolve("./users.json");

const users = JSON.parse(fs.readFileSync(usersPath, { encoding: "utf-8" }));

const server = http.createServer((req, res) => {
  const { url, method } = req;
  if (url === "/create-user" && method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      const userData = JSON.parse(body);
      const user = users.find((value) => value.email === userData.email);
      if (user) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.write(JSON.stringify({ message: "User already exists" }));
        return res.end();
      }
      users.push(userData);
      fs.writeFileSync(usersPath, JSON.stringify(users), { encoding: "utf-8" });
      res.writeHead(201, { "Content-Type": "application/json" });
      res.write(JSON.stringify({ message: "User created successfully" }));
      return res.end();
    });
  } else if (url.startsWith("/update-user") && method === "PATCH") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      // /update-user/id
      const id = +url.split("/")[2];
      const { name, age, email } = JSON.parse(body);
      const isUserExist = users.find((value) => value.id === id);
      if (!isUserExist) {
        res.writeHead(400, { "content-type": "application/json" });
        res.write(JSON.stringify({ message: "User Id Not Found" }));
        return res.end();
      }
      name && (isUserExist.name = name);
      age && (isUserExist.age = age);
      email && (isUserExist.email = email);
      fs.writeFileSync(usersPath, JSON.stringify(users), { encoding: "utf-8" });
      res.writeHead(200, { "content-type": "application/json" });
      res.write(JSON.stringify({ message: "User Updated Successfully" }));
      return res.end();
    });
  } else if (url.startsWith("/delete-user") && method === "DELETE") {
    // /delete-user/id
    const id = +url.split("/")[2];
    const userIndex = users.findIndex((value) => value.id === id);
    if (userIndex === -1) {
      res.writeHead(400, { "content-type": "application/json" });
      res.write(JSON.stringify({ message: "User Id Not Found" }));
      return res.end();
    }
    users.splice(userIndex, 1);
    fs.writeFileSync(usersPath, JSON.stringify(users), { encoding: "utf-8" });
    res.writeHead(200, { "content-type": "aplication/json" });
    res.write(JSON.stringify({ message: "User Deleted Successfully" }));
    return res.end();
  } else if (url === "/get-all-users" && method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(users));
    return res.end();
  } else if (url.startsWith("/get-user") && method === "GET") {
    // /get-user/id
    const id = +url.split("/")[2];
    const user = users.find((value) => value.id === id);
    if (!user) {
      res.writeHead(400, { "content-type": "application/json" });
      res.write(JSON.stringify({ message: "User Id Not Found" }));
      return res.end();
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.write(JSON.stringify(user));
    return res.end();
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.write("Not Found");
    return res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Server is running at port :: ${PORT}`);
});
server.on("error", (err) => {
  console.log(err);
});

// ========================================================================================================
// Part3: Node Internals

// 1. What is the Node.js Event Loop?
// It is a mechanism that allows Node.js to handle asynchronous operations without blocking the main thread.

// 2. What is Libuv and What Role Does It Play in Node.js?
// Libuv is a C library that provides the event loop and handles asynchronous I/O and the thread pool.

// 3. How Does Node.js Handle Asynchronous Operations Under the Hood?
// Node.js delegates async tasks to Libuv or the OS, and once completed, callbacks are pushed to the event loop.

// 4. What is the Difference Between the Call Stack, Event Queue, and Event Loop in Node.js?
// Call Stack: Executes current code, Event Queue: Holds ready callbacks, Event Loop: Moves callbacks to the stack when it is empty

// 5. What is the Node.js Thread Pool and How to Set the Thread Pool Size?
// It is a pool of worker threads used for heavy tasks, and the size can be set using the UV_THREADPOOL_SIZE environment variable.

// 6. How Does Node.js Handle Blocking and Non-Blocking Code Execution?
// Blocking code stops the event loop, while non-blocking code allows other operations to continue executing.
