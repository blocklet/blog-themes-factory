import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 2rem;
`;

const HomeButton = styled(Link)`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  text-decoration: none;
  display: inline-block;

  &:hover {
    background-color: #2980b9;
    text-decoration: none;
  }
`;

function NotFound() {
  return (
    <Container>
      <Title>404</Title>
      <Message>页面不存在</Message>
      <HomeButton to="/">返回首页</HomeButton>
    </Container>
  );
}

export default NotFound;
