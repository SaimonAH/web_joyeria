import React from "react";
import styled from "styled-components";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { updateOrderStatus } from "../services/api";
import { theme } from "../styles/theme";

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

const OrderStatus = styled.span<{ useGray?: boolean }>`
  font-size: 16px;
  color: ${(props) =>
    props.useGray === true ? theme.colors.text : theme.colors.error};
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

const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
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
  color: ${theme.colors.primary};
  border: 1px solid ${theme.colors.primary};

  &:hover {
    background-color: ${theme.colors.background};
  }
`;

const ActionLink = styled.button`
  color: ${theme.colors.primary};
  background: none;
  border: none;
  text-decoration: none;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  margin-bottom: 10px;

  &:hover {
    text-decoration: underline;
  }
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

interface OrderItemProps {
  order: Order;
  status: "solicitado" | "descargado" | "capturado";
  onUpdate: () => void;
}

export default function OrderItem({ order, status, onUpdate }: OrderItemProps) {
  const handleStatusChange = async (
    newStatus: "solicitado" | "descargado" | "capturado"
  ) => {
    try {
      await updateOrderStatus(order.id, newStatus);
      onUpdate();
    } catch (error) {
      console.error("Error al actualizar el estado del pedido:", error);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`Pedido ID: ${order.id}`, 10, 10);
    doc.text(`Estado: ${order.estado}`, 10, 20);
    doc.text(`Modelo: ${order.modelo}`, 10, 30);
    doc.text(`Número de piezas: ${order.numero_piezas}`, 10, 40);
    doc.text(`Talla: ${order.talla}`, 10, 50);
    doc.text(`Kilataje: ${order.kilataje}`, 10, 60);
    doc.text(`Color: ${order.color}`, 10, 70);
    doc.text(`Inicial: ${order.inicial}`, 10, 80);
    doc.text(`Nombre del pedido: ${order.nombre_pedido}`, 10, 90);
    doc.text(`Piedra: ${order.piedra}`, 10, 100);
    doc.text(`Largo: ${order.largo}`, 10, 110);
    doc.text(`Observaciones: ${order.observaciones}`, 10, 120);
    doc.text(`Cancelado: ${order.cancelado ? "Sí" : "No"}`, 10, 130);
    return doc;
  };

  const handleDownloadPDF = () => {
    const doc = generatePDF();
    doc.save(`pedido_${order.id}.pdf`);
  };

  const handleDownloadXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet([order]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pedido");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, `pedido_${order.id}.xlsx`);
  };

  const handleDownloadFolio = () => {
    handleStatusChange("descargado");
  };

  return (
    <OrderContainer>
      <OrderContent>
        <OrderHeader>
          <OrderTitle>Pedido - ID {order.id}</OrderTitle>
          {
            <OrderStatus useGray={!order.cancelado}>
              ({order.estado})
            </OrderStatus>
          }
          {order.cancelado && <OrderStatus>(Cancelado)</OrderStatus>}
        </OrderHeader>
        <OrderTable>
          <TableHeader>Modelo</TableHeader>
          <TableHeader>N° de piezas</TableHeader>
          <TableHeader>Talla</TableHeader>
          <TableHeader>Kilataje</TableHeader>
          <TableHeader>Color</TableHeader>

          <TableCell>{order.modelo}</TableCell>
          <TableCell>{order.numero_piezas}</TableCell>
          <TableCell>{order.talla}</TableCell>
          <TableCell>{order.kilataje}</TableCell>
          <TableCell>{order.color}</TableCell>

          <TableHeader>Inicial</TableHeader>
          <TableHeader>Nombre</TableHeader>
          <TableHeader>Piedra</TableHeader>
          <TableHeader>Largo</TableHeader>
          <TableHeader>Observaciones</TableHeader>

          <TableCell>{order.inicial}</TableCell>
          <TableCell>{order.nombre_pedido}</TableCell>
          <TableCell>{order.piedra}</TableCell>
          <TableCell>{order.largo}</TableCell>
          <ObservacionesCell>{order.observaciones}</ObservacionesCell>
        </OrderTable>
      </OrderContent>
      <ButtonContainer>
        <ActionContainer>
          {status === "solicitado" && (
            <ActionLink onClick={handleDownloadFolio}>
              Descargar folio
            </ActionLink>
          )}
          {status === "descargado" && (
            <ActionLink onClick={() => handleStatusChange("capturado")}>
              Capturar pedido
            </ActionLink>
          )}
        </ActionContainer>
        <ButtonGroup>
          <PrimaryButton onClick={handleDownloadPDF}>
            Descargar PDF
          </PrimaryButton>
          <SecondaryButton onClick={handleDownloadXLSX}>
            Descargar XLSX
          </SecondaryButton>
        </ButtonGroup>
      </ButtonContainer>
    </OrderContainer>
  );
}
