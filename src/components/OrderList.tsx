import React from 'react';
import styled from 'styled-components';
import OrderItem from './OrderItem';
import { theme } from '../styles/theme';

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: ${theme.colors.text};
  font-size: 18px;
  margin-top: 40px;
`;

interface Order {
  id: string;
  estado: 'solicitado' | 'descargado' | 'capturado';
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

interface OrderListProps {
  orders: Order[];
  status: 'solicitado' | 'descargado' | 'capturado';
  onOrderUpdate: () => void;
}

const OrderList: React.FC<OrderListProps> = ({ orders, status, onOrderUpdate }) => {
  if (orders.length === 0) {
    return <EmptyMessage>No hay pedidos en este estado.</EmptyMessage>;
  }

  return (
    <ListContainer>
      {orders.map(order => (
        <OrderItem 
          key={order.id} 
          order={order} 
          status={status} 
          onUpdate={onOrderUpdate} 
        />
      ))}
    </ListContainer>
  );
};

export default OrderList;