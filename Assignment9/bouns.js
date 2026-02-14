/**
 * @param {string[]} strs
 * @return {string}
 */
var longestCommonPrefix = function (strs) {
  if (strs.length === 0) return "";
  let firstWord = strs[0];
  let commonPrefix = "";
  for (let i = 0; i < firstWord.length; i++) {
    let char = firstWord[i];
    for (let j = 1; j < strs.length; j++) {
      if (strs[j][i] !== char) {
        return commonPrefix;
      }
    }
    commonPrefix += char;
  }
  return commonPrefix;
};

console.log(longestCommonPrefix(["flower", "flow", "flight"]));
console.log(longestCommonPrefix(["dog", "racecar", "car"]));
