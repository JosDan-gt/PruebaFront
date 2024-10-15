import { jwtDecode } from 'jwt-decode'; // Importación con nombre correcta
import Cookies from 'js-cookie';

// Función para obtener los roles desde el token
export const getRolesFromToken = () => {
  const token = Cookies.get('token') || localStorage.getItem('token');

  if (!token || token.split('.').length !== 3) {
   
    return [];
  }

  try {
    const decodedToken = jwtDecode(token);
    
    return decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || [];
  } catch (error) {
    console.error("Error decoding token:", error);
    return [];
  }
};
