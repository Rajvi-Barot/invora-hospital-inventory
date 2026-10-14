import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        await axios.put(
        // "http://localhost:3000/api/v1/reset-password",
        "https://invora-qkwq.onrender.com/api/v1/reset-password",
        {
            email: localStorage.getItem("resetEmail"), // ✅ from login page
            newPassword: password
        }
        );

        toast.success("Password updated successfully");

        localStorage.removeItem("resetEmail"); // cleanup

        setTimeout(() => {
        navigate("/login");
        }, 1500);

    } catch (err) {
        console.error(err);
        toast.error("Failed to reset password");
    }
    };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Reset Password</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter new password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Update Password</button>
      </form>
    </div>
  );
}