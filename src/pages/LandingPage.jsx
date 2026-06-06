import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import ResultItem from "../components/ResultItem";
import {
  fetchToday,
  fetchLastNDays,
  fetchYearMonthIndex,
} from "../utils/dbDataFetch";
import { useNavigate } from "react-router-dom";
import { numberToMonth } from "../utils/numberToMonthMapper";

const LandingPage = () => {
  const [todayData, setTodayData] = useState([]);
  const [lastResults, setLastResults] = useState([]);
  const [yearMonthIndex, setYearMonthIndex] = useState([]);

  const [todayLoading, setTodayLoading] = useState(true);
  const [lastLoading, setLastLoading] = useState(true);
  const [indexLoading, setIndexLoading] = useState(true);

  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  // TODAY
  useEffect(() => {
    const load = async () => {
      setTodayLoading(true);
      try {
        const res = await fetchToday();
        setTodayData(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setTodayLoading(false);
      }
    };
    load();
  }, []);

  // LAST 5
  useEffect(() => {
    const load = async () => {
      setLastLoading(true);
      try {
        const res = await fetchLastNDays(5);
        setLastResults(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLastLoading(false);
      }
    };
    load();
  }, []);

  // INDEX
  useEffect(() => {
    const load = async () => {
      setIndexLoading(true);
      try {
        const res = await fetchYearMonthIndex();
        setYearMonthIndex(res || []);
        localStorage.setItem("yearMonthIndex", JSON.stringify(res || []));
      } catch (err) {
        console.error(err);
      } finally {
        setIndexLoading(false);
      }
    };
    load();
  }, []);

  const currentYearData = yearMonthIndex.find(
    (item) => item.year === currentYear
  );

  const months = currentYearData?.months || [];

  return (
    <div className="container-fluid text-center mb-5">
      <Header />

      {/* TODAY */}
      <div className="row">
        <div className="col">
          <div className="row">
            <div className="col mt-3 mb-5">
              <span className=" border border-3 border-dark rounded-pill px-3 py-2">
                <span className="live-dot me-2"></span>
                <span className="h5">LIVE</span>
              </span>
            </div>
          </div>
          <h4>Today's Result</h4>
          <ResultItem data={todayData} loading={todayLoading} />
        </div>
      </div>

      {/* LAST */}
      <div className="row mt-4">
        <div className="col">
          <h4>Last 5 Results</h4>
          <ResultItem data={lastResults} loading={lastLoading} />
        </div>
      </div>

      {/* MONTHS */}
      <div className="row mt-4">
        <div className="col">
          <div className="d-flex justify-content-center align-items-center mb-3">
            <h4 className="m-0">All {currentYear} Results</h4>

            <button
              className="btn btn-info ms-3 rounded-pill"
              onClick={() => navigate("/year")}
            >
              View Yearly Results
            </button>
          </div>

          {indexLoading ? (
            <div>Loading months...</div>
          ) : (months.length> 0 ?(
            months.map((month) => (
              <div key={month} className="row mb-3">
                <div className="col">
                  <div className="container">
                    <div className="row">
                      <div className="col">
                        <div className="container">
                          <div className="col">
                            <div className="container">
                              <div className="row">
                                <button
                                  className="btn btn-info rounded-pill"
                                  onClick={() => navigate(`/${currentYear}/${month}`)}
                                >
                                  View {numberToMonth(month)} Results
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ):(
            <div className="container text-center py-5">
                <div className="mt-2">No Data Available</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;