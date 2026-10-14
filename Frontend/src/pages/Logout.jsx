import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  }, []);

  return (
    <div className='logout-main'>
      <h1>Logout Successful!</h1>
      <p>You will be redirected to login...</p>
    </div>
  );
};

export default Logout;

// import React, { useEffect } from 'react'
// // import "../styles/Logout.css";
// import { useNavigate } from 'react-router-dom';

// const Logout = () => {

//     const navigate = useNavigate();
    
//     useEffect(() => {
//         localStorage.removeItem("auth");
//         setTimeout(() => {
//             // navigate("/login");
//             window.location.href = "http://localhost:8080/login";
//         }, 3000);
//     }, []);

//   return (
//     <div className='logout-main'>
//     <h1>Logout Successful!</h1>
//     <p>You will be redirected to the landing page in 3 seconds...</p>
//   </div>
//   )
// }

// export default Logout