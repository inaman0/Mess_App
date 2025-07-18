// import Login1 from "./Login1";

import "../../App.css";
import { useContext, useEffect, useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import { LoginContext } from "../../context/LoginContext";
import { login } from "../../apis/backend";
import Login1 from "./Login1";
export type User = {
  username: string;
  password: string;
  role?: "user" | "admin";
};
const Login = () => {
  const navigate = useNavigate();
  const { user, setUser, isLoggedIn, setIsLoggedIn } = useContext(LoginContext);
  const [formData, setFormData] = useState<User>({
    username: "",
    password: "",
  });
  const [error, setError] = useState(""); // Updated: Added state for error handling

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    console.log("User", user);
    // setUser(formData);
    const lowerCaseName: string = formData.username.toLowerCase();
    if (
      lowerCaseName === "admin@rasp.com" &&
      formData.password === "admin@123"
    ) {
      console.log("User inside useEffect", user);

      setIsLoggedIn(true);
      console.log("Is user Logged In:", isLoggedIn);
    } else {
      setIsLoggedIn(false);
    }
  }, [formData]);

  // Function to check if email is valid
  const isEmailValid = () => {
    // console.log("Email validity: ",emailRegex.test(formData.email_id));
    return emailRegex.test(formData.username);
  };

  // Function to check if password satisfies requirements
  const isPasswordValid = () => {
    // Implement your password validation logic here
    // For example, check if password length is greater than or equal to 8 characters
    // console.log("Password validity: ",formData.password.length >= 6 );
    return formData.password.length >= 3;
  };
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // setUser(formData);
    const lowerCaseName: string = formData.username.toLowerCase();
    setFormData({
      ...formData,
      ["username"]: lowerCaseName,
      ["password"]: formData.password,
    });

    const loginObj: any = formData;
try{
  const res = await login(loginObj);
    
    const jwt = getCookie("jwt");
    const accessToken = getCookie("access_token");
    const refreshToken = getCookie("refresh_token");

    console.log("JWT:", jwt);
    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);

    const decodedJwt: any = jwtDecode(accessToken || "");
    const username = decodedJwt.preferred_username || "";
    console.log("Decoded JWT username:", username);
  
   
    if(!res){
      setError("Invalid username or password. Please try again.");
      return;
    }
    if (res) {
      // if user is admin, navigate to admin page
      if(username === "foodcomm"){
        setIsLoggedIn(true);
        navigate("/admin");
      }
      // else navigate to home page
      else{
        setIsLoggedIn(true);
        navigate("/");
      }
    }
}

catch(e){
  console.error("Error in login:", e);
}
    
  };
  // const handleLogin = () => {};

  
    return (
      <Login1 
        formData={formData} 
        setFormData={setFormData} 
        error={error} 
        setError={setError} 
        handleSubmit={handleSubmit} 
        isEmailValid={isEmailValid} 
        isPasswordValid={isPasswordValid} 
      />
    );
  
};

export default Login;
