import { db } from "../firebase.js";
import { doc, setDoc } from "firebase/firestore";

// random generator for testing
const randomEntry = () => ({
  number: Math.floor(100 + Math.random() * 900),
  sum: Math.floor(Math.random() * 10)
});

const generateYearData = (year) => {
  const data = [];

  for (let month = 1; month <= 12; month++) {
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      const values = Array.from({ length: 8 }, () => randomEntry());

      data.push({ date, values });
    }
  }

  return data;
};

const seedData = async () => {
  const years = [2024, 2025, 2026]; // 👉 3 years

  for (const year of years) {
    const yearData = generateYearData(year);

    for (const item of yearData) {
      await setDoc(doc(db, "results", item.date), {
        values: item.values
      });

      console.log("Inserted:", item.date);
    }
  }

  console.log("🔥 Seeding completed!");
};

seedData();