import { useState } from "react";
import { loginUser, signupUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function AuthForm({ isLogin, onToggleForm }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Handles form submission for both login and signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      let data;
      if (isLogin) {
        // 🔐 Login logic
        data = await loginUser(email, password);
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("email", email);
        navigate("/home"); // Redirect on success
      } else {
        // 📝 Signup logic
        data = await signupUser(email, password);
        setEmail("");
        setPassword("");
        onToggleForm(); // Switch to login form after signup
      }

      console.log("API Response:", data);
      toast.success(data.message || "Success");
    } catch (error) {
      const backendMessage =
        error?.response?.data?.detail || error?.message || "An error occurred.";
    
      setErrorMessage(backendMessage);
    
      if (backendMessage.toLowerCase().includes("verify your email")) {
        toast.error(backendMessage, {
          style: {
            background: "#fef3c7", // light yellow
            color: "#92400e",      // dark yellow text
          },
          icon: "⚠️",
        });
      } else {
        toast.error(backendMessage);
      }
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
        {isLogin ? "Login" : "Sign Up"}
      </h2>

      {/* 🔴 Display error message if present */}
      {errorMessage && (
        <div className="bg-red-100 text-red-600 p-2 rounded-md mb-4">
          {errorMessage}
        </div>
      )}

      {/* 🌐 Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:bg-blue-700 transition duration-200 w-full"
          type="submit"
        >
          Submit
        </button>
      </form>

      {/* 🔄 Toggle between login/signup */}
      <p className="text-sm text-center mt-4">
        {isLogin ? (
          <>
            Don't have an account?{" "}
            <button
              onClick={onToggleForm}
              className="text-blue-600 hover:underline font-medium"
            >
              Sign Up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              onClick={onToggleForm}
              className="text-blue-600 hover:underline font-medium"
            >
              Login
            </button>
          </>
        )}
      </p>
    </div>
  );
}

export default AuthForm;
