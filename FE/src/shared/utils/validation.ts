export const validatePassword = (pw: string) => {
  const minLength = pw.length >= 8;
  const maxLength = pw.length <= 64;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);

  return minLength && maxLength && hasLower && hasUpper && hasNumber && hasSymbol;
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};