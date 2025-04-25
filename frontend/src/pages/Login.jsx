import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import navigate hook
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthForm from "../components/AuthForm";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // ✅ Redirect if already logged in
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow flex items-center justify-center px-4 pt-20 pb-8">
        <AuthForm
          isLogin={isLogin}
          onToggleForm={() => setIsLogin((prev) => !prev)}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Login;
