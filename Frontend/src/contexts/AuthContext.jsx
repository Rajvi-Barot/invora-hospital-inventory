import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          // "http://localhost:3000/api/v1/profile",
          "https://invora-qkwq.onrender.com/api/v1/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(res.data.user);
      } catch (err) {
        console.log("Failed to fetch user");
        localStorage.removeItem("token");
        setUser(null);
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// import React, { createContext, useContext, useState, useEffect } from 'react';

// const AuthContext = createContext({ user: null, loading: true, logout: () => {} });

// export const useAuth = () => useContext(AuthContext);

// const MOCK_USER = {
//   _id: '1',
//   name: 'Dr. Sarah Johnson',
//   email: 'sarah@invora.com',
//   role: 'admin',
// };

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       localStorage.setItem('token', 'mock-jwt-token');
//     }
//     setUser(MOCK_USER);
//     setLoading(false);
//   }, []);

//   const logout = () => {
//     localStorage.clear();
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }
