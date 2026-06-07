import { useEffect, useState } from "react";
import Header from "../components/Header";
import ResultItem from "../components/ResultItem";
import {
  fetchMonthCache,
  fetchMonthData,
  rebuildMonthCache,
} from "../utils/dbDataFetch";
import { useParams } from "react-router-dom";
import { numberToMonth } from "../utils/numberToMonthMapper";

const MonthlyResultPage = () => {
  const { year, month } = useParams();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        let result = await fetchMonthCache(year, month);

        if (!result) {
          console.log(
            `⚠️ Cache missing for ${year}-${month}. Building cache...`
          );

          result = await fetchMonthData(year, month);
        }

        console.log(
          `✅ Loaded month data from cache for ${year}-${month}`
        );

        if (Array.isArray(result)) {
          setData(result);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error("Error loading month cache:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [year, month]);

  return (
    <div className="container-fluid text-center mb-5">
      <Header />

      <div className="h4">
        {year} {numberToMonth(month)} Results
      </div>

      <ResultItem data={data} loading={loading} />
    </div>
  );
};

export default MonthlyResultPage;