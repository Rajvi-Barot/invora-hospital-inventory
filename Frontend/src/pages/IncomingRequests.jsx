import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

export default function IncomingRequests() {

  const [requests, setRequests] = useState([]);

  const token = JSON.parse(localStorage.getItem("auth"))?.token;

  const fetchRequests = async () => {

    const res = await axios.get(
      "https://invora-qkwq.onrender.com/api/v1/emergency-requests",
      // "http://localhost:3000/api/v1/emergency-requests",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setRequests(res.data.requests);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const respond = async (id, status) => {

    await axios.post(
      // `http://localhost:3000/api/v1/emergency-requests/${id}/respond`,
      "https://invora-qkwq.onrender.com/api/v1/emergency-requests/" + id + "/respond",
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    fetchRequests();
  };

  return (

    <div className="space-y-4">

      <h1 className="text-2xl font-bold">Incoming Emergency Requests</h1>

      {requests.map((r) => (

        <div key={r._id} className="border p-4 rounded">

          <p>
            <b>Hospital:</b> {r.requestingHospital?.name}
          </p>

          <p>
            <b>Type:</b> {r.type}
          </p>

          {r.item && (
            <p>
              <b>Item:</b> {r.item}
            </p>
          )}

          {r.specialization && (
            <p>
              <b>Doctor:</b> {r.specialization}
            </p>
          )}

          <div className="flex gap-3 mt-3">

            <Button
              onClick={() => respond(r._id, "ACCEPTED")}
            >
              Accept
            </Button>

            <Button
              variant="destructive"
              onClick={() => respond(r._id, "REJECTED")}
            >
              Reject
            </Button>

          </div>

        </div>

      ))}

    </div>

  );
}