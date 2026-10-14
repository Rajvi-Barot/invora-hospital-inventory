import React, { useEffect, useState } from "react";
import Image from "../Assets/image.png";
import Logo from "../Assets/logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// const API = import.meta.env.VITE_API_URL;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    if (!email || !password) {
      toast.error("Please fill all inputs");
      return;
    }

    try {
      const response = await axios.post(
        "https://invora-qkwq.onrender.com/api/v1/login",
        // "http://localhost:3000/api/v1/login",
        { email, password }
      );

      // Store token & user
      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "auth",
        JSON.stringify({
          token: response.data.token,
          user: response.data.user,
        })
      );

      toast.success("Login successful");
      navigate("/dashboard", { replace: true });
    }catch (err) {
      console.log("Login error:", err.response?.data);

      if (err.response?.status === 403) {
        toast.error("Password expired. Redirecting...");
        
        // store email temporarily (optional)
        localStorage.setItem("resetEmail", email);

        setTimeout(() => {
          navigate("/reset-password");
        }, 1500);

        return;
      }

  toast.error(err.response?.data?.msg || "Login failed");
}
    // } catch (err) {
    //   console.log("Login error:", err.response?.data);
    //   toast.error(err.response?.data?.msg || "Login failed");
    // }
  };

  // Optional: Redirect if already logged in (SAFE VERSION)
  useEffect(() => {
    const auth = localStorage.getItem("auth");

    if (auth) {
      navigate("/dashboard", { replace: true });
    }

  }, [navigate]);
  // useEffect(() => {
  //   const auth = localStorage.getItem("auth");
  //   if (auth) {
  //     navigate("/dashboard");
  //   }
  // }, [navigate]);

  return (
    <div className="login-main">
      <div className="login-left">
        <img src={Image} alt="" />
      </div>

      <div className="login-right">
        <div className="login-right-container">
          <div className="login-logo">
            <img src={Logo} alt="" />
          </div>

          <div className="login-center">
            <h2>Welcome back!</h2>
            <p>Please enter your details</p>

            <form onSubmit={handleLoginSubmit}>
              <input type="email" placeholder="Email" name="email" />

              <div className="pass-input-div">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                />
                {showPassword ? (
                  <FaEyeSlash onClick={() => setShowPassword(!showPassword)} />
                ) : (
                  <FaEye onClick={() => setShowPassword(!showPassword)} />
                )}
              </div>

              <div className="login-center-options">
                <div className="remember-div">
                  <input type="checkbox" id="remember-checkbox" />
                  <label htmlFor="remember-checkbox">
                    Remember for 30 days
                  </label>
                </div>
              </div>

              <div className="login-center-buttons">
                <button type="submit">Log In</button>
              </div>
            </form>
          </div>

          <p className="login-bottom-p">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Login;

// import React, { useEffect, useState } from "react";
// import Image from "../Assets/image.png";
// import Logo from "../Assets/logo.png";
// import { FaEye, FaEyeSlash } from "react-icons/fa6";
// import "./Login.css";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const Login = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [token, setToken] = useState(
//     JSON.parse(localStorage.getItem("auth")) || ""
//   );
//   const navigate = useNavigate();

//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
//     let email = e.target.email.value;
//     let password = e.target.password.value;

//     if (email.length > 0 && password.length > 0) {
//       const formData = {
//         email,
//         password,
//       };
//       try {
//         const response = await axios.post(
//           "http://localhost:3000/api/v1/login",
//           formData
//         );
//         localStorage.setItem("token", response.data.token);

//         localStorage.setItem("auth", JSON.stringify({
//           token: response.data.token,
//           user: response.data.user
//         }));

//         // localStorage.setItem("auth", JSON.stringify({ token, user: response.data.user }));
//         // localStorage.setItem("auth", JSON.stringify(response.data.token));
//         setToken(response.data.token);
//         console.log("TOKEN FROM LOGIN:", response.data.token);

//         toast.success("Login successful");
//         navigate("/dashboard");
//       } catch (err) {
//         console.log("Login error:", err);
//         toast.error(err.response?.data?.message || "Login failed");
//       }
//     } else {
//       toast.error("Please fill all inputs");
//     }
//   };

//   useEffect(() => {
//     if (token !== "") {
//       console.log("User already logged in, token:", token);
//       toast.success("You are already logged in");
//       navigate("/dashboard");
//     }
//   }, [token, navigate]);

//   return (
//     <div className="login-main">
//       <div className="login-left">
//         <img src={Image} alt="" />
//       </div>
//       <div className="login-right">
//         <div className="login-right-container">
//           <div className="login-logo">
//             <img src={Logo} alt="" />
//           </div>
//           <div className="login-center">
//             <h2>Welcome back!</h2>
//             <p>Please enter your details</p>
//             <form onSubmit={handleLoginSubmit}>
//               <input type="email" placeholder="Email" name="email" />
//               <div className="pass-input-div">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Password"
//                   name="password"
//                 />
//                 {showPassword ? (
//                   <FaEyeSlash
//                     onClick={() => {
//                       setShowPassword(!showPassword);
//                     }}
//                   />
//                 ) : (
//                   <FaEye
//                     onClick={() => {
//                       setShowPassword(!showPassword);
//                     }}
//                   />
//                 )}
//               </div>

//               <div className="login-center-options">
//                 <div className="remember-div">
//                   <input type="checkbox" id="remember-checkbox" />
//                   <label htmlFor="remember-checkbox">
//                     Remember for 30 days
//                   </label>
//                 </div>
//                 <a href="#" className="forgot-pass-link">
//                   Forgot password?
//                 </a>
//               </div>
//               <div className="login-center-buttons">
//                 <button type="submit">Log In</button>
//               </div>
//             </form>
//           </div>

//           <p className="login-bottom-p">
//             Don't have an account? <Link to="/register">Sign Up</Link>
//           </p>
//         </div>
//       </div>
//       <ToastContainer />
//     </div>
//   );
// };

// export default Login;


// // import React, { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { logo, background } from "../Assets/index";

// // const Login = () => {
// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");

// //   const navigate = useNavigate();
// //   const loginUser = async (event) => {
// //     event.preventDefault();
// //     const response = await fetch("http://localhost:5000/api/login", {
// //       method: "POST",
// //       headers: {
// //         "Content-type": "application/json",
// //       },
// //       body: JSON.stringify({
// //         email,
// //         password,
// //       }),
// //     });
// //     const data = await response.json();
// //     if (data.success) {
// //       navigate("/Dashboard");
// //     } else {
// //       alert("Invalid email or password");
// //     }
// //   };
// //   return (
// //     <div
// //       className="flex flex-col items-center justify-center h-screen"
// //       style={{
// //         backgroundImage: `url(${background})`,
// //         backgroundSize: "cover",
// //       }}>
// //       <div className="text-center">
// //         <img
// //           className="w-80 h-70 mb-auto sm:mb-20 mx-auto min-w-[150px]"
// //           src={logo}
// //           alt="logo"
// //         />
// //         <form onSubmit={loginUser} className="mx-auto mt-4 text-left">
// //           <div className="mb-8">
// //             <h1 className="text-3xl font-bold mt-4 mb-2 text-gray-600 text-left">
// //               Login
// //             </h1>
// //             <p className="text-gray-500 text-left">
// //               Need an account?{" "}
// //               <span
// //                 onClick={(e) => navigate("/register")}
// //                 className="text-lime-500 cursor-pointer">
// //                 Sign Up
// //               </span>
// //             </p>
// //           </div>
// //           <div className="text-left">
// //             <label className="block mb-1">Email</label>
// //             <input
// //               value={email}
// //               onChange={(e) => setEmail(e.target.value)}
// //               placeholder="Email"
// //               type="email"
// //               className="w-full px-4 py-2 border rounded-lg mb-4"
// //             />
// //           </div>
// //           <div className="text-left">
// //             <label className="block mb-1">Password</label>
// //             <input
// //               value={password}
// //               onChange={(e) => setPassword(e.target.value)}
// //               placeholder="Password"
// //               type="password"
// //               className="w-full px-4 py-2 border rounded-lg mb-4"
// //             />
// //           </div>
// //           <div className="flex justify-between items-center">
// //             <button
// //               type="submit"
// //               className="bg-lime-500 text-white py-2 px-4 rounded-sm">
// //               Login
// //             </button>
// //             <span className="text-sm text-gray-500 cursor-pointer">
// //               Forget password ?
// //             </span>
// //           </div>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Login;
