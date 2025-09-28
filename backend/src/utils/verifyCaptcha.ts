export const verifyCaptcha = async (token: string): Promise<boolean> => {
  if (!token) return false;

  const res = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: process.env.HCAPTCHA_SECRET!,
      response: token,
    }),
  });

  const data = await res.json();
  return data.success === true;
};
