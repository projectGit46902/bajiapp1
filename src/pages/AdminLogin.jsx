import React, { useState } from "react";
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success"
    });
    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
    };

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/admin", { replace: true });
        } catch (err) {
            showToast("Invalid email or password", "error");
        }

        setLoading(false);
    };

    const handleForgotPassword = async () => {
        if (!email) {
            showToast("Please enter your email first", "warning");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            showToast("Password reset email sent!", "success");
        } catch (err) {
            showToast("Error sending reset email", "error");
        }
    };

    return (
        <div className="container mt-5">
            <Toast
                message={toast.message}
                type={toast.type}
                show={toast.show}
                onClose={() =>
                    setToast({ show: false, message: "", type: "success" })
                }
            />
            <div className="row justify-content-center">
                <div className="col-md-4">

                    <div className="card shadow border-0">
                        <div className="card-body p-4">

                            <h3 className="text-center mb-4">Admin Login</h3>

                            <form onSubmit={handleLogin}>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-dark w-100"
                                    disabled={loading}
                                >
                                    {loading ? "Logging in..." : "Login"}
                                </button>
                            </form>

                            <div className="text-center mt-3">
                                <button
                                    className="btn btn-link text-decoration-none"
                                    onClick={handleForgotPassword}
                                >
                                    Forgot Password?
                                </button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminLogin;