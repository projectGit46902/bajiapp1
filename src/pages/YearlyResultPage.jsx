import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { numberToMonth } from "../utils/numberToMonthMapper";

const YearlyResultPage = () => {
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = () => {
            setLoading(true);

            try {
                const stored = localStorage.getItem("yearMonthIndex");

                const parsed = stored ? JSON.parse(stored) : [];

                setData(Array.isArray(parsed) ? parsed : []);
            } catch (err) {
                console.error("Error reading yearly data:", err);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <div className="container-fluid text-center mb-5">
            <Header />

            <h3 className="mt-3">Yearly Results</h3>

            {/* LOADING */}
            {loading ? (
                <div className="container text-center py-5">
                    <div className="spinner-border" role="status"></div>
                    <div className="mt-2">Loading yearly data...</div>
                </div>
            ) : (data.length > 0 ? (
                data?.map((yearObj) => (
                    <div key={yearObj.year} className="mt-4">
                        <h4>{yearObj.year}</h4>

                        <div className="row g-2 justify-content-center">
                            {yearObj.months.map((month) => (
                                <div key={month} className="col-4 col-md-2">
                                    <button
                                        className="btn btn-info w-100"
                                        onClick={() =>
                                            navigate(`/${yearObj.year}/${month}`)
                                        }
                                    >
                                        {numberToMonth(month)}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="container text-center py-5">
                    <div className="mt-2">No Data Available</div>
                </div>
            ))}
        </div>
    );
};

export default YearlyResultPage;