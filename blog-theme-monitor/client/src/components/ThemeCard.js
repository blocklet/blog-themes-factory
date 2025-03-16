import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Status from "./Status";

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const Title = styled(Link)`
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  display: block;
  text-decoration: none;

  &:hover {
    color: #3498db;
    text-decoration: none;
  }
`;

const Description = styled.p`
  color: #7f8c8d;
  margin-bottom: 1rem;
  font-size: 0.95rem;
`;

const InfoItem = styled.div`
  margin-bottom: 0.5rem;
`;

const Label = styled.span`
  font-weight: bold;
  margin-right: 0.5rem;
`;

const Meta = styled.div`
  font-size: 0.85rem;
  color: #95a5a6;
  margin-top: 1rem;
`;

const Warning = styled.span`
  color: #e74c3c;
  font-weight: bold;
  margin-left: 0.5rem;
`;

function ThemeCard({ theme }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <Title to={`/themes/${theme.id}`}>{theme.title}</Title>
      <Description>{theme.description || "无描述"}</Description>

      <InfoItem>
        <Label>路径:</Label>
        {theme.path.split("/").pop()}
      </InfoItem>

      <InfoItem>
        <Label>DID:</Label>
        {theme.did ? theme.did : <Warning>无</Warning>}
        {theme.needsDidUpdate && <Warning>(需要更新)</Warning>}
      </InfoItem>

      <InfoItem>
        <Label>状态:</Label>
        <Status status={theme.status} />
      </InfoItem>

      <Meta>
        <span>创建: {formatDate(theme.createdAt)}</span>
      </Meta>
    </Card>
  );
}

export default ThemeCard;
