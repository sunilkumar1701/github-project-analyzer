const getMonthLabel = (date) => {
  if (!(date instanceof Date) || isNaN(date)) {
    return "";
  }

  const month = date.toLocaleString("default", {
    month: "short",
  });

  const year = String(date.getFullYear()).slice(-2);

  return `${month} ${year}`;
};

module.exports = {
  getMonthLabel,
};
