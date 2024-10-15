import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { AuthContext } from '../Context/AuthContext';

const HorizontalMenu = () => {
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar el menú hamburguesa
  const [openAdmin, setOpenAdmin] = useState(false); 
  const [openRazasCorral, setOpenRazasCorral] = useState(false);

  const { roles } = useContext(AuthContext);
  const isAdmin = roles?.includes('Admin');

  useEffect(() => {
    setOpenAdmin(false);
    setOpenRazasCorral(false);
  }, [roles]);  

  // Alterna el menú hamburguesa
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-gradient-to-r from-red-400 to-orange-300 text-white relative shadow-lg">
      {/* Botón del menú hamburguesa para pantallas pequeñas */}
      <div className="flex justify-between items-center p-4 sm:hidden">
        <span className="text-xl font-extrabold">Menú</span>
        <button onClick={toggleMenu} className="focus:outline-none">
          {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </button>
      </div>

      {/* Menú principal centrado */}
      <nav className={`sm:flex justify-center ${isOpen ? 'block' : 'hidden'} sm:block`}>
        <ul className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 p-4 sm:items-center">
          <li>
            <Link to="/dashboard" className="text-black font-extrabold hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/lotes" className="text-black font-extrabold hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105">
              Lotes
            </Link>
          </li>

          {/* Desplegable Gestión de Corrales y Razas */}
          {isAdmin && (
            <li className="relative">
              <button
                onClick={() => setOpenRazasCorral(!openRazasCorral)}
                className="text-black font-extrabold hover:text-yellow-300 transition duration-300 ease-in-out flex items-center"
              >
                Gestión de Corrales y Razas {openRazasCorral ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              {openRazasCorral && (
                <ul className="absolute z-10 bg-gradient-to-r from-red-400 to-orange-300 rounded-md shadow-md p-2 mt-2 left-0 space-y-2 w-48">
                  <li>
                    <Link to="/corrales" className="block font-extrabold text-black hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105">
                      Corrales
                    </Link>
                  </li>
                  <li>
                    <Link to="/razasg" className="block font-extrabold text-black hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105">
                      Raza de Gallina
                    </Link>
                  </li>
                  <li>
                    <Link to="/gestion" className="block font-extrabold text-black hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105">
                      Gestión de Lotes
                    </Link>
                  </li>
                  <li>
                    <Link to="/usuario" className="block font-extrabold text-black hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105">
                      Usuarios
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          )}

          {/* Desplegable Gestión de Negocio */}
          {isAdmin && (
            <li className="relative">
              <button
                onClick={() => setOpenAdmin(!openAdmin)}
                className="text-black font-extrabold hover:text-yellow-300 transition duration-300 ease-in-out flex items-center"
              >
                Gestión de Negocio {openAdmin ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              {openAdmin && (
                <ul className="absolute z-10 bg-gradient-to-r from-red-400 to-orange-300 rounded-md shadow-md p-2 mt-2 left-0 space-y-2 w-48">
                  <li>
                    <Link to="/cliente" className="block font-extrabold text-black hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105">
                      Clientes
                    </Link>
                  </li>
                  <li>
                    <Link to="/producto" className="block font-extrabold text-black hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105">
                      Productos
                    </Link>
                  </li>
                  <li>
                    <Link to="/venta" className="block font-extrabold text-black hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105">
                      Ventas
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default HorizontalMenu;
