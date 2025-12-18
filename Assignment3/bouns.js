/**
 * @param {number[]} nums
 * @return {number}
 */
var majorityElement = function (nums) {
  const findLargestNumber = Math.max(...nums);
  return findLargestNumber;
};
