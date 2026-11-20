
const getCurrentDate = () => new Date();

const formatDate = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export { getCurrentDate, formatDate, addDays };
