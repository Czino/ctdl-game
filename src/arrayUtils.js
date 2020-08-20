export const flatten = (arr, item) => {
    if (Array.isArray(item)) {
        arr = arr.concat(item)
    } else {
        arr.push(item)
    }
    return arr
}