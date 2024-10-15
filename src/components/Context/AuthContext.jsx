// AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { getRolesFromToken } from './jwtUtils'; 

// Crear el contexto de autenticación
export const AuthContext = createContext(); // Define y exporta el contexto

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para verificar el token y actualizar el estado
  const verifyToken = () => {
    const token = Cookies.get('token') || localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const userRoles = getRolesFromToken(token); // Decodificar roles desde el token
      setRoles(userRoles);
    } else {
      setIsAuthenticated(false);
      setRoles([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    verifyToken(); // Verificar el token cuando el componente se monta
  }, []);

  const logout = () => {
    Cookies.remove('token');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setRoles([]);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, roles, verifyToken, logout }}>
      {loading ? <div>Cargando...</div> : children}
    </AuthContext.Provider>
  );
};
