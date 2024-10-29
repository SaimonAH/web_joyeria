import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";
import { theme } from "../styles/theme";
import { Package, Users, LogOut } from "lucide-react";

const SidebarContainer = styled.div`
  width: 300px;
  background-color: ${theme.colors.secondary};
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const TopSpacer = styled.div`
  height: 40px;
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;

const UserRole = styled.div`
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: ${theme.colors.primary};
  background-color: white;
  padding: 5px 10px;
  border-radius: 15px;
`;

const ProfileImage = styled.img`
  width: 220px;
  height: 220px;
  border-radius: 50%;
  border: 3px solid ${theme.colors.primary};
  margin-bottom: 10px;
  object-fit: cover;
`;

const UserName = styled.h2`
  font-size: 1.2rem;
  text-align: center;
`;

const MenuSection = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const MenuItem = styled.div`
  padding: 10px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  &:hover {
    background-color: ${theme.colors.primary};
  }
  border-radius: 10px;
  margin-bottom: 10px;
`;

const MenuItemText = styled.span`
  margin-left: 10px;
`;

interface SidebarProps {
  userInfo: {
    nombre?: string;
    imagen_url?: string;
    rol?: string;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ userInfo }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavigation = (path: string) => {
    if (userInfo.rol === "admin") {
      navigate(`/admin${path}`);
    } else {
      navigate(`/vendedor${path}`);
    }
  };

  return (
    <SidebarContainer>
      <TopSpacer />
      <ProfileSection>
        <UserRole>{userInfo?.rol || "Usuario"}</UserRole>
        <ProfileImage
          src={userInfo?.imagen_url || "/images/default-profile.png"}
          alt="Profile"
        />
        <UserName>{userInfo?.nombre || "Usuario"}</UserName>
      </ProfileSection>

      <MenuSection>
        <MenuItem onClick={() => handleNavigation("/dashboard")}>
          <Package size={24} />
          <MenuItemText>Gestión de Pedidos</MenuItemText>
        </MenuItem>
        <MenuItem onClick={() => handleNavigation("/user-administration")}>
          <Users size={24} />
          <MenuItemText>Administración de Usuarios</MenuItemText>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogOut size={24} />
          <MenuItemText>Cerrar sesión</MenuItemText>
        </MenuItem>
      </MenuSection>
    </SidebarContainer>
  );
};

export default Sidebar;
