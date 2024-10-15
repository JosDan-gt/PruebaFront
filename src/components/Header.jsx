import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { AuthContext } from './Context/AuthContext';
import { FiLogOut } from 'react-icons/fi';
import fondoHeader from './Img/fondoHeader.jpg';
import HorizontalMenu from './Sidebar/Sidebar'; // Importa el menú horizontal
import LogoGLA from './Img/LogoGLA.png';

const Header = () => {
  const { setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    Cookies.remove('token');
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header
        className="relative text-white flex justify-center items-center shadow-lg"
        style={{
          backgroundImage: `url(${fondoHeader})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '200px',
        }}
      >
        {/* Fondo degradado para mejorar la visibilidad */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-50 z-0"></div>

        {/* Contenedor del logo y el título en fila */}
        <div className="relative flex items-center space-x-3 sm:space-x-6 z-10">
          {/* Logo más grande con animación en hover */}
          <div className="flex-shrink-0">
            <img
              src={LogoGLA}
              alt="LogoGLA"
              className="w-24 sm:w-32 md:w-40 h-auto transform transition-transform duration-300 hover:scale-110"
            />
          </div>

          {/* Título con diseño mejorado */}
          <div className="text-left">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-yellow-400 tracking-wide"
              style={{
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)"  // Esto crea un borde oscuro
              }}
            >
              Granja Los Ares
            </h1>
          </div>

        </div>

        {/* Botón de logout más compacto */}
        <button
          onClick={handleLogout}
          className="absolute bottom-3 right-3 text-white p-1 sm:p-1.5 md:p-2 rounded-lg transition duration-300 bg-red-500 hover:bg-red-600 flex items-center z-10"
        >
          <FiLogOut size={20} className="sm:size-10" />
        </button>
      </header>

      {/* Aquí el menú horizontal se coloca justo debajo del header */}
      <HorizontalMenu />
    </>
  );
};

export default Header;
