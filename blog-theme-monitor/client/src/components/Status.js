import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

// 状态颜色映射
const STATUS_COLORS = {
  就绪: "#2ecc71",
  错误: "#e74c3c",
  初始化: "#3498db",
  需要更新: "#e67e22",
  "无 DID": "#f39c12",
  // 默认颜色
  default: "#f1c40f",
};

// 状态组件样式
const StatusContainer = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  min-width: 80px;
  text-align: center;
  background-color: ${(props) => STATUS_COLORS[props.status] || STATUS_COLORS.default};
  color: white;
`;

/**
 * 通用状态组件
 * @param {Object} props - 组件属性
 * @param {string} props.status - 状态值
 * @returns {JSX.Element} 状态组件
 */
const Status = ({ status }) => {
  return <StatusContainer status={status}>{status}</StatusContainer>;
};

Status.propTypes = {
  status: PropTypes.string.isRequired,
};

export default Status;
