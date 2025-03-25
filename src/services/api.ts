import axios from "axios";
import { getToken } from "./auth";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getVendorOrders = async (vendorId: string) => {
  try {
    const response = await api.get(`/pedidos/vendedor/${vendorId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los pedidos del vendedor:", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, newStatus: string, rol?: string) => {
  try {
    const response = await api.put(`/pedidos/${orderId}/estado`, {
      nuevoEstado: newStatus,
      rol: rol,
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el estado del pedido:", error);
    throw error;
  }
};

// Nuevas funciones implementadas

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post("/usuarios/login", { email, password });
    return response.data;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error;
  }
};

export const crearUsuario = async (userData: FormData) => {
  try {
    const response = await api.post("/usuarios", userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Respuesta del servidor:", error.response.data);
    }
    throw error;
  }
};

export const obtenerUsuarios = async (rol?: string) => {
  try {
    const response = await api.get("/usuarios", { params: { rol } });
    return response.data;
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    throw error;
  }
};

export const actualizarUsuario = async (id: string, userData: FormData) => {
  try {
    const response = await api.put(`/usuarios/${id}`, userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    throw error;
  }
};

export const eliminarUsuario = async (id: string) => {
  try {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    throw error;
  }
};

export const crearPedido = async (pedidoData: any) => {
  try {
    const response = await api.post("/pedidos", pedidoData);
    return response.data;
  } catch (error) {
    console.error("Error al crear el pedido:", error);
    throw error;
  }
};

export const obtenerPedidos = async (clienteId?: string) => {
  try {
    const response = await api.get("/pedidos", {
      params: { cliente_id: clienteId },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener los pedidos:", error);
    throw error;
  }
};

export const obtenerPedidoPorId = async (id: string) => {
  try {
    const response = await api.get(`/pedidos/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el pedido:", error);
    throw error;
  }
};

export const actualizarPedido = async (id: string, pedidoData: any) => {
  try {
    const response = await api.put(`/pedidos/${id}`, pedidoData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el pedido:", error);
    throw error;
  }
};

export const eliminarPedido = async (id: string) => {
  try {
    const response = await api.delete(`/pedidos/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el pedido:", error);
    throw error;
  }
};

export const cancelarPedido = async (id: string) => {
  try {
    const response = await api.put(`/pedidos/${id}/cancelar`);
    return response.data;
  } catch (error) {
    console.error("Error al cancelar el pedido:", error);
    throw error;
  }
};

export const reactivarPedido = async (id: string) => {
  try {
    const response = await api.put(`/pedidos/${id}/reactivar`);
    return response.data;
  } catch (error) {
    console.error("Error al reactivar el pedido:", error);
    throw error;
  }
};

export const obtenerClientesDeVendedor = async (vendorId: string) => {
  try {
    const response = await api.get(`/usuarios/vendedor/${vendorId}/clientes`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los clientes del vendedor:", error);
    throw error;
  }
};