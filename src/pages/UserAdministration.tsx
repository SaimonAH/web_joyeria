import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { isAuthenticated, getUserInfo } from '../services/auth';
import { crearUsuario, obtenerUsuarios, actualizarUsuario, eliminarUsuario, obtenerClientesDeVendedor } from '../services/api';
import { theme } from '../styles/theme';
import { User, Edit, Trash2, Camera } from 'lucide-react';
import axios from 'axios';

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${theme.colors.background};
`;

const MainContent = styled.div`
  flex: 1;
  padding: 40px;
  overflow-y: auto;
`;

const Header = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
`;

const Logo = styled.img`
  height: 60px;
`;

const Title = styled.h1`
  font-size: 28px;
  color: ${theme.colors.primary};
  margin-bottom: 20px;
  text-align: center;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
  background-color: ${props => props.$active ? theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? theme.colors.white : theme.colors.primary};
  border: 2px solid ${theme.colors.primary};
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
  margin: 0 10px;
  font-size: 1rem;
  &:hover {
    background-color: ${props => props.$active ? theme.colors.primary : theme.colors.secondary};
    color: ${theme.colors.white};
  }
`;

const Form = styled.form`
  background-color: ${theme.colors.white};
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 0 auto 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: ${theme.colors.text};
  font-weight: bold;
  font-size: 1.1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${theme.colors.gray};
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${theme.colors.secondary};
  }
`;

const UserList = styled.ul`
  list-style-type: none;
  padding: 0;
  max-width: 600px;
  margin: 0 auto;
`;

const UserItem = styled.li`
  background-color: ${theme.colors.white};
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const UserName = styled.span`
  margin-left: 20px;
  font-weight: bold;
  font-size: 1.1rem;
`;

const UserImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.colors.primary};
  transition: color 0.3s;

  &:hover {
    color: ${theme.colors.secondary};
  }
`;

const DeleteButton = styled(IconButton)`
  &:hover {
    color: ${theme.colors.error};
  }
`;

const ImageUploadContainer = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: ${theme.colors.gray};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin: 0 auto 20px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s;

  &:hover {
    background-color: ${theme.colors.secondary};
  }

  &:hover::after {
    content: 'Haz clic para seleccionar imagen';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px;
    font-size: 12px;
    text-align: center;
  }
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImageUploadIcon = styled(Camera)`
  color: ${theme.colors.white};
  width: 40px;
  height: 40px;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  imagen_url?: string;
}

const UserAdministration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'crear' | 'editar'>('crear');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    } else {
      const storedUserInfo = getUserInfo();
      if (storedUserInfo) {
        setUserInfo(storedUserInfo);
        fetchUsuarios();
      } else {
        console.error('No se encontró la información del usuario.');
      }
    }
  }, [navigate]);

  const fetchUsuarios = async () => {
    try {
      if (userInfo && userInfo.id) {
        const fetchedUsuarios = await obtenerClientesDeVendedor(userInfo.id);
        setUsuarios(fetchedUsuarios);
      } else {
        console.error('No se encontró el ID del vendedor');
      }
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('rol', 'cliente');
      if (imagen) {
        formData.append('imagen', imagen);
      }
      
      if (userInfo && userInfo.id) {
        formData.append('vendedorId', userInfo.id);
      } else {
        throw new Error('No se encontró el ID del vendedor');
      }

      if (activeTab === 'crear') {
        const response = await crearUsuario(formData);
        console.log('Usuario creado:', response);
        clearForm();
        alert('Usuario creado exitosamente');
      } else if (selectedUser) {
        await actualizarUsuario(selectedUser.id, formData);
        setSelectedUser(null);
        clearForm();
        alert('Usuario actualizado exitosamente');
      }
      fetchUsuarios();
    } catch (error) {
      console.error('Error al procesar el usuario:', error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`Error al procesar el usuario: ${error.response.data.error}`);
      } else {
        alert('Error al procesar el usuario');
      }
    }
  };

  const handleEditUser = async (user: Usuario) => {
    if (selectedUser && selectedUser.id === user.id) {
      setSelectedUser(null);
      clearForm();
    } else {
      setSelectedUser(user);
      setNombre(user.nombre);
      setEmail(user.email);
      setPassword('');
      setImagen(null);
      setImagenPreview(user.imagen_url || null);
    }
    await fetchUsuarios();
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await eliminarUsuario(userId);
        alert('Usuario eliminado exitosamente');
        await fetchUsuarios();
      } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        alert('Error al eliminar el usuario');
      }
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagen(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearForm = () => {
    setNombre('');
    setEmail('');
    setPassword('');
    setImagen(null);
    setImagenPreview(null);
    setSelectedUser(null);
  };

  const handleTabChange = async (tab: 'crear' | 'editar') => {
    setActiveTab(tab);
    clearForm();
    if (tab === 'editar') {
      await fetchUsuarios();
    }
  };

  const renderForm = (user: Usuario | null = null) => (
    <Form onSubmit={handleSubmit}>
      <ImageUploadContainer onClick={handleImageClick}>
        {imagenPreview ? (
          <ImagePreview src={imagenPreview} alt="Vista previa" />
        ) : (
          <ImageUploadIcon />
        )}
      </ImageUploadContainer>
      <HiddenFileInput
        ref={fileInputRef}
        type="file"
        onChange={handleImageChange}
        accept="image/*"
      />
      <FormGroup>
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          type="text"
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="password">
          {user ? 'Nueva contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}
        </Label>
        <Input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!user}
        />
      </FormGroup>
      <Button type="submit">
        {user ? 'Actualizar usuario' : 'Registrar usuario'}
      </Button>
    </Form>
  );

  return (
    <PageContainer>
      <Sidebar userInfo={userInfo} />
      <MainContent>
        <Header>
          <Logo src="/images/Logoweb.png" alt="Fonelli Joyería Fina" />
        </Header>
        <Title>Administración de Usuarios</Title>
        <TabContainer>
          <Tab $active={activeTab === 'crear'} onClick={() => handleTabChange('crear')}>Crear</Tab>
          <Tab $active={activeTab === 'editar'} onClick={() => handleTabChange('editar')}>Editar</Tab>
        </TabContainer>
        {activeTab === 'crear' ? (
          renderForm()
        ) : (
          <>
            <UserList>
              {usuarios.map((usuario) => (
                <React.Fragment key={usuario.id}>
                  <UserItem>
                    <UserInfo>
                      {usuario.imagen_url ? (
                        <UserImage src={usuario.imagen_url} alt={usuario.nombre} />
                      ) : (
                        <User size={24} />
                      )}
                      <UserName>{usuario.nombre}</UserName>
                    </UserInfo>
                    <ActionButtons>
                      <IconButton onClick={() => handleEditUser(usuario)}>
                        <Edit size={24} />
                      </IconButton>
                      <DeleteButton onClick={() => handleDeleteUser(usuario.id)}>
                        <Trash2 size={24} />
                      </DeleteButton>
                    </ActionButtons>
                  </UserItem>
                  {selectedUser && selectedUser.id === usuario.id && renderForm(selectedUser)}
                </React.Fragment>
              ))}
            </UserList>
          </>
        )}
      </MainContent>
    </PageContainer>
  );
};

export default UserAdministration;