// services/authService.jsx
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// עדכן/י כתובת בסיס לפי הצורך (סביבת פיתוח/פרודקשן)
const API_URL = 'http://localhost:5000/api/auth';

// עוזר קטן לשמירת הטוקן והזרקתו ל-axios
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// רישום משתמש חדש
// מצפה ל- { firstName, lastName, email, password } — בלי לעשות hashing בצד לקוח!
export const registerUser = async (userData) => {
  const res = await axios.post(`${API_URL}/register`, userData);
  // השרת מחזיר token; אפשר לשמור אותו אם רוצים להתחברות אוטומטית אחרי רישום
  if (res?.data?.token) setAuthToken(res.data.token);
  return res.data; // { token }
};

// התחברות
// מצפה ל- { email, password }
export const loginUser = async (credentials) => {
  const res = await axios.post(`${API_URL}/login`, credentials);
  const token = res?.data?.token;

  if (!token) throw new Error('No token returned from server');

  setAuthToken(token);

  // לפי השרת: הטוקן מכיל { id: <userId> } ולא { user: {...} }
  const decoded = jwtDecode(token); // { id, iat, exp }
  return {
    token,
    user: { id: decoded?.id },
  };
};

// יציאה
export const logout = () => setAuthToken(null);

// דוגמה לזרימה של איפוס סיסמה אם תממש/י צד שרת
export const forgotPassword = async (email) => {
  const res = await axios.post(`${API_URL}/forgot-password`, { email });
  return res.data;
};

export const resetPassword = async (token, newPassword) => {
  // ללא hashing בצד לקוח
  const res = await axios.post(`${API_URL}/reset-password`, { token, newPassword });
  return res.data;
};

// נסה/י לטעון טוקן מה-localStorage בבוטסטראפ האפליקציה
const existing = localStorage.getItem('token');
if (existing) setAuthToken(existing);
