import React, { useEffect, useState } from "react";
import Image from "../Assets/image.png";
import Logo from "../Assets/logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [token] = useState(JSON.parse(localStorage.getItem("auth")) || "");
  const [hospitals, setHospitals] = useState([]);
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const name = e.target.name.value;
    const lastname = e.target.lastname.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;
    const role = e.target.role.value;
    const hospital = e.target.hospital.value;
    const phone = e.target.phone.value;
    const address = e.target.address.value;

    if (name && lastname && email && password && confirmPassword && role && hospital) {
      if (password !== confirmPassword) {
        return toast.error("Passwords don't match");
      }

      const formData = {
        name: name + " " + lastname,
        email,
        password,
        role,
        hospital,
        phone,
        address
      };

      try {
        // await axios.post("http://localhost:3000/api/v1/register", formData);
        await axios.post("https://invora-qkwq.onrender.com/api/v1/register", formData);
        toast.success("Registration successful");
        navigate("/login");
      } catch (err) {
        toast.error(err.response?.data?.msg || "Registration failed");
      }
    } else {
      toast.error("Please fill all fields");
    }
  };

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        // const res = await axios.get("http://localhost:3000/api/v1/hospitals");
        const res = await axios.get("https://invora-qkwq.onrender.com/api/v1/hospitals");
        setHospitals(res.data.hospitals);
      } catch (err) {
        console.error("Failed to load hospitals");
      }
    };
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (token) {
      toast.success("You are already logged in");
      navigate("/dashboard");
    }
  }, [token, navigate]);


  return (
    <div className="register-main">
      <div className="register-left">
        <img src={Image} alt="" />
      </div>
      <div className="register-right">
        <div className="register-right-container">
          <div className="register-logo">
            <img src={Logo} alt="" />
          </div>
          <div className="register-center">
            <h2>Welcome to our website!</h2>
            <p>Please enter your details</p>
            <form onSubmit={handleRegisterSubmit}>
              <input type="text" placeholder="Name" name="name" required />
              <input type="text" placeholder="Lastname" name="lastname" required />
              <input type="email" placeholder="Email" name="email" required />

              <div className="pass-input-div">
                <input type={showPassword ? "text" : "password"} placeholder="Password" name="password" required />
                {showPassword ? (
                  <FaEyeSlash onClick={() => setShowPassword(!showPassword)} />
                ) : (
                  <FaEye onClick={() => setShowPassword(!showPassword)} />
                )}
              </div>

              <div className="pass-input-div">
                <input type={showPassword ? "text" : "password"} placeholder="Confirm Password" name="confirmPassword" required />
                {showPassword ? (
                  <FaEyeSlash onClick={() => setShowPassword(!showPassword)} />
                ) : (
                  <FaEye onClick={() => setShowPassword(!showPassword)} />
                )}
              </div>
              <input type="text" placeholder="Phone Number" name="phone" required />
              <textarea placeholder="Address" name="address" required />

              <select name="role" defaultValue="nurse" required>
                <option value="nurse">Nurse</option>
                <option value="admin">Admin</option>
              </select>
              <select name="hospital" required>
                <option value="">Select Hospital</option>

                {hospitals.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.name}
                  </option>
                ))}

              </select>
              <div className="register-center-buttons">
                <button type="submit">Sign Up</button>
              </div>
            </form>
          </div>

          <p className="login-bottom-p">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

// import React, { useEffect, useState } from "react";
// import Image from "../Assets/image.png";
// import Logo from "../Assets/logo.png";
// // import GoogleSvg from "../assets/icons8-google.svg";
// import { FaEye } from "react-icons/fa6";
// import { FaEyeSlash } from "react-icons/fa6";
// import "./Register.css";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-toastify";



// const Login = () => {
//   const [ showPassword, setShowPassword ] = useState(false);
//   const navigate = useNavigate();
//   const [ token, setToken ] = useState(JSON.parse(localStorage.getItem("auth")) || "");



//   const handleRegisterSubmit = async (e) => {
//     e.preventDefault();
//     let name = e.target.name.value;
//     let lastname = e.target.lastname.value;
//     let email = e.target.email.value;
//     let password = e.target.password.value;
//     let confirmPassword = e.target.confirmPassword.value;

//     if(name.length > 0 && lastname.length > 0 && email.length > 0 && password.length > 0 && confirmPassword.length > 0){

//       if(password === confirmPassword){
//         const formData = {
//           username: name + " " + lastname,
//           email,
//           password
//         };
//         try{
//         const response = await axios.post("http://localhost:3000/api/v1/register", formData);
//          toast.success("Registration successfull");
//          navigate("/login");
//        }catch(err){
//          toast.error(err.message);
//        }
//       }else{
//         toast.error("Passwords don't match");
//       }
    

//     }else{
//       toast.error("Please fill all inputs");
//     }


//   }

//   useEffect(() => {
//     if(token !== ""){
//       toast.success("You already logged in");
//       navigate("/dashboard");
//     }
//   }, []);

//   return (
//     <div className="register-main">
//       <div className="register-left">
//         <img src={Image} alt="" />
//       </div>
//       <div className="register-right">
//         <div className="register-right-container">
//           <div className="register-logo">
//             <img src={Logo} alt="" />
//           </div>
//           <div className="register-center">
//             <h2>Welcome to our website!</h2>
//             <p>Please enter your details</p>
//             <form onSubmit={handleRegisterSubmit}>
//             <input type="text" placeholder="Name" name="name" required={true} />
//             <input type="text" placeholder="Lastname" name="lastname" required={true} />
//               <input type="email" placeholder="Email" name="email" required={true} />
//               <div className="pass-input-div">
//                 <input type={showPassword ? "text" : "password"} placeholder="Password" name="password" required={true} />
//                 {showPassword ? <FaEyeSlash onClick={() => {setShowPassword(!showPassword)}} /> : <FaEye onClick={() => {setShowPassword(!showPassword)}} />}
                
//               </div>
//               <div className="pass-input-div">
//                 <input type={showPassword ? "text" : "password"} placeholder="Confirm Password" name="confirmPassword" required={true} />
//                 {showPassword ? <FaEyeSlash onClick={() => {setShowPassword(!showPassword)}} /> : <FaEye onClick={() => {setShowPassword(!showPassword)}} />}
                
//               </div>
//               <div className="register-center-buttons">
//                 <button type="submit">Sign Up</button>
//                 <button type="submit">
//                   {/* <img src={GoogleSvg} alt="" /> */}
//                   Sign Up with Google
//                 </button>
//               </div>
//             </form>
//           </div>

//           <p className="login-bottom-p">
//             Already have an account? <Link to="/login">Login</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;
