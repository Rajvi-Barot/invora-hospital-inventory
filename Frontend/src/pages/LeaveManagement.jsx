import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    // const res = await axios.get("http://localhost:3000/api/v1/leaves");
    const res = await axios.get("https://invora-qkwq.onrender.com/api/v1/leaves");
    setLeaves(res.data.leaves);
  };

  const updateStatus = async (id, status) => {
    // await axios.patch(`http://localhost:3000/api/v1/leave/${id}`, {
    await axios.patch(`https://invora-qkwq.onrender.com/api/v1/leave/${id}`, {
      status
    });
    fetchLeaves();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Leave Requests</h1>

      {leaves.map(leave => (
        <div key={leave._id} className="p-4 border rounded-lg flex justify-between items-center">
          <div>
            <p className="font-semibold">{leave.nurseName}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(leave.from).toDateString()} - {new Date(leave.to).toDateString()}
            </p>
            <p className="text-sm">{leave.reason}</p>
            <p className="text-xs mt-1 font-bold">
              Status: {leave.status}
            </p>
          </div>

          {leave.status === "PENDING" && (
            <div className="flex gap-2">
              <Button
                onClick={() => updateStatus(leave._id, "APPROVED")}
              >
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => updateStatus(leave._id, "DECLINED")}
              >
                Decline
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}