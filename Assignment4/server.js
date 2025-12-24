const express = require("express");
const path = require("node:path");
const fs = require("node:fs");
const app = express();

// Port
const PORT = 3000;

// Read File
const filePath = path.resolve("./users.json");
const users = JSON.parse(fs.readFileSync(filePath, { encoding: "utf-8" }));

app.use(express.json());

// Add User Route
app.post("/add-user", (req, res) => {
  const { name, age, email } = req.body;
  const isUserExist = users.find((user) => user.email === email);
  if (isUserExist) {
    return res.status(409).json({ msg: "User Already Exist" });
  }
  const newId = users[users.length - 1].id + 1 || 1;
  users.push({ id: newId, ...req.body });
  fs.writeFileSync(filePath, JSON.stringify(users));
  return res.status(201).json({ msg: "User Added Successfully", data: users });
});
// Update User Route
app.patch("/update-user/:id", (req, res) => {
  const { id } = req.params;
  const { name, age, email } = req.body;
  const user = users.find((user) => user.id === +id);
  if (!user) {
    return res.status(404).json({ msg: "User Id Not Found" });
  }
  user.name = name || user.name;
  user.age = age || user.age;
  user.email = email || user.email;
  fs.writeFileSync(filePath, JSON.stringify(users));
  return res.status(200).json({ msg: "User Updated Successfully", data: user });
});
// Delete User Route
app.delete("/delete-user/:id", (req, res) => {
  const { id } = req.params;
  const userIndex = users.findIndex((user) => user.id === +id);
  if (userIndex === -1) {
    return res.status(404).json({ msg: "User Id Not Found" });
  }
  users.splice(userIndex, 1);
  fs.writeFileSync(filePath, JSON.stringify(users));
  return res.status(200).json({ msg: "User Deleted Successfully" });
});
// Get All Users Route
app.get("/users", (req, res) => {
  return res
    .status(200)
    .json({ msg: "Users Fetched Successfully", data: users });
});
// Get User By Id Route
app.get("/user/:id", (req, res) => {
  const { id } = req.params;
  const user = users.find((user) => user.id === +id);
  if (!user) {
    return res.status(404).json({ msg: "User Id Not Found" });
  }
  return res.status(200).json({ msg: "User Fetched Successfully", data: user });
});
// Get User By Name
app.get("/users/getByName", (req, res) => {
  const { name } = req.query;
  const userName = (string) => string.split(" ").join("").toLowerCase();
  const user = users.find((value) => userName(value.name) === userName(name));
  if (!user) {
    return res.status(404).json({ msg: "User Not Found" });
  }
  return res.status(200).json({ msg: "User Found Successfully", data: user });
});
// Get User By MinAge
app.get("/users/getByMinAge", (req, res) => {
  const { minAge } = req.query;
  const filteredUsers = users.filter((value) => value.age >= +minAge);
  if (filteredUsers.length === 0) {
    return res.status(404).json({ msg: "No User Found" });
  }
  return res.status(200).json({
    msg: "Users Found Successfully",
    count: filteredUsers.length,
    data: filteredUsers,
  });
});
// Error Route
app.all("{/*d}", (req, res) =>
  res.status(404).json({ msg: "Invaild Route or Method" })
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
