// Login.jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { AuthContext } from '../Context/AuthContext'; // Asegúrate de que este path es correcto
import fondoLogin from '../Img/FallGuys.jpg';
import LogoGLA from '../Img/LogoGLA.png';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { setIsAuthenticated, verifyToken } = useContext(AuthContext); // Aquí obtenemos setIsAuthenticated

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('https://pruebabackend-production-e215.up.railway.app/api/Auth/login', {
        username,
        password,
      });

      const token = response.data.accessToken;

      if (token) {
        // Guardar el token en localStorage y Cookies
        localStorage.setItem('token', token);
        Cookies.set('token', token, { expires: 1 });

        setIsAuthenticated(true); // Aquí usamos setIsAuthenticated correctamente
        verifyToken(); // Actualiza los roles y el estado de autenticación

        // Redirigir al dashboard
        navigate('/dashboard', { replace: true });
      } else {
        console.error('Token no encontrado en la respuesta del backend');
        setError('Error al iniciar sesión, token no recibido.');
      }
    } catch (err) {
      console.error('Error en la solicitud:', err);
      setError('Nombre de usuario o contraseña incorrectos. Inténtalo de nuevo.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100 bg-cover bg-center"
      style={{ backgroundImage: `url(${fondoLogin})` }}
    >
      <div className="bg-white bg-opacity-90 p-10 rounded-lg shadow-xl w-full max-w-md ml-4 mr-4">

        <div className="flex justify-center mb-6">
          <img src={LogoGLA} alt="LogoGLA" className="w-60 h-auto" />
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Bienvenido</h2>
        <p className="text-center text-gray-600 mb-4">Por favor, inicia sesión para continuar</p>
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label htmlFor="username" className="block text-gray-700 font-semibold mb-2">
              Nombre de Usuario
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="Ingresa tu usuario"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>
          {error && (
            <p className="text-red-500 text-center text-sm mb-4">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
