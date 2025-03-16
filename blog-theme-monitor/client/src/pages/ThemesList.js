import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { getAllThemes, refreshThemes } from "../services/api";
import Status from "../components/Status";

const ThemesContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const ThemesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ecf0f1;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
`;

const RefreshButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2980b9;
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const ThemesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 2px solid #ecf0f1;
  color: #7f8c8d;
  font-weight: 600;
`;

const DidTableHeader = styled(TableHeader)`
  min-width: 250px;
`;

const TableRow = styled.tr`
  &:hover {
    background-color: #f8f9fa;
  }
  border-bottom: 1px solid #ecf0f1;
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  vertical-align: middle;
`;

const ThemeNameCell = styled(TableCell)`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ThemeLogo = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: contain;
  background-color: #f8f9fa;
`;

const ThemeInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const DidTableCell = styled(TableCell)`
  word-break: break-all;
`;

const ThemeLink = styled(Link)`
  color: #2c3e50;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    color: #3498db;
    text-decoration: none;
  }
`;

const Warning = styled.span`
  color: #e74c3c;
  font-weight: bold;
  margin-left: 0.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
`;

// 添加 GitHub 链接样式
const GitHubLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #24292e;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

// 添加置灰的 GitHub 图标样式
const DisabledGitHubIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #bdc3c7;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: default;
`;

function ThemesList() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllThemes();
      setThemes(data);
    } catch (err) {
      console.error("获取主题失败:", err);
      setError("获取主题失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");
      await refreshThemes();
      await fetchThemes();
    } catch (err) {
      console.error("刷新主题失败:", err);
      setError("刷新主题失败，请稍后再试");
    } finally {
      setRefreshing(false);
    }
  };

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

  useEffect(() => {
    fetchThemes();

    // 每 30 秒自动刷新一次
    const interval = setInterval(() => {
      fetchThemes();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <ThemesContainer>
        <ThemesHeader>
          <Title>主题列表</Title>
          <RefreshButton onClick={handleRefresh} disabled={refreshing || loading}>
            {refreshing ? "刷新中..." : "刷新"}
          </RefreshButton>
        </ThemesHeader>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <div className="loading">加载中...</div>
        ) : themes.length === 0 ? (
          <EmptyState>
            <h3>暂无主题</h3>
            <p>请创建新的主题</p>
          </EmptyState>
        ) : (
          <ThemesTable>
            <thead>
              <tr>
                <TableHeader>主题名称</TableHeader>
                <DidTableHeader>DID</DidTableHeader>
                <TableHeader>状态</TableHeader>
                <TableHeader>创建时间</TableHeader>
                <TableHeader style={{ width: "80px", textAlign: "center" }}>GitHub</TableHeader>
              </tr>
            </thead>
            <tbody>
              {themes.map((theme) => (
                <TableRow key={theme.id}>
                  <ThemeNameCell>
                    {theme.logo ? (
                      <ThemeLogo src={theme.logo} alt={`${theme.title} logo`} />
                    ) : (
                      <ThemeLogo src="https://via.placeholder.com/40?text=No+Logo" alt="No logo" />
                    )}
                    <ThemeInfo>
                      <ThemeLink to={`/themes/${theme.id}`}>{theme.title}</ThemeLink>
                      <div style={{ fontSize: "0.85rem", color: "#7f8c8d", marginTop: "0.25rem" }}>
                        {theme.description || "无描述"}
                      </div>
                    </ThemeInfo>
                  </ThemeNameCell>
                  <DidTableCell>
                    {theme.did ? theme.did : <Warning>无</Warning>}
                    {theme.needsDidUpdate && <Warning>(需要更新)</Warning>}
                  </DidTableCell>
                  <TableCell>
                    <Status status={theme.status} />
                  </TableCell>
                  <TableCell>{formatDate(theme.createdAt)}</TableCell>
                  <TableCell style={{ textAlign: "center" }}>
                    {theme.gitInfo && theme.gitInfo.hasOrigin && theme.gitInfo.repoUrl ? (
                      <GitHubLink
                        href={theme.gitInfo.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="在 GitHub 上查看">
                        <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                        </svg>
                      </GitHubLink>
                    ) : (
                      <DisabledGitHubIcon title="未配置 GitHub 仓库">
                        <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                        </svg>
                      </DisabledGitHubIcon>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </ThemesTable>
        )}
      </ThemesContainer>
    </div>
  );
}

export default ThemesList;
