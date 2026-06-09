import { db } from "../firebase.js";
import { doc, setDoc } from "firebase/firestore";

const sortDigitsCustom = (number) => {
  const order = {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    0: 10,
  };

  return Number(
    number
      .toString()
      .split("")
      .sort((a, b) => order[a] - order[b])
      .join("")
  );
};

const calculateSum = (number) => {
  const digitSum = number
    .toString()
    .split("")
    .reduce((sum, digit) => sum + Number(digit), 0);

  return digitSum % 10;
};

const randomEntry = () => {
  const rawNumber = Math.floor(100 + Math.random() * 900);

  const number = sortDigitsCustom(rawNumber);

  return {
    number,
    sum: calculateSum(number),
  };
};

const seedData = async () => {
  const today = new Date();

  const startDate = new Date(
    today.getFullYear() - 1,
    0,
    1
  ); // 1 Jan last year

  let currentDate = new Date(today);

  while (currentDate >= startDate) {
    const date = currentDate.toISOString().split("T")[0];

    const values = Array.from(
      { length: 8 },
      () => randomEntry()
    );

    await setDoc(doc(db, "results", date), {
      values,
    });

    console.log("Inserted:", date);

    currentDate.setDate(
      currentDate.getDate() - 1
    );
  }

  console.log("🔥 Seeding completed!");
};

seedData();