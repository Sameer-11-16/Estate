import { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

const initialState = {
  user: JSON.parse(localStorage.getItem('le_user') || 'null'),
  loading: false,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: action.payload, error: null };
    case 'LOGIN_SUCCESS':
      localStorage.setItem('le_user', JSON.stringify(action.payload));
      return { ...state, user: action.payload, loading: false, error: null };
    case 'LOGOUT':
      localStorage.removeItem('le_user');
      return { ...state, user: null, loading: false };
    case 'SET_ERROR': return { ...state, error: action.payload, loading: false };
    default: return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = (userData) => dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
  const logout = () => dispatch({ type: 'LOGOUT' });
  const setLoading = (val) => dispatch({ type: 'SET_LOADING', payload: val });
  const setError = (msg) => dispatch({ type: 'SET_ERROR', payload: msg });

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setLoading, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
