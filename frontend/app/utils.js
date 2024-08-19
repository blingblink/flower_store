const generateRandomString = (numChars) => {
    return Math.random().toString(36).substring(2, numChars + 2);
};

const formatCurrency = (number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
}

export {
    generateRandomString,
    formatCurrency,
}