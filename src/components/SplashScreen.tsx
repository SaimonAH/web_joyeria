import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';

// Animación de respiración para el logo
const breatheAnimation = keyframes`
  0%, 100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
`;

// Contenedor de la pantalla de carga
const SplashContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: ${theme.colors.background};
`;

// Logo animado
const Logo = styled.img`
  width: 150px;
  animation: ${breatheAnimation} 3s ease-in-out infinite;
`;

const SplashScreen = () => {
  return (
    <SplashContainer>
      <Logo src="/favicon.ico" alt="Cargando..." />
    </SplashContainer>
  );
};

export default SplashScreen;
