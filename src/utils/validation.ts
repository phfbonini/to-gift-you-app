export const validateEmail = (email: string): boolean => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

export const validateUsername = (username: string): boolean => {
  const re = /^[a-z0-9._]+$/;
  return re.test(username);
};

export type PasswordStrength = 'Muito Fraca' | 'Fraca' | 'Média' | 'Forte';

export const getPasswordStrength = (password: string): PasswordStrength => {
  if (password.length < 4) return 'Muito Fraca';
  if (password.length < 8) return 'Fraca';
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (hasUpper && hasNumber && hasSpecial) return 'Forte';
  if (hasUpper || hasNumber || hasSpecial) return 'Média';
  return 'Fraca';
};