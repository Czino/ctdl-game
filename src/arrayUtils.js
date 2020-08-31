/**
 * @description Method to flatten array by 1 level
 * Usage: arr.reduce(flatten, [])
 * @param {*[]} arr the array to be flattened
 * @param {*} item current item in array
 * @returns {*[]} flattened array
 */
export const flatten = (arr, item) => {
    if (Array.isArray(item)) {
        arr = arr.concat(item)
    } else {
        arr.push(item)
    }
    return arr
}