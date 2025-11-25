const line = () =>
  console.log("==============================================");

// Assignment 1

// 1- Convert the string "123" to a number and add 7.
console.log("Answer 1 ");
const convertToNumber = (str) => +str + 7;
console.log(convertToNumber("123"));
line();

// 2- Check if the given variable is falsy and return "Invalid" if it is.
console.log("Answer 2 ");
const isFlasy = (value) => (!value ? "Invalid" : "Valid");
console.log(isFlasy(0));
line();

// 3- Print numbers from 1 to 10 skipping even numbers
console.log("Answer 3 ");
for (let i = 1; i <= 10; i++) {
  if (i % 2 === 0) continue;
  console.log(i);
}
line();

// 4- Filter even numbers
console.log("Answer 4 ");
const arr = [1, 2, 3, 4, 5];
arr.filter((num) => num % 2 === 0 && console.log(num));
line();

// 5- Merge arrays
console.log("Answer 5 ");
const mergeArrays = (arr1, arr2) => [...arr1, ...arr2];
console.log(mergeArrays([1, 2, 3], [4, 5, 6]));
line();

// 6- Switch day of week
console.log("Answer 6 ");
const getDayOfWeek = (num) => {
  switch (num) {
    case 1:
      return "Sunday";
    case 2:
      return "Monday";
    case 3:
      return "Tuesday";
    case 4:
      return "Wednesday";
    case 5:
      return "Thursday";
    case 6:
      return "Friday";
    case 7:
      return "Saturday";
    default:
      return "Invalid number";
  }
};
console.log(getDayOfWeek(2));
line();

// 7- Return lengths using map
console.log("Answer 7 ");
const arrOfStrings = ["1", "12", "123"].map((str) => str.length);
console.log(arrOfStrings);
line();

// 8- Check divisibility
console.log("Answer 8 ");
const isDivisible = (num) =>
  num % 3 === 0 && num % 5 === 0
    ? "Divisible by both"
    : "Not divisible by both";
console.log(isDivisible(15));
line();

// 9- Square of number
console.log("Answer 9 ");
const squareFun = (num) => num ** 2;
console.log(squareFun(5));
line();

// 10- Destructure + formatted string
console.log("Answer 10 :");
const formatObj = (obj) => {
  const { name, age } = obj;
  console.log(`${name} is ${age} years old`);
};
formatObj({ name: "John", age: 25 });
line();

// 11- Sum with rest parameters
console.log("Answer 11 :");
const summtionFunc = (...numbers) =>
  numbers.reduce((acc, curr) => acc + curr, 0);
console.log(summtionFunc(1, 2, 3, 4, 5));
line();

// 12- Promise resolves after 3 seconds
const promiseFunc = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      console.log("Answer 12 :");
      resolve("Success");
    }, 3000);
  });
promiseFunc().then((message) => {
  console.log(message);
  line();
});

// 13- Largest number
console.log("Answer 13 :");
const findLargestNumber = (arr) => Math.max(...arr);
console.log(findLargestNumber([1, 5, 3, 9, 2]));
line();

// 14- Get object keys
console.log("Answer 14 :");
const getKeysObj = (obj) => Object.keys(obj);
console.log(getKeysObj({ name: "John", age: 30 }));
line();

// 15- Split string by space
console.log("Answer 15 :");
const splitArr = (str) => str.split(" ");
console.log(splitArr("The quick brown fox"));
line();

// Essay Questions
// 1- What is the difference between forEach and for...of? When would you use each ?
//  forEach --> is a method built-in array that takes a callback function and runs it once for every element and returns undefined.
//  for...of --> is a loop that iterates over iterable objects like arrays, strings, maps, sets, etc.

// 2- What is hoisting and what is the Temporal Dead Zone (TDZ)? Explain with examples ?
//  Hoisting --> JavaScript moves declarations to the top of their scope before executing the code. (var and function declarations are hoisted).
//  TDZ --> is the time between entering a scope and the point where a variable is declared. (let and const are hoisted but not initialized).

// 3- What are the main differences between == and === ?
//  == --> compares values after type coercion.
//  === --> compares both value and type without type coercion.

// 4- Explain how try-catch works and why it is important in async operations ?
// try-catch --> is used to handle errors in JavaScript without crashing the entire program and make code more readable as a synchronous code.

// 5- What’s the difference between type conversion and coercion? Provide examples of each ?
//  Type conversion --> is the explicit conversion of one data type to another using functions like Number(), String(), etc.
//  Example : Number("5")
//  Coercion --> is the implicit conversion done by JavaScript automatically during operations.
//  Example : "5" * 2
