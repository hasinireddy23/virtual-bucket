import axios from 'axios';

// ✅ Base URL for your FastAPI backend
const API_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Logs in the user using email and password.
 * Note: FastAPI expects 'username' field even if we're sending an email.
 *
 * @param {string} email - User's email address (used as 'username' in form)
 * @param {string} password - User's password
 * @returns {Promise<Object>} - The login response containing token, etc.
 */
export const loginUser = async (email, password) => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', email); // 👈 FastAPI expects 'username', using email instead
    formData.append('password', password);

    const response = await axios.post(`${API_URL}/auth/signin`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  } catch (error) {
    const err = error.response?.data?.detail || 'Login failed. Please try again.';
    throw err;
  }
};

/**
 * Registers a new user using email and password.
 *
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} - Signup success message
 */
export const signupUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/signup`, {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    const err = error.response?.data?.detail || 'Signup failed. Please try again.';
    throw err;
  }
};
