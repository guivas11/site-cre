export function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

type Strength = "weak" | "medium" | "strong";

export function getPasswordStrength(password: string): Strength {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z\d]/.test(password)) score += 1;

  if (score >= 5) return "strong";
  if (score >= 4) return "medium";
  return "weak";
}

export function isStrongPassword(password: string) {
  return getPasswordStrength(password) === "strong";
}
