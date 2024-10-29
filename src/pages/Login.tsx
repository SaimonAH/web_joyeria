import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import { theme } from '../styles/theme';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: ${theme.colors.background};
`;

const Logo = styled.img`
  width: 250px;
  margin-bottom: 30px;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 400px;
  padding: 40px;
  background-color: ${theme.colors.white};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: ${theme.colors.primary};
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
`;

const Input = styled.input`
  margin-bottom: 20px;
  padding: 12px;
  border: 1px solid ${theme.colors.gray};
  border-radius: 4px;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 12px;
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;

  &:hover {
    background-color: ${theme.colors.secondary};
  }
`;

const ErrorMessage = styled.p`
  color: red;
  text-align: center;
  margin-top: 10px;
`;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { token, usuario } = await login(email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', usuario.rol);
      localStorage.setItem('userId', usuario.id);
      localStorage.setItem('userInfo', JSON.stringify(usuario));

      if (usuario.rol === 'vendedor') {
        navigate('/vendedor/dashboard');
      } else if (usuario.rol === 'admin') {
        navigate('/admin/dashboard');
      } else {
        setError('Rol de usuario no autorizado');
      }
    } catch (err) {
      setError('Credenciales inválidas. Por favor, intente de nuevo.');
    }
  };

  return (
    <LoginContainer>
      <Logo src="/images/Logoweb.png" alt="Fonelli Joyería Fina" />
      <LoginForm onSubmit={handleSubmit}>
        <Title>Iniciar Sesión</Title>
        <Input
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit">Iniciar Sesión</Button>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </LoginForm>
    </LoginContainer>
  );
};

export default Login;