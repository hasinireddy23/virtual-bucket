import { useState, useEffect } from "react";
import { loginUser, signupUser } from "../api/auth";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

function AuthForm({ isLogin, onToggleForm }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
  
    if (status) {
      // Use a flag outside React to persist during quick remounts
      if (!window._toastShown) {
        if (status === "success") {
          toast.success("Email verified! You can now log in.");
        } else if (status === "failed") {
          toast.error("Verification link expired or invalid.");
        }
        window._toastShown = true; // 👈 survives remounts
      }
  
      // Clean up URL param safely
      params.delete("status");
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [location.search, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      let data;
      if (isLogin) {
        data = await loginUser(email, password);
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("email", email);
        navigate("/home");
      } else {
        data = await signupUser(email, password);
        setEmail("");
        setPassword("");
        onToggleForm();
      }

      console.log("API Response:", data);
      toast.success(data.message || "Success");
    } catch (error) {    
      if (error === "Please verify your email before logging in.") {
        toast.error("Please verify your email before logging in.", {
          style: {
            background: "#fef3c7",
            color: "#92400e",
          },
          icon: "✉️",
        });
      } 
      if (error === "Invalid credentials") {
        toast.error("Invalid credentials", {
          style: {
            background: "#fef3c7",
            color: "#92400e",
          }
        });
      }
      else {
        setErrorMessage(backendMessage);
        toast.error(backendMessage);
      }
    }  
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
        {isLogin ? "Login" : "Sign Up"}
      </h2>

      {errorMessage && (
        <div className="bg-red-100 text-red-600 p-2 rounded-md mb-4">
          {errorMessage}
        </div>
      )}

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
