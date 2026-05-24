export function generateStudentPassword(rollNumber: string): string {
  return `Smart@${rollNumber.trim()}`;
}

export function generateParentPassword(rollNumber: string): string {
  return `Parent@${rollNumber.trim()}`;
}

export function validateNewPassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (!/\d/.test(password)) {
    return "Password must include at least one number.";
  }
  return null;
}

export function getPasswordStrength(password: string): {
  score: number;
  label: string;
} {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score: 1, label: "Weak" };
  if (score <= 3) return { score: 2, label: "Fair" };
  if (score <= 4) return { score: 3, label: "Good" };
  return { score: 4, label: "Strong" };
}
