import api from "./axois";


export interface SignupData {
  name: string;
  email: string;
  password: string;
}



export const signup = async (data: SignupData) => {
  const res = await api.post("/auth/signup", data);
  return res.data;
};


export const login = async (data: { email: string; password: string }) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};


export const googleLogin = async (idToken: string) => {
  const res = await api.post("/auth/googleLogin", { idToken });
  return res.data;
};


export const forgotPassword = async (email: string, captchaToken: string) => {
  const res = await api.post("/auth/forgot-password", {
    email,
    "h-captcha-response": captchaToken,
  });
  return res.data;
};


export const resetPassword = async (token: string, password: string) => {
  const res = await api.post(`/auth/reset-password/${token}`, { password });
  return res.data;
};


export const verifyEmail = async (token: string) => {
  const response = await api.get(`/auth/verify/${token}`);
  return response.data;
};


export const logout = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};


export const checkAuth = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};