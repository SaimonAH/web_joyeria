import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from '../components/Sidebar';
import { isAuthenticated, getUserInfo } from '../services/auth';
import { obtenerPedidos, eliminarPedido, updateOrderStatus, cancelarPedido, reactivarPedido } from '../services/api';
import { theme } from '../styles/theme';
import { ChevronDown } from 'lucide-react';

const DashboardContainer = styled.div`
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
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 30px;
  background-color: ${theme.colors.white};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Tab = styled.button<{ $active: boolean }>`
  font-size: 1rem;
  padding: 15px 30px;
  background-color: ${props => props.$active ? theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? theme.colors.white : theme.colors.text};
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  &:hover {
    background-color: ${props => props.$active ? theme.colors.primary : theme.colors.gray};
  }
`;

const OrderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const OrderContainer = styled.div`
  background-color: ${theme.colors.white};
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
`;

const OrderContent = styled.div`
  flex: 1;
  overflow: hidden;
`;

const OrderHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const OrderTitle = styled.h3`
  font-size: 18px;
  color: ${theme.colors.primary};
  margin: 0;
`;

const OrderStatus = styled.span<{ $canceled: boolean }>`
  font-size: 16px;
  color: ${props => props.$canceled ? theme.colors.error : theme.colors.text};
  margin-left: 10px;
`;

const OrderTable = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
`;

const TableHeader = styled.div`
  font-weight: bold;
  color: ${theme.colors.text};
  padding: 5px;
  background-color: ${theme.colors.gray};
  border-radius: 10px;
  text-align: center;
`;

const TableCell = styled.div`
  color: ${theme.colors.text};
  padding: 5px;
  text-align: center;
  word-break: break-word;
`;

const ObservacionesCell = styled(TableCell)`
  text-align: left;
  white-space: normal;
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-left: 20px;
  width: 180px;
`;

const StyledButton = styled.button`
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  width: 100%;
  margin-bottom: 10px;
`;

const PrimaryButton = styled(StyledButton)`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;

  &:hover {
    background-color: ${theme.colors.secondary};
  }
`;

const SecondaryButton = styled(StyledButton)`
  background-color: ${theme.colors.white};
  color: ${theme.colors.error};
  border: 1px solid ${theme.colors.error};

  &:hover {
    background-color: ${theme.colors.error};
    color: ${theme.colors.white};
  }
`;

const StatusButtonContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StatusMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: ${theme.colors.gray};
  border: 1px solid ${theme.colors.primary};
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const StatusMenuItem = styled.div`
  padding: 8px 15px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${theme.colors.white};
  }
`;

interface Pedido {
  id: string;
  estado: string;
  modelo: string;
  numero_piezas: number;
  talla: string;
  kilataje: string;
  color: string;
  inicial: number;
  nombre_pedido: string;
  piedra: string;
  largo: number;
  observaciones: string;
  cancelado: boolean;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'solicitado' | 'capturado' | 'historial'>('solicitado');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [openStatusMenu, setOpenStatusMenu] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    } else {
      const storedUserInfo = getUserInfo();
      if (storedUserInfo && storedUserInfo.rol === 'admin') {
        setUserInfo(storedUserInfo);
        fetchPedidos();
      } else {
        setError('Usuario no autorizado o información no encontrada.');
        navigate('/login');
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (userInfo) {
      fetchPedidos();
    }
  }, [activeTab, userInfo]);

  const fetchPedidos = async () => {
    try {
      const fetchedPedidos = await obtenerPedidos();
      setPedidos(fetchedPedidos);
    } catch (error) {
      console.error('Error al obtener los pedidos:', error);
      setError('No se pudieron cargar los pedidos. Por favor, intente de nuevo más tarde.');
    }
  };

  const handleChangeStatus = async (pedidoId: string, newStatus: string) => {
    try {
      await updateOrderStatus(pedidoId, newStatus);
      fetchPedidos();
      setOpenStatusMenu(null);
    } catch (error) {
      console.error('Error al cambiar el estado del pedido:', error);
      alert('Error al cambiar el estado del pedido. Por favor, intente de nuevo.');
    }
  };

  const handleDeleteOrder = async (pedidoId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este pedido?')) {
      try {
        await eliminarPedido(pedidoId);
        fetchPedidos();
      } catch (error) {
        console.error('Error al eliminar el pedido:', error);
        alert('Error al eliminar el pedido. Por favor, intente de nuevo.');
      }
    }
  };

  const handleCancelOrder = async (pedidoId: string) => {
    try {
      await cancelarPedido(pedidoId);
      fetchPedidos();
    } catch (error) {
      console.error('Error al cancelar el pedido:', error);
      alert('Error al cancelar el pedido. Por favor, intente de nuevo.');
    }
  };

  const handleReactivateOrder = async (pedidoId: string) => {
    try {
      await reactivarPedido(pedidoId);
      fetchPedidos();
    } catch (error) {
      console.error('Error al reactivar el pedido:', error);
      alert('Error al reactivar el pedido. Por favor, intente de nuevo.');
    }
  };

  const filteredPedidos = pedidos.filter(pedido => {
    switch (activeTab) {
      case 'solicitado':
        return pedido.estado === 'solicitado';
      case 'capturado':
        return ['capturado', 'descargado'].includes(pedido.estado);
      case 'historial':
        return true;
      default:
        return true;
    }
  });

  return (
    <DashboardContainer>
      <Sidebar userInfo={userInfo} />
      <MainContent>
        <Header>
          <Logo src="/images/Logoweb.png" alt="Fonelli Joyería Fina" />
        </Header>
        <Title>Panel de Administrador</Title>
        <TabContainer>
          <Tab $active={activeTab === 'solicitado'} onClick={() => setActiveTab('solicitado')}>Solicitado</Tab>
          <Tab $active={activeTab === 'capturado'} onClick={() => setActiveTab('capturado')}>Capturado</Tab>
          <Tab $active={activeTab === 'historial'} onClick={() => setActiveTab('historial')}>Historial</Tab>
        </TabContainer>
        <OrderList>
          {filteredPedidos.map((pedido) => (
            <OrderContainer key={pedido.id}>
              <OrderContent>
                <OrderHeader>
                  <OrderTitle>Pedido - ID {pedido.id}</OrderTitle>
                  <OrderStatus $canceled={pedido.cancelado}>
                    ({pedido.estado})
                    {pedido.cancelado && ' (Cancelado)'}
                  </OrderStatus>
                </OrderHeader>
                <OrderTable>
                  <TableHeader>Modelo</TableHeader>
                  <TableHeader>N° de piezas</TableHeader>
                  <TableHeader>Talla</TableHeader>
                  <TableHeader>Kilataje</TableHeader>
                  <TableHeader>Color</TableHeader>
                  
                  <TableCell>{pedido.modelo}</TableCell>
                  <TableCell>{pedido.numero_piezas}</TableCell>
                  <TableCell>{pedido.talla}</TableCell>
                  <TableCell>{pedido.kilataje}</TableCell>
                  <TableCell>{pedido.color}</TableCell>
                  
                  <TableHeader>Inicial</TableHeader>
                  <TableHeader>Nombre</TableHeader>
                  <TableHeader>Piedra</TableHeader>
                  <TableHeader>Largo</TableHeader>
                  <TableHeader>Observaciones</TableHeader>
                  
                  <TableCell>{pedido.inicial}</TableCell>
                  <TableCell>{pedido.nombre_pedido}</TableCell>
                  <TableCell>{pedido.piedra}</TableCell>
                  <TableCell>{pedido.largo}</TableCell>
                  <ObservacionesCell>{pedido.observaciones}</ObservacionesCell>
                </OrderTable>
                </OrderContent>
              <ButtonContainer>
                <StatusButtonContainer>
                  <PrimaryButton onClick={() => setOpenStatusMenu(openStatusMenu === pedido.id ? null : pedido.id)}>
                    Cambiar estado <ChevronDown size={16} />
                  </PrimaryButton>
                  {openStatusMenu === pedido.id && (
                    <StatusMenu>
                      <StatusMenuItem onClick={() => handleChangeStatus(pedido.id, 'solicitado')}>Solicitado</StatusMenuItem>
                      <StatusMenuItem onClick={() => handleChangeStatus(pedido.id, 'capturado')}>Capturado</StatusMenuItem>
                      <StatusMenuItem onClick={() => handleChangeStatus(pedido.id, 'descargado')}>Descargado</StatusMenuItem>
                    </StatusMenu>
                  )}
                </StatusButtonContainer>
                <SecondaryButton onClick={() => handleDeleteOrder(pedido.id)}>
                  Eliminar pedido
                </SecondaryButton>
                {pedido.cancelado ? (
                  <PrimaryButton onClick={() => handleReactivateOrder(pedido.id)}>
                    Reactivar pedido
                  </PrimaryButton>
                ) : (
                  <SecondaryButton onClick={() => handleCancelOrder(pedido.id)}>
                    Cancelar pedido
                  </SecondaryButton>
                )}
              </ButtonContainer>
            </OrderContainer>
          ))}
        </OrderList>
      </MainContent>
    </DashboardContainer>
  );
};

export default AdminDashboard;