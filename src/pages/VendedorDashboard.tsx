import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Sidebar from "../components/Sidebar";
import OrderList from "../components/OrderList";
import { isAuthenticated, getUserInfo } from "../services/auth";
import { getVendorOrders } from "../services/api";
import { theme } from "../styles/theme";

const DashboardContainer = styled.div`
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
  background-color: ${(props) =>
    props.$active ? theme.colors.primary : "transparent"};
  color: ${(props) => (props.$active ? theme.colors.white : theme.colors.text)};
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  font-weight: ${(props) => (props.$active ? "bold" : "normal")};
  &:hover {
    background-color: ${(props) =>
      props.$active ? theme.colors.primary : theme.colors.gray};
  }
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  margin: 20px;
  text-align: center;
  font-size: 18px;
`;

interface Order {
  id: string;
  estado: "solicitado" | "descargado" | "capturado";
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

const VendedorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "solicitado" | "descargado" | "capturado" | "historial"
  >("solicitado");
  const [orders, setOrders] = useState<Order[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    } else {
      const storedUserInfo = getUserInfo();
      if (storedUserInfo) {
        setUserInfo(storedUserInfo);
        fetchOrders(storedUserInfo.id);
      } else {
        setError(
          "No se encontró la información del usuario. Por favor, inicie sesión nuevamente."
        );
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (userInfo) {
      fetchOrders(userInfo.id);
    }
  }, [activeTab, userInfo]);

  const fetchOrders = async (vendorId: string) => {
    try {
      const vendorOrders = await getVendorOrders(vendorId);
      // Si estamos en la pestaña historial, no aplicamos filtro por estado.
      const filteredOrders =
        activeTab === "historial"
          ? vendorOrders
          : vendorOrders.filter((order: Order) => order.estado === activeTab);
      setOrders(filteredOrders);
    } catch (error) {
      console.error("Error al obtener los pedidos:", error);
      setError(
        "No se pudieron cargar los pedidos. Por favor, intente de nuevo más tarde."
      );
    }
  };

  const handleTabChange = (
    tab: "solicitado" | "descargado" | "capturado" | "historial"
  ) => {
    setActiveTab(tab);
  };

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (!userInfo) {
    return <div>Cargando...</div>;
  }

  return (
    <DashboardContainer>
      <Sidebar userInfo={userInfo} />
      <MainContent>
        <Header>
          <Logo src="/images/Logoweb.png" alt="Fonelli Joyería Fina" />
        </Header>
        <Title>Panel de Vendedor</Title>
        <TabContainer>
          <Tab
            $active={activeTab === "solicitado"}
            onClick={() => handleTabChange("solicitado")}
          >
            Solicitado
          </Tab>
          <Tab
            $active={activeTab === "descargado"}
            onClick={() => handleTabChange("descargado")}
          >
            Descargado
          </Tab>
          <Tab
            $active={activeTab === "capturado"}
            onClick={() => handleTabChange("capturado")}
          >
            Capturado
          </Tab>
          <Tab
            $active={activeTab === "historial"}
            onClick={() => handleTabChange("historial")}
          >
            Historial
          </Tab>
        </TabContainer>
        <OrderList
          orders={orders}
          status={activeTab !== "historial" ? activeTab : "capturado"}
          onOrderUpdate={() => fetchOrders(userInfo.id)}
        />
      </MainContent>
    </DashboardContainer>
  );
};

export default VendedorDashboard;
