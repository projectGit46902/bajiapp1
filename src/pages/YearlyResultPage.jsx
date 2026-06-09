import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Header from "../components/Header";
import { numberToMonth } from "../utils/numberToMonthMapper";

const YearlyResultPage = () => {
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            try {
                const snap = await getDoc(
                    doc(db, "cache", "yearMonthIndex")
                );

                if (snap.exists()) {
                    setData(snap.data().data || []);
                } else {
                    setData([]);
                }
            } catch (err) {
                console.error("Error loading yearly data:", err);
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

            {loading ? (
                <div className="container text-center py-5">
                    <div className="spinner-border" role="status"></div>
                    <div className="mt-2">Loading yearly data...</div>
                </div>
            ) : data.length > 0 ? (
                data.map((yearObj) => (
                    <div key={yearObj.year} className="mt-4">
                        <h4>{yearObj.year}</h4>

                        <div className="row g-2 justify-content-center">
                            {yearObj.months.map((month) => (
                                <div
                                    key={month}
                                    className="col-4 col-md-2"
                                >
                                    <button
                                        className="btn btn-info w-100"
                                        onClick={() =>
                                            navigate(
                                                `/${yearObj.year}/${month}`
                                            )
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
            )}
        </div>
    );
};

export default YearlyResultPage;