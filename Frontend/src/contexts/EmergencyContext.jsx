import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const EmergencyContext = createContext();

export const useEmergency = () => useContext(EmergencyContext);

export function EmergencyProvider({ children }) {

  const [requests, setRequests] = useState([]);

  const token = JSON.parse(localStorage.getItem("auth"))?.token;

  const API = "http://localhost:3000/api/v1/emergency-requests";

  // -----------------------
  // Fetch Requests
  // -----------------------
  const fetchRequests = async () => {
    try {

      const res = await axios.get(
        API,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Fetched requests:", res.data);

      setRequests(res.data.requests);

    } catch (err) {

      console.error("Failed to fetch emergency requests", err);

    }
  };
  useEffect(() => {
    fetchRequests();
  }, []);

  // -----------------------
  // Create Request
  // -----------------------

    const addRequest = async (newRequest) => {
  try {

    const res = await axios.post(
        API,
        newRequest,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Request created:", res.data);

      // Refresh list
      await fetchRequests();

    } catch (error) {

      console.log("Error creating request", error);

    }
  };

//   const addRequest = async (newRequest) => {
//   try {
//     const res = await axios.post(
//       "http://localhost:3000/api/v1/emergency",
//       newRequest
//     );
//     console.log("Created:", res.data);
//     // IMPORTANT — update UI immediately
//     setRequests(prev => [
//       res.data.request,
//       ...prev
//     ]);
//   } catch (error) {
//     console.log("Error creating request");
//   }
// };

  // -----------------------
  // Respond to Request
  // -----------------------
  const updateRequest = async (id, status, message) => {
    try {

        const token = JSON.parse(localStorage.getItem("auth"))?.token;

        const res = await axios.post(
        `http://localhost:3000/api/v1/emergency-requests/${id}/respond`,
        { status, message },
        {
            headers: {
            Authorization: `Bearer ${token}`
            }
        }
        );

        const updatedRequest = res.data.request;

        setRequests(prev =>
        prev.map(r => r._id === id ? updatedRequest : r)
        );

    } catch (error) {
        console.error("Failed to respond", error);
    }
    };

  // -----------------------
  // Stats
  // -----------------------
  const criticalCount = requests.filter(
    r => r.urgency === "critical" && r.status === "pending"
  ).length;

  const pendingCount = requests.filter(
    r => r.status === "pending"
  ).length;

  return (
    <EmergencyContext.Provider
      value={{
        requests,
        addRequest,
        updateRequest,
        criticalCount,
        pendingCount
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

// import React, { createContext, useContext, useState } from 'react';

// const EmergencyContext = createContext({ requests: [], addRequest: () => {}, updateRequest: () => {}, criticalCount: 0, pendingCount: 0 });

// export const useEmergency = () => useContext(EmergencyContext);

// const initialRequests = [
//   {
//     id: '1', type: 'blood', urgency: 'critical', fromHospital: 'City General Hospital',
//     toHospitals: ['all'], title: 'O- Blood Units Urgently Needed',
//     description: '5 units of O-negative blood required for trauma patient in ICU.',
//     quantity: '5 units', status: 'pending', createdAt: '2026-03-15T08:30:00Z',
//     responses: [
//       { hospital: 'Metro Medical Center', status: 'accepted', message: 'We can provide 2 units.', respondedAt: '2026-03-15T08:45:00Z' },
//       { hospital: 'Unified Healthcare', status: 'pending', message: '', respondedAt: null },
//     ],
//   },
//   {
//     id: '2', type: 'doctor', urgency: 'high', fromHospital: 'River Valley Hospital',
//     toHospitals: ['City General Hospital'], title: 'Cardiologist Needed for Emergency Surgery',
//     description: 'Need an experienced cardiologist for emergency bypass surgery.',
//     quantity: '1 specialist', status: 'accepted', createdAt: '2026-03-15T06:00:00Z',
//     responses: [
//       { hospital: 'City General Hospital', status: 'accepted', message: 'Dr. Patel is available. ETA 45 mins.', respondedAt: '2026-03-15T06:20:00Z' },
//     ],
//   },
//   {
//     id: '3', type: 'supplies', urgency: 'medium', fromHospital: "St. John's Hospital",
//     toHospitals: ['all'], title: 'IV Fluid Supply Request',
//     description: 'Running low on IV fluid bags. Need replenishment within 24 hours.',
//     quantity: '200 bags', status: 'pending', createdAt: '2026-03-14T14:00:00Z',
//     responses: [
//       { hospital: 'Regional Health Campus', status: 'accepted', message: 'Can supply 120 bags.', respondedAt: '2026-03-14T15:30:00Z' },
//       { hospital: 'Metro Medical Center', status: 'rejected', message: 'Sorry, we are also running low.', respondedAt: '2026-03-14T16:00:00Z' },
//     ],
//   },
//   {
//     id: '4', type: 'blood', urgency: 'low', fromHospital: 'Unified Healthcare',
//     toHospitals: ['City General Hospital', 'Metro Medical Center'], title: 'A+ Plasma Restock',
//     description: 'Routine plasma restock request for blood bank.',
//     quantity: '10 units', status: 'pending', createdAt: '2026-03-13T10:00:00Z',
//     responses: [],
//   },
// ];

// export function EmergencyProvider({ children }) {
//   const [requests, setRequests] = useState(initialRequests);

//   const addRequest = (request) => {
//     setRequests(prev => [{ ...request, id: String(Date.now()) }, ...prev]);
//   };

//   const updateRequest = (id, updates) => {
//     setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
//   };

//   const criticalCount = requests.filter(r => r.urgency === 'critical' && r.status === 'pending').length;
//   const pendingCount = requests.filter(r => r.status === 'pending').length;

//   return (
//     <EmergencyContext.Provider value={{ requests, addRequest, updateRequest, criticalCount, pendingCount }}>
//       {children}
//     </EmergencyContext.Provider>
//   );
// }

// import React, { createContext, useContext, useState, useEffect } from "react";
// import axios from "axios";

// const EmergencyContext = createContext();

// export const useEmergency = () => useContext(EmergencyContext);

// export function EmergencyProvider({ children }) {

//   const [requests, setRequests] = useState([]);

  
//   // const API = "http://localhost:3000/api/v1/emergency-requests";
//   // const API = "https://invora-qkwq.onrender.com/api/v1/emergency-requests";
//   const BASE_URL =
//   import.meta.env.VITE_API_URL ||
//   "https://invora-qkwq.onrender.com";
  
//   const API = `${BASE_URL}/api/v1/emergency-requests`;
  
//   // -----------------------
//   // Fetch Requests
//   // -----------------------
//   const fetchRequests = async () => {
//     try {

//       const token =
//         JSON.parse(localStorage.getItem("auth"))?.token;

//       const res = await axios.get(
//         API,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );
//       console.log(
//         "Fetched requests:",
//         res.data
//       );
//       setRequests(
//         res.data.requests
//       );

//     } catch (err) {

//       console.error(
//         "Failed to fetch emergency requests",
//         err
//       );
//     }
//   };

//   // -----------------------
//   // Create Request
//   // -----------------------

//   const addRequest = async (newRequest) => {
//   try {

//     // Always define token at top
//     const auth =
//       localStorage.getItem("auth");

//     if (!auth) {
//       console.log("No auth found");
//       return;
//     }

//     const parsed =
//       JSON.parse(auth);

//     const token =
//       parsed?.token;

//     console.log("TOKEN USED:", token);

//     if (!token) {
//       console.log("Token missing");
//       return;
//     }

//     const res = await axios.post(
//       API,
//       newRequest,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       }
//     );

//     console.log(
//       "Request created:",
//       res.data
//     );

//     await fetchRequests();

//   } catch (error) {

//     console.log(
//       "Error creating request:",
//       error.response?.data || error.message
//     );

//   }
// };

// //   const addRequest = async (newRequest) => {
// //   try {
// //     const res = await axios.post(
// //       "http://localhost:3000/api/v1/emergency",
// //       newRequest
// //     );
// //     console.log("Created:", res.data);
// //     // IMPORTANT — update UI immediately
// //     setRequests(prev => [
// //       res.data.request,
// //       ...prev
// //     ]);
// //   } catch (error) {
// //     console.log("Error creating request");
// //   }
// // };

//   // -----------------------
//   // Respond to Request
//   // -----------------------
//   const updateRequest = async (id, status, message) => {
//     try {

//         const token = JSON.parse(localStorage.getItem("auth"))?.token;

//         const res = await axios.post(
//         // `http://localhost:3000/api/v1/emergency-requests/${id}/respond`,
//         "https://invora-qkwq.onrender.com/api/v1/emergency-requests/" + id + "/respond",
//         { status, message },
//         {
//             headers: {
//             Authorization: `Bearer ${token}`
//             }
//         }
//         );

//         const updatedRequest = res.data.request;

//         setRequests(prev =>
//         prev.map(r => r._id === id ? updatedRequest : r)
//         );

//     } catch (error) {
//         console.error("Failed to respond", error);
//     }
//     };

//   // -----------------------
//   // Stats
//   // -----------------------
//   const criticalCount = requests.filter(
//     r => r.urgency === "critical" && r.status === "pending"
//   ).length;

//   const pendingCount = requests.filter(
//     r => r.status === "pending"
//   ).length;

//   return (
//     <EmergencyContext.Provider
//       value={{
//         requests,
//         addRequest,
//         updateRequest,
//         criticalCount,
//         pendingCount
//       }}
//     >
//       {children}
//     </EmergencyContext.Provider>
//   );
// }