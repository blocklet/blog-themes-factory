import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const HeaderContainer = styled.header`
  background-color: #2c3e50;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;

  &:hover {
    text-decoration: none;
  }
`;

const Subtitle = styled.p`
  color: #ecf0f1;
  font-size: 0.9rem;
  margin-top: 0.25rem;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const NavLink = styled(Link)`
  color: #ecf0f1;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    text-decoration: none;
  }
`;

function Header() {
  return (
    <HeaderContainer>
      <HeaderContent className="container">
        <div>
          <Logo to="/">博客主题监控</Logo>
          <Subtitle>监控和管理博客主题的状态和 DID</Subtitle>
        </div>
        <Nav>
          <NavLink to="/">主题列表</NavLink>
        </Nav>
      </HeaderContent>
    </HeaderContainer>
  );
}

export default Header;
