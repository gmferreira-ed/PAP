function tonumber(str) {
    return parseFloat(str.replace(/\D/g, '')); // Removes all non-digit characters
}

export {tonumber}