export const validators = {
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    return password.length >= 8;
  },

  isValidUsername(username: string): boolean {
    return username.length >= 3 && username.length <= 20;
  },

  passwordsMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword;
  },
};
