import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, where, orderBy, limit, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { getDate } from "../utils/formatDate";

export const fetchToday = async () => {
  const date = getDate();
  const docRef = doc(db, "results", date);
  const snap = await getDoc(docRef);

  return snap.exists()
    ? [
        {
          date,
          values: snap.data()?.values ?? []
        }
      ]
    : [];
};

export const fetchLastNDays = async (n) => {
  const today = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const map = {};

  const q = query(
    collection(db, "results"),
    where("__name__", "<=", getDate()),
    orderBy("__name__", "desc"),
    limit(n)
  );

  const snap = await getDocs(q);

  snap.forEach((doc) => {
    map[doc.id] = doc.data()?.values ?? [];
  });

  const data = [];

  for (let i = 1; i <= n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    const date = `${year}-${month}-${day}`;

    data.push({
      date,
      values: map[date] ?? []
    });
  }

  return data;
};

export const fetchMonthData = async (year, month) => {
  console.log("Fetching data for:", year, month);

  const paddedMonth = String(month).padStart(2, "0");

  const start = `${year}-${paddedMonth}-01`;

  // current date (IST-safe via your existing logic)
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
  const currentDay = String(now.getDate()).padStart(2, "0");

  let end;
  let lastDay;

  // if requesting current month
  if (String(year) === String(currentYear) && paddedMonth === currentMonth) {
    end = `${year}-${paddedMonth}-${currentDay}`;
    lastDay = Number(currentDay);
  } else {
    lastDay = new Date(year, month, 0).getDate();
    end = `${year}-${paddedMonth}-${String(lastDay).padStart(2, "0")}`;
  }

  const q = query(
    collection(db, "results"),
    where("__name__", ">=", start),
    where("__name__", "<=", end),
    orderBy("__name__", "desc")
  );

  const snap = await getDocs(q);

  const map = {};

  snap.forEach((doc) => {
    map[doc.id] = doc.data()?.values ?? [];
  });

  const data = [];

  for (let d = lastDay; d >= 1; d--) {
    const date = `${year}-${paddedMonth}-${String(d).padStart(2, "0")}`;

    data.push({
      date,
      values: map[date] ?? []
    });
  }

  return data;
};

export const fetchYearMonthIndex = async () => {
  const snap = await getDocs(collection(db, "results"));

  const map = {};

  snap.forEach((doc) => {
    const [year, month] = doc.id.split("-");

    if (!map[year]) map[year] = new Set();

    map[year].add(Number(month));
  });

  // 🔥 convert to sorted ARRAY (NOT object)
  const result = Object.keys(map)
    .map((year) => ({
      year: Number(year),
      months: Array.from(map[year])
        .sort((a, b) => b - a)
        .map((m) => String(m).padStart(2, "0"))
    }))
    .sort((a, b) => b.year - a.year); // 🔥 YEARS DESC HERE

  console.log("Year-Month Index:", result);

  return result;
};

export const deleteYearData = async (year) => {
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;

  const q = query(
    collection(db, "results"),
    where("__name__", ">=", start),
    where("__name__", "<=", end)
  );

  const snap = await getDocs(q);

  const batch = writeBatch(db);

  snap.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  await batch.commit();

  console.log(`🗑 Deleted result data for year ${year}`);

  // Delete month caches
  for (let month = 1; month <= 12; month++) {
    const paddedMonth = String(month).padStart(2, "0");

    try {
      await deleteDoc(
        doc(db, "cache", `month-${year}-${paddedMonth}`)
      );

      console.log(
        `🗑 Deleted cache month-${year}-${paddedMonth}`
      );
    } catch (err) {
      console.error(
        `Failed deleting month-${year}-${paddedMonth}`,
        err
      );
    }
  }

  console.log(`✅ Cleanup complete for year ${year}`);
};

export const rebuildHomepageCache = async () => {
  console.log("🔄 Rebuilding homepage cache...");

  const today = await fetchToday();
  const last5 = await fetchLastNDays(5);
  const yearMonthIndex = await fetchYearMonthIndex();

  await setDoc(doc(db, "cache", "homepage"), {
    today,
    last5,
    yearMonthIndex,
    updatedAt: new Date().toISOString(),
  });

  console.log("✅ Homepage cache updated");
};

export const fetchHomepageCache = async () => {
  console.log("📦 Reading homepage cache");

  const snap = await getDoc(
    doc(db, "cache", "homepage")
  );

  if (!snap.exists()) {
    console.log("❌ Cache not found");
    return null;
  }

  console.log("✅ Cache loaded");

  return snap.data();
};

export const rebuildMonthCache = async (year, month) => {
  console.log(`🔄 Rebuilding cache for ${year}-${month}`);

  const data = await fetchMonthData(year, month);

  await setDoc(
    doc(db, "cache", `month-${year}-${month}`),
    {
      data,
      updatedAt: Date.now(),
    }
  );

  console.log(`✅ Cache updated for ${year}-${month}`);
};

export const fetchMonthCache = async (year, month) => {
  console.log(`📦 Reading cache for ${year}-${month}`);

  const snap = await getDoc(
    doc(db, "cache", `month-${year}-${month}`)
  );

  if (!snap.exists()) {
    console.log(`❌ Cache missing for ${year}-${month}`);
    return null;
  }

  console.log(`✅ Cache found for ${year}-${month}`);

  return snap.data().data || [];
};

export const rebuildYearMonthIndexCache = async () => {
  console.log("🔄 Rebuilding Year-Month Index Cache...");

  const snap = await getDocs(collection(db, "results"));

  const map = {};

  snap.forEach((doc) => {
    const [year, month] = doc.id.split("-");

    if (!map[year]) {
      map[year] = new Set();
    }

    map[year].add(Number(month));
  });

  const result = Object.keys(map)
    .map((year) => ({
      year: Number(year),
      months: Array.from(map[year])
        .sort((a, b) => b - a)
        .map((m) => String(m).padStart(2, "0")),
    }))
    .sort((a, b) => b.year - a.year);

  await setDoc(
    doc(db, "cache", "yearMonthIndex"),
    {
      data: result,
      updatedAt: Date.now(),
    }
  );

  console.log("✅ Year-Month Index Cache Updated");

  return result;
};

export const fetchYearMonthIndexCache = async () => {
  const cacheRef = doc(db, "cache", "yearMonthIndex");

  const cacheSnap = await getDoc(cacheRef);

  if (cacheSnap.exists()) {
    return cacheSnap.data().data || [];
  }
};