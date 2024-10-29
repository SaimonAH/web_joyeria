import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from '../components/Sidebar';
import { isAuthenticated, getUserInfo } from '../services/auth';
import { obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario, obtenerClientesDeVendedor } from '../services/api';
import { theme } from '../styles/theme';
import { User, ChevronDown, ChevronUp, Edit, Trash2, UserPlus, Camera } from 'lucide-react';
import axios from 'axios';

const PageContainer = styled.div`
  display: flex;
  height: 100vh;
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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const Button = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  padding: 10px 20px;
  background-color: ${props => props.$primary ? theme.colors.primary : props.$danger ? theme.colors.error : theme.colors.white};
  color: ${props => props.$primary || props.$danger ? theme.colors.white : theme.colors.primary};
  border: 2px solid ${props => props.$primary ? theme.colors.primary : props.$danger ? theme.colors.error : theme.colors.primary};
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;

  &:hover {
    background-color: ${props => props.$primary ? theme.colors.secondary : props.$danger ? theme.colors.error : theme.colors.primary};
    color: ${theme.colors.white};
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ListItem = styled.div`
  background-color: ${theme.colors.white};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const ListInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ListName = styled.h3`
  font-size: 18px;
  color: ${theme.colors.primary};
  margin: 0;
`;

const ListEmail = styled.span`
  font-size: 14px;
  color: ${theme.colors.text};
`;

const ListActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.$danger ? theme.colors.error : theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: bold;
  transition: color 0.3s;
  padding: 5px 10px;
  border-radius: 4px;

  &:hover {
    background-color: ${props => props.$danger ? theme.colors.error : theme.colors.primary};
    color: ${theme.colors.white};
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: ${theme.colors.white};
  padding: 20px;
  border-radius: 8px;
  width: 400px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid ${theme.colors.gray};
  border-radius: 4px;
  font-size: 16px;
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

interface Vendedor {
  id: string;
  nombre: string;
  email: string;
  imagen_url?: string;
  clientes: Cliente[];
}

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  imagen_url?: string;
}

const AdminUserManagement: React.FC = () => {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [expandedVendedores, setExpandedVendedores] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentUser, setCurrentUser] = useState<Vendedor | Cliente | null>(null);
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });
  const [imagen, setImagen] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [currentVendedorId, setCurrentVendedorId] = useState<string | null>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    } else {
      const userInfo = getUserInfo();
      if (userInfo?.rol !== 'admin') {
        navigate('/');
      } else {
        fetchVendedores();
      }
    }
  }, [navigate]);

  const fetchVendedores = async () => {
    try {
      const vendedoresData = await obtenerUsuarios('vendedor');
      setVendedores(vendedoresData);
    } catch (error) {
      console.error('Error al obtener vendedores:', error);
    }
  };

  const toggleVendedorExpansion = async (vendedorId: string) => {
    if (expandedVendedores.includes(vendedorId)) {
      setExpandedVendedores(prev => prev.filter(id => id !== vendedorId));
    } else {
      try {
        const clientes = await obtenerClientesDeVendedor(vendedorId);
        setVendedores(prev => prev.map(vendedor => 
          vendedor.id === vendedorId ? { ...vendedor, clientes: clientes } : vendedor
        ));
        setExpandedVendedores(prev => [...prev, vendedorId]);
      } catch (error) {
        console.error('Error al obtener clientes:', error);
      }
    }
  };

  const handleDeleteVendedor = async (vendedorId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este vendedor?')) {
      try {
        await eliminarUsuario(vendedorId);
        fetchVendedores();
      } catch (error) {
        console.error('Error al eliminar vendedor:', error);
      }
    }
  };

  const handleDeleteCliente = async (clienteId: string, vendedorId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      try {
        await eliminarUsuario(clienteId);
        const updatedClientes = await obtenerClientesDeVendedor(vendedorId);
        setVendedores(prev => prev.map(vendedor => 
          vendedor.id === vendedorId ? { ...vendedor, clientes: updatedClientes } : vendedor
        ));
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
      }
    }
  };

  const openModal = (mode: 'create' | 'edit', user?: Vendedor | Cliente, vendedorId?: string) => {
    setModalMode(mode);
    setCurrentUser(user || null);
    setFormData(user ? { nombre: user.nombre, email: user.email, password: '' } : { nombre: '', email: '', password: '' });
    setImagenPreview(user?.imagen_url || null);
    setIsModalOpen(true);
    setCurrentVendedorId(vendedorId || null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
    setFormData({ nombre: '', email: '', password: '' });
    setImagen(null);
    setImagenPreview(null);
    setCurrentVendedorId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('email', formData.email);
      if (formData.password) {
        formDataToSend.append('password', formData.password);
      }
      
      if (currentVendedorId) {
        // Creando o editando un cliente
        formDataToSend.append('rol', 'cliente');
        formDataToSend.append('vendedorId', currentVendedorId);
      } else {
        // Creando o editando un vendedor
        formDataToSend.append('rol', 'vendedor');
      }

      if (imagen) {
        formDataToSend.append('imagen', imagen);
      }

      let response;
      if (modalMode === 'create') {
        response = await crearUsuario(formDataToSend);
        console.log('Usuario creado:', response);
      } else if (currentUser) {
        response = await actualizarUsuario(currentUser.id, formDataToSend);
        console.log('Usuario actualizado:', response);
      }

      if (currentVendedorId) {
        // Si estamos tratando con un cliente, actualizamos la lista de clientes del vendedor específico
        const updatedClientes = await obtenerClientesDeVendedor(currentVendedorId);
        setVendedores(prev => prev.map(vendedor => 
          vendedor.id === currentVendedorId ? { ...vendedor, clientes: updatedClientes } : vendedor
        ));
      } else {
        // Si estamos tratando con un vendedor, obtenemos todos los vendedores de nuevo
        fetchVendedores();
      }

      closeModal();
      alert(modalMode === 'create' ? 'Usuario creado exitosamente' : 'Usuario actualizado exitosamente');
    } catch (error) {
      console.error('Error al procesar el usuario:', error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`Error al procesar el usuario: ${error.response.data.error}`);
      } else {
        alert('Error al procesar el usuario');
      }
    }
  };

  return (
    <PageContainer>
      <Sidebar userInfo={getUserInfo()} />
      <MainContent>
        <Header>
          <Logo src="/images/Logoweb.png" alt="Fonelli Joyería Fina" />
        </Header>
        <Title>Administración de Usuarios</Title>
        <ButtonGroup>
          <Button $primary onClick={() => openModal('create')}><UserPlus size={18} /> Crear Vendedor</Button>
        </ButtonGroup>
        <List>
          {vendedores.map(vendedor => (
            <ListItem key={vendedor.id}>
              <ListHeader>
                <ListInfo>
                  {vendedor.imagen_url ? (
                    <img src={vendedor.imagen_url} alt={vendedor.nombre} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <User size={40} />
                  )}
                  <div>
                    <ListName>{vendedor.nombre}</ListName>
                    <ListEmail>{vendedor.email}</ListEmail>
                  </div>
                </ListInfo>
                <ListActions>
                  <ActionButton onClick={() => openModal('edit',   vendedor)}><Edit size={18} /> Editar</ActionButton>
                  <ActionButton $danger onClick={() => handleDeleteVendedor(vendedor.id)}><Trash2 size={18} /> Eliminar</ActionButton>
                  <ActionButton onClick={() => toggleVendedorExpansion(vendedor.id)}>
                    {expandedVendedores.includes(vendedor.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    {expandedVendedores.includes(vendedor.id) ? 'Ocultar Clientes' : 'Ver Clientes'}
                  </ActionButton>
                  <Button onClick={() => openModal('create', undefined, vendedor.id)}><UserPlus size={18} /> Crear Cliente</Button>
                </ListActions>
              </ListHeader>
              {expandedVendedores.includes(vendedor.id) && (
                <List>
                  {vendedor.clientes && vendedor.clientes.map(cliente => (
                    <ListItem key={cliente.id}>
                      <ListHeader>
                        <ListInfo>
                          {cliente.imagen_url ? (
                            <img src={cliente.imagen_url} alt={cliente.nombre} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <User size={30} />
                          )}
                          <div>
                            <ListName>{cliente.nombre}</ListName>
                            <ListEmail>{cliente.email}</ListEmail>
                          </div>
                        </ListInfo>
                        <ListActions>
                          <ActionButton onClick={() => openModal('edit', cliente, vendedor.id)}><Edit size={16} /> Editar</ActionButton>
                          <ActionButton $danger onClick={() => handleDeleteCliente(cliente.id, vendedor.id)}><Trash2 size={16} /> Eliminar</ActionButton>
                        </ListActions>
                      </ListHeader>
                    </ListItem>
                  ))}
                </List>
              )}
            </ListItem>
          ))}
        </List>
      </MainContent>
      {isModalOpen && (
        <Modal>
          <ModalContent>
            <h2>{modalMode === 'create' ? `Crear ${currentVendedorId ? 'cliente' : 'vendedor'}` : `Editar ${currentVendedorId ? 'cliente' : 'vendedor'}`}</h2>
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
              <Input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Nombre"
                required
              />
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                required
              />
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={modalMode === 'create' ? 'Contraseña' : 'Nueva contraseña (dejar en blanco para no cambiar)'}
                required={modalMode === 'create'}
              />
              <Button $primary type="submit">{modalMode === 'create' ? 'Crear' : 'Actualizar'}</Button>
              <Button type="button" onClick={closeModal}>Cancelar</Button>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
};

export default AdminUserManagement;