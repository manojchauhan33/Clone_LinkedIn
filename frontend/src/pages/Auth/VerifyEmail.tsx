import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../../api/auth";
import type { ApiError } from "../../types/errors";

const VerifyEmail = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link");
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      try {
        const data = await verifyEmail(token);
        setStatus("success");
        setMessage(data.message);
        setTimeout(() => navigate("/login"), 3000);
      } catch (err: unknown) {
        const axiosErr = err as ApiError;
        if (axiosErr.response?.data?.error) {
          setStatus("error");
          setMessage(axiosErr.response.data.error);
        } else {
          setStatus("error");
          setMessage("Verification failed");
        }
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        {status === "loading" && (
          <p className="text-gray-500">Verifying your email...</p>
        )}
        {status === "success" && (
          <p className="text-green-500 text-lg">{message}</p>
        )}
        {status === "error" && (
          <p className="text-red-500 text-lg">{message}</p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
