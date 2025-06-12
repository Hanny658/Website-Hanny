// components/RegLog.tsx
"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function RegLogModal() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [mode, /*setMode*/] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const res = await signIn("credentials", {
            redirect: false,
            mode,
            email,
            password,
            ...(mode === "register" && { username }),
        });
        if (res?.error) {
            setError(res.error);
        } else {
            window.location.reload();
        }
    };

    const handleLogout = async () => {
        setDropdownOpen(false);
        if (confirm("Are you sure you want to logout?")) {
            await signOut({ callbackUrl: "/map-of-snacks" });
        }
    };

    return (
        <>
            {/* Toggle button */}
            {!session ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Login
                </button>
            ) : (
                <div className="relative inline-block">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
                    >
                        <i className="bi bi-person-fill"></i>&nbsp;{session.user?.name || "User"}
                    </button>
                    {dropdownOpen && (
                        <div className="absolute left-0 mt-2 w-24 bg-white rounded shadow-lg z-50">
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal backdrop & container */}
            <div
                className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out ${isOpen && !session ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
            >
                <div
                    className={`bg-white text-black w-full max-w-md mx-2 p-6 rounded-lg shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
                        } relative`}
                >
                    {/* Close Icon */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>

                    <h2 className="text-2xl font-semibold mb-4">
                        {mode === "login" ? "Login" : "Register"}
                    </h2>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div>
                            <label className="block text-sm mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {mode === "register" && (
                            <div>
                                <label className="block text-sm mb-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                        >
                            {mode === "login" ? "Login" : "Register"}
                        </button>
                    </form>

                    <p className="mt-4 text-center text-sm">
                        <b className="text-gray-500">Register will be available after Close Beta</b>
                        {/* {mode === "login"
                            ? "Don't have an account?"
                            : "Already have an account?"}{" "}
                        <button
                            onClick={() => setMode(mode === "login" ? "register" : "login")}
                            className="text-blue-600 hover:underline"
                        >
                            {mode === "login" ? "Register" : "Login"}
                        </button> */}
                    </p>
                </div>
            </div>
        </>
    );
}
