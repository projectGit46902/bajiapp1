export const formatDate = (dbDate) => {
  if (!dbDate) return "";

  const [year, month, day] = dbDate.split("-");

  return `${day}-${month}-${year}`;
};

export const getDate = (inputDate) => {
  const now = inputDate
    ? new Date(inputDate)
    : new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
