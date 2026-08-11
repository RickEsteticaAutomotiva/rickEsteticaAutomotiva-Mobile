const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmailValido(email) {
  return typeof email === "string" && EMAIL_REGEX.test(email.trim());
}
