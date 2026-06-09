import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { formatDate, getDate } from "../utils/formatDate";
import Header from "../components/Header";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import { deleteYearData, fetchToday, fetchYearMonthIndex, rebuildHomepageCache, rebuildMonthCache } from "../utils/dbDataFetch";
import AdminResultItem from "../components/AdminResultItem";


async function canAddResultToday(date) {
    const docRef = doc(db, "results", date);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return true;

    const existing = snap.data().values || [];
    return existing.length < 8;


}

function cleanupOldYearIfNeeded(currentYear) {
    try {
        const index = JSON.parse(
            localStorage.getItem("yearMonthIndex") || "[]"
        );


        const currentYearNum = Number(currentYear);

        // If current year already exists in index,
        // then we've already handled cleanup before.
        const currentYearExists = index.some(
            (item) => Number(item.year) === currentYearNum
        );

        if (currentYearExists) return;

        // Keep maximum 5 years
        if (index.length < 5) return;

        const oldestYear = Math.min(
            ...index.map((item) => Number(item.year))
        );

        // Run in background (does not block save)
        deleteYearData(oldestYear).catch((err) => {
            console.error("Failed deleting old year:", err);
        });
    } catch (err) {
        console.error("Cleanup check failed:", err);
    }


}

export default function AdminPanel() {
    const [number, setNumber] = useState("");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
    });

    const navigate = useNavigate();

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
    };

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchYearMonthIndex();
                localStorage.setItem("yearMonthIndex", JSON.stringify(res || []));
            } catch (err) {
                console.error(err);
            }
        };
        load();
    }, []);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            if (!u) {
                navigate("/admin/login", { replace: true });
            } else {
                setUser(u);
            }

            setLoading(false);
        });

        return () => unsub();
    }, [navigate]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/admin/login", { replace: true });
    };

    const calculateSum = (num) => {
        const total = num
            .toString()
            .split("")
            .reduce((sum, digit) => sum + Number(digit), 0);

        return total % 10;
    };
    const [todayData, setTodayData] = useState([]);
    const [tableLoading, setTableLoading] = useState(true);

    const loadTodayData = async () => {
        setTableLoading(true);

        const data = await fetchToday();

        setTodayData(data);
        setTableLoading(false);
    };

    useEffect(() => {
        loadTodayData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const date = getDate();
        const [year, month] = date.split("-");

        if (!number) {
            setLoading(false);
            showToast("Please enter a number.", "error");
            return;
        }

        const canAdd = await canAddResultToday(date);

        if (!canAdd) {
            setLoading(false);
            showToast(
                "Today's 8 values have already been filled.",
                "error"
            );
            return;
        }

        const newEntry = {
            number: Number(number),
            sum: calculateSum(number),
        };

        try {
            const docRef = doc(db, "results", date);
            const snap = await getDoc(docRef);

            if (snap.exists()) {
                const existing = snap.data().values || [];

                await setDoc(docRef, {
                    values: [...existing, newEntry],
                });
            } else {
                await setDoc(docRef, {
                    values: [newEntry],
                });
            }

            // Check if oldest year should be removed.
            // Runs in background and does not delay saving.
            cleanupOldYearIfNeeded(year);
            await rebuildHomepageCache();

            await rebuildMonthCache(year, month);

            console.log("✅ All caches updated");
            setNumber("");
            setLoading(false);
            showToast("Saved successfully!", "success");
            await loadTodayData();
        } catch (error) {
            console.error(error);
            setLoading(false);
            showToast("Failed to save.", "error");
        }
    };

    return (
        <div className="container-fluid text-center">
            <Toast
                message={toast.message}
                type={toast.type}
                show={toast.show}
                onClose={() =>
                    setToast({
                        show: false,
                        message: "",
                        type: "success",
                    })
                }
            />

            <div className="row">
                <Header />
            </div>

            <div className="d-flex justify-content-end p-3">
                <button
                    className="btn btn-danger"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>

            <div className="row justify-content-center mt-3">
                <div className="col-12 col-md-6 col-lg-4">
                    <div className="card shadow border-0">
                        <div className="card-body p-4">
                            <h3 className="card-title text-center mb-4">
                                Add Result
                            </h3>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">
                                        Today's Date : {formatDate()}
                                    </label>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">
                                        Enter Baji
                                    </label>

                                    <input
                                        type="number"
                                        className="form-control form-control-lg text-center"
                                        value={number}
                                        onChange={(e) =>
                                            setNumber(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={`btn w-100 btn-lg ${loading ? "btn-secondary" : "btn-info"
                                        }`}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            ></span>
                                            <span>Loading...</span>
                                        </>
                                    ) : (
                                        "Save Result"
                                    )}
                                </button>
                            </form>
                            <AdminResultItem
                                data={todayData}
                                loading={tableLoading}
                                onRefresh={loadTodayData}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
