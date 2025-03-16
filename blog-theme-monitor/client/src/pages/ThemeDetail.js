import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  getThemeById,
  updateThemeDid,
  setThemeDid,
  launchTheme,
  launchThemeStudio,
  checkGitRemote,
  checkSubmoduleStatus,
  createGitHubRepo,
  deleteTheme,
  refreshThemes,
  checkThemeBundle,
} from "../services/api";
import Status from "../components/Status";

const Container = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ecf0f1;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ThemeLogo = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: contain;
  background-color: #f8f9fa;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
`;

const BackButton = styled(Link)`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;
  text-decoration: none;
  display: inline-block;

  &:hover {
    background-color: #2980b9;
    text-decoration: none;
  }
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.4rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ecf0f1;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 0.5rem 1rem;
`;

const Label = styled.div`
  font-weight: bold;
  color: #7f8c8d;
`;

const Value = styled.div`
  color: #2c3e50;
`;

const Warning = styled.span`
  color: #e74c3c;
  font-weight: bold;
  margin-left: 0.5rem;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
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

const UpdateButton = styled(Button)`
  background-color: #2ecc71;
  width: 100%;
  padding: 1rem;
  font-size: 1.2rem;

  &:hover {
    background-color: #27ae60;
  }
`;

const LaunchButton = styled(Button)`
  background-color: #3498db;
  margin-top: 1rem;
  width: 100%;
  padding: 1rem;
  font-size: 1.2rem;

  &:hover {
    background-color: #2980b9;
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const InputGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const ServerLink = styled.a`
  display: inline-block;
  color: #3498db;
  text-decoration: none;
  margin-top: 0.5rem;
  font-weight: bold;

  &:hover {
    text-decoration: underline;
  }
`;

const CommandBox = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;
  position: relative;
`;

const CommandText = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
  font-size: 0.9rem;
  color: #2c3e50;
  padding-right: ${(props) =>
    props.showCopyButton ? "40px" : "0"}; // 根据是否显示复制按钮调整右侧padding
`;

const CopyButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2980b9;
  }
`;

const StatusMessage = styled.div`
  color: #e67e22;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  font-style: italic;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const StudioButton = styled(Button)`
  background-color: #9b59b6;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  font-size: 1.2rem;
  width: 100%;

  &:hover {
    background-color: #8e44ad;
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const StudioIcon = styled.span`
  font-size: 1.2rem;
`;

const FeatureList = styled.ul`
  margin-top: 1rem;
  padding-left: 1.5rem;
  color: #34495e;
`;

const FeatureItem = styled.li`
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FeatureIcon = styled.span`
  color: #9b59b6;
  font-weight: bold;
`;

const StudioInfoBox = styled.div`
  background-color: #f0e6f6;
  border: 1px solid #d5b8e0;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
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

const GitHubButton = styled(ActionButton)`
  background-color: #24292e;
  color: white;

  &:hover {
    background-color: #1b1f23;
  }

  &:disabled {
    background-color: #586069;
    cursor: not-allowed;
  }
`;

const GitHubLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #24292e;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1b1f23;
    color: white;
  }
`;

const DeleteButton = styled(ActionButton)`
  background-color: #e74c3c;
  color: white;
  margin-top: 1rem;

  &:hover {
    background-color: #c0392b;
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  padding: 1rem;
  background-color: #fdf2f2;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const BundleButton = styled(Button)`
  background-color: #f39c12;
  width: 100%;
  padding: 1rem;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background-color: #d35400;
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const BundleIcon = styled.span`
  font-size: 1.2rem;
`;

const BundleResultBox = styled.div`
  background-color: ${(props) => (props.success ? "#e8f5e9" : "#ffebee")};
  border: 1px solid ${(props) => (props.success ? "#a5d6a7" : "#ef9a9a")};
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;
`;

// 添加子模块状态相关的样式
const SubmoduleStatus = styled.div`
  margin-top: 1rem;
  padding: 0.8rem;
  border-radius: 4px;
  background-color: ${(props) => (props.isSubmodule ? "#e8f5e9" : "#fff3e0")};
  border: 1px solid ${(props) => (props.isSubmodule ? "#a5d6a7" : "#ffe0b2")};
`;

const SubmoduleStatusTitle = styled.div`
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: ${(props) => (props.isSubmodule ? "#2e7d32" : "#ef6c00")};
`;

const SubmoduleStatusText = styled.div`
  color: #37474f;
  font-size: 0.9rem;
`;

function ThemeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSetting, setIsSetting] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isLaunchingStudio, setIsLaunchingStudio] = useState(false);
  const [didValue, setDidValue] = useState("");
  const [pollingActive, setPollingActive] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);
  const [lastPollingTime, setLastPollingTime] = useState(null);
  const [command, setCommand] = useState("");
  const [copied, setCopied] = useState(false);
  const [gitRemoteInfo, setGitRemoteInfo] = useState(null);
  const [isCheckingGit, setIsCheckingGit] = useState(false);
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCheckingBundle, setIsCheckingBundle] = useState(false);
  const [bundleResult, setBundleResult] = useState(null);
  const [isSubmodule, setIsSubmodule] = useState(false);
  const [isCheckingSubmodule, setIsCheckingSubmodule] = useState(false);
  const [submoduleError, setSubmoduleError] = useState("");

  const fetchTheme = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getThemeById(id);
      setTheme(data);
      setDidValue(data.did || "");

      // 如果主题状态为"就绪"，直接生成启动命令
      if (data.status === "就绪") {
        setCommand(`cd ${data.path} && yarn run update:deps && blocklet dev`);
      }

      // 检查 git 远程仓库配置
      try {
        const gitInfo = await checkGitRemote(id);
        // 将 gitInfo 添加到主题对象中
        setTheme((prevTheme) => ({
          ...prevTheme,
          gitInfo,
        }));
        setGitRemoteInfo(gitInfo);

        // 如果有 origin 远程仓库，设置仓库 URL
        if (gitInfo.hasOrigin) {
          const originRemote = gitInfo.remotes.find(
            (r) => r.name === "origin" && r.type === "fetch",
          );
          if (originRemote) {
            let url = originRemote.url;
            // 将 SSH URL 转换为 HTTPS URL 以便在浏览器中打开
            if (url.startsWith("git@github.com:")) {
              url = url.replace("git@github.com:", "https://github.com/").replace(/\.git$/, "");
            } else if (url.startsWith("https://") && url.endsWith(".git")) {
              url = url.replace(/\.git$/, "");
            }
            setRepoUrl(url);
          }
        }
      } catch (gitError) {
        console.error(`检查主题 ${id} 的 git 远程仓库配置失败:`, gitError);
        // 设置一个空的 gitInfo 对象，避免 undefined 错误
        setTheme((prevTheme) => ({
          ...prevTheme,
          gitInfo: { hasRemote: false, isGitRepo: false, remotes: [], repoUrl: null },
        }));
      }
    } catch (err) {
      console.error(`获取主题 ${id} 失败:`, err);
      setError(`获取主题 ${id} 失败，请稍后再试`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDid = async () => {
    if (
      window.confirm(
        `确定要更新主题 "${id}" 的 DID 吗？\n这将执行 blocklet create --did-only 命令，并可能覆盖现有的 DID`,
      )
    ) {
      try {
        setIsUpdating(true);
        setError("");
        const result = await updateThemeDid(id);
        setTheme(result.theme);
        setDidValue(result.theme.did || "");

        // 如果更新成功且状态为"就绪"，自动设置启动命令
        if (result.theme.status === "就绪") {
          setCommand(`cd ${result.theme.path} && yarn run update:deps && blocklet dev`);
        }

        alert("DID 更新成功！");
      } catch (err) {
        setError("更新 DID 失败，请稍后再试");
        console.error(err);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleSetDid = async () => {
    if (!didValue.trim()) {
      alert("请输入有效的 DID");
      return;
    }

    if (window.confirm(`确定要手动设置主题 "${id}" 的 DID 为 "${didValue}" 吗？`)) {
      try {
        setIsSetting(true);
        setError("");
        const result = await setThemeDid(id, didValue);
        setTheme(result.theme);
        alert("DID 设置成功！");
      } catch (err) {
        setError("设置 DID 失败，请稍后再试");
        console.error(err);
      } finally {
        setIsSetting(false);
      }
    }
  };

  const handleCopyCommand = (commandText) => {
    navigator.clipboard
      .writeText(commandText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // 2秒后重置复制状态
      })
      .catch((err) => {
        console.error("复制失败:", err);
        alert("复制失败，请手动选择并复制命令");
      });
  };

  const handleLaunchStudio = async () => {
    try {
      setIsLaunchingStudio(true);
      const result = await launchThemeStudio(id);
      alert(
        "已成功启动主题的 Studio 模式！\n\n" +
          "Studio 模式提供了可视化的主题编辑界面，您可以：\n" +
          "• 更新主题 Logo 和图标\n" +
          "• 添加和管理主题截图\n" +
          "请在浏览器中查看 Studio 界面，完成编辑后关闭终端窗口即可。",
      );
    } catch (error) {
      console.error("启动 Studio 模式失败:", error);
      alert("启动 Studio 模式失败，请稍后再试");
    } finally {
      setIsLaunchingStudio(false);
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
      second: "2-digit",
    });
  };

  // 检查 git 远程仓库配置
  const checkGitRemoteStatus = async () => {
    try {
      setIsCheckingGit(true);
      setError("");
      const remoteInfo = await checkGitRemote(id);
      setGitRemoteInfo(remoteInfo);

      // 更新主题对象中的 gitInfo
      setTheme((prevTheme) => ({
        ...prevTheme,
        gitInfo: remoteInfo,
      }));

      // 如果有 origin 远程仓库，设置仓库 URL
      if (remoteInfo.hasOrigin) {
        const originRemote = remoteInfo.remotes.find(
          (r) => r.name === "origin" && r.type === "fetch",
        );
        if (originRemote) {
          let url = originRemote.url;
          // 将 SSH URL 转换为 HTTPS URL 以便在浏览器中打开
          if (url.startsWith("git@github.com:")) {
            url = url.replace("git@github.com:", "https://github.com/").replace(/\.git$/, "");
          } else if (url.startsWith("https://") && url.endsWith(".git")) {
            url = url.replace(/\.git$/, "");
          }
          setRepoUrl(url);
        }
      }

      // 如果有远程仓库，检查子模块状态
      if (remoteInfo.hasRemote) {
        checkSubmoduleStatusHandler();
      }
    } catch (err) {
      console.error(`检查主题 ${id} 的 git 远程仓库配置失败:`, err);
      setError(`检查 Git 仓库配置失败，请稍后再试`);

      // 设置一个空的 gitInfo 对象，避免 undefined 错误
      setTheme((prevTheme) => ({
        ...prevTheme,
        gitInfo: { hasRemote: false, isGitRepo: false, remotes: [], repoUrl: null },
      }));
    } finally {
      setIsCheckingGit(false);
    }
  };

  // 创建 GitHub 仓库并提交代码
  const handleCreateGitHubRepo = async () => {
    if (window.confirm(`确定要为主题 "${theme.name || id}" 创建 GitHub 仓库并提交代码吗？`)) {
      try {
        setIsCreatingRepo(true);
        setError("");
        const result = await createGitHubRepo(id);

        if (result.success) {
          setRepoUrl(result.repoUrl);

          // 重新检查 git 远程仓库配置
          await checkGitRemoteStatus();

          // 显示包含子模块更新状态的成功消息
          let message = `GitHub 仓库创建成功！\n仓库地址: ${result.repoUrl}`;

          if (result.submoduleUpdate) {
            message += `\n\n子模块状态: ${
              result.submoduleUpdate.status === "added" ? "已添加" : "已更新"
            }`;
            message += `\n${result.submoduleUpdate.message}`;
          } else if (result.submoduleUpdateError) {
            message += `\n\n子模块更新失败: ${result.submoduleUpdateError}`;
            message += `\n请手动运行 setup_submodules_fix.sh 脚本更新子模块。`;
          }

          alert(message);
        }
      } catch (err) {
        console.error(`为主题 ${id} 创建 GitHub 仓库失败:`, err);
        setError(`创建 GitHub 仓库失败，请稍后再试`);
      } finally {
        setIsCreatingRepo(false);
      }
    }
  };

  // 删除主题
  const handleDeleteTheme = async () => {
    // 显示确认弹窗
    if (
      window.confirm(
        `确定要删除主题 "${
          theme.title || id
        }" 吗？\n\n此操作将永久删除主题目录及其所有文件，且无法恢复！`,
      )
    ) {
      // 二次确认
      if (
        window.confirm(
          `再次确认：您确定要删除主题 "${theme.title || id}" 吗？\n\n删除后将无法恢复！`,
        )
      ) {
        try {
          setIsDeleting(true);
          setError("");
          const result = await deleteTheme(id);

          if (result.success) {
            alert(`主题 "${theme.title || id}" 已成功删除！`);
            // 刷新主题列表
            await refreshThemes();
            // 跳转回列表页面
            navigate("/");
          }
        } catch (err) {
          console.error(`删除主题 ${id} 失败:`, err);
          setError(`删除主题失败: ${err.message || "未知错误"}`);
          setIsDeleting(false);
        }
      }
    }
  };

  const handleCheckBundle = async () => {
    try {
      setIsCheckingBundle(true);
      setBundleResult(null);
      const result = await checkThemeBundle(id);
      setBundleResult(result);
    } catch (error) {
      console.error("检查 bundle 功能失败:", error);
      setError("检查 bundle 功能失败，请稍后再试");
    } finally {
      setIsCheckingBundle(false);
    }
  };

  // 检查子模块状态
  const checkSubmoduleStatusHandler = async () => {
    try {
      setIsCheckingSubmodule(true);
      setSubmoduleError("");

      const result = await checkSubmoduleStatus(id);

      if (result.success) {
        setIsSubmodule(result.isSubmodule);
      } else {
        setSubmoduleError(result.error || "检查子模块状态失败");
      }
    } catch (err) {
      console.error(`检查主题 ${id} 的子模块状态失败:`, err);
      setSubmoduleError("检查子模块状态失败，请稍后再试");
    } finally {
      setIsCheckingSubmodule(false);
    }
  };

  useEffect(() => {
    fetchTheme();

    // 清理函数
    return () => {
      // 重置状态，避免在组件卸载后仍然尝试更新状态
      setTheme(null);
      setGitRemoteInfo(null);
      setIsSubmodule(false);
    };
  }, [id]);

  // 监听主题状态变化，当状态变为"就绪"时自动设置启动命令
  useEffect(() => {
    if (theme && theme.status === "就绪") {
      setCommand(`cd ${theme.path} && yarn run update:deps && blocklet dev`);
    }
  }, [theme?.status]);

  // 在组件加载和 git 远程仓库状态更新后检查子模块状态
  useEffect(() => {
    if (theme && theme.gitInfo && theme.gitInfo.hasRemote) {
      checkSubmoduleStatusHandler();
    }
  }, [theme?.gitInfo?.hasRemote]);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return (
      <Container>
        <Header>
          <TitleContainer>
            {theme.logo ? (
              <ThemeLogo src={theme.logo} alt={`${theme.title} logo`} />
            ) : (
              <ThemeLogo src="https://via.placeholder.com/60?text=No+Logo" alt="No logo" />
            )}
            <Title>主题详情</Title>
          </TitleContainer>
          <BackButton to="/">返回列表</BackButton>
        </Header>
        <div className="error">{error}</div>
      </Container>
    );
  }

  if (!theme) {
    return (
      <Container>
        <Header>
          <TitleContainer>
            {theme.logo ? (
              <ThemeLogo src={theme.logo} alt={`${theme.title} logo`} />
            ) : (
              <ThemeLogo src="https://via.placeholder.com/60?text=No+Logo" alt="No logo" />
            )}
            <Title>主题详情</Title>
          </TitleContainer>
          <BackButton to="/">返回列表</BackButton>
        </Header>
        <div className="empty-state">
          <h3>未找到主题</h3>
          <p>找不到 ID 为 {id} 的主题</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <TitleContainer>
          {theme.logo ? (
            <ThemeLogo src={theme.logo} alt={`${theme.title} logo`} />
          ) : (
            <ThemeLogo src="https://via.placeholder.com/60?text=No+Logo" alt="No logo" />
          )}
          <Title>{theme.title}</Title>
        </TitleContainer>
        <BackButton to="/">返回列表</BackButton>
      </Header>

      <Section>
        <SectionTitle>基本信息</SectionTitle>
        <InfoGrid>
          <Label>ID</Label>
          <Value>{theme.id}</Value>

          <Label>名称</Label>
          <Value>{theme.name || "无"}</Value>

          <Label>标题</Label>
          <Value>{theme.title}</Value>

          <Label>描述</Label>
          <Value>{theme.description || "无描述"}</Value>

          <Label>路径</Label>
          <Value>{theme.path}</Value>

          <Label>DID</Label>
          <Value>
            {theme.did ? theme.did : <Warning>无</Warning>}
            {theme.needsDidUpdate && <Warning>(需要更新)</Warning>}
          </Value>

          <Label>状态</Label>
          <Value>
            <Status status={theme.status} />
          </Value>

          <Label>创建时间</Label>
          <Value>{formatDate(theme.createdAt)}</Value>

          <Label>更新时间</Label>
          <Value>{formatDate(theme.updatedAt)}</Value>
        </InfoGrid>
      </Section>

      <Section>
        <SectionTitle>DID 管理</SectionTitle>
        <p>您可以通过以下方式更新或设置主题的 Blocklet DID：</p>

        <Actions>
          <UpdateButton onClick={handleUpdateDid} disabled={isUpdating}>
            {isUpdating ? "更新中..." : "自动更新 DID (使用 blocklet create --did-only)"}
          </UpdateButton>
        </Actions>
      </Section>

      <Section>
        <SectionTitle>主题操作</SectionTitle>
        <StudioInfoBox>
          <h4 style={{ margin: "0 0 0.5rem 0", color: "#8e44ad" }}>Studio 模式</h4>
          <p style={{ margin: "0 0 0.5rem 0" }}>
            Studio 模式提供了可视化的主题编辑界面，可以帮助您：
          </p>
          <FeatureList>
            <FeatureItem>
              <FeatureIcon>✓</FeatureIcon>更新主题 Logo 和图标
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>✓</FeatureIcon>添加和管理主题截图 (Screenshots)
            </FeatureItem>
          </FeatureList>
          <ButtonGroup>
            <StudioButton
              onClick={handleLaunchStudio}
              disabled={isLaunchingStudio || theme.status !== "就绪"}>
              <StudioIcon>🎨</StudioIcon>
              {isLaunchingStudio ? "启动中..." : "启动 Studio 模式"}
            </StudioButton>
          </ButtonGroup>
          {theme.status !== "就绪" && (
            <StatusMessage style={{ marginTop: "0.5rem" }}>
              主题当前状态为"{theme.status}"，尚未就绪，无法启动 Studio
              模式。请等待主题准备就绪后再尝试启动。
            </StatusMessage>
          )}
        </StudioInfoBox>

        <h4 style={{ margin: "1.5rem 0 0.5rem 0", color: "#2980b9" }}>常规启动命令</h4>
        <p style={{ margin: "0 0 0.5rem 0" }}>如需直接启动主题进行开发，请复制并执行以下命令：</p>
        <CommandBox id="command-box">
          <CommandText showCopyButton={theme.status === "就绪"}>{command}</CommandText>
          {theme.status === "就绪" ? (
            <CopyButton onClick={() => handleCopyCommand(command)}>
              {copied ? "已复制!" : "复制"}
            </CopyButton>
          ) : (
            <StatusMessage>
              主题当前状态为"{theme.status}"，尚未就绪，无法启动。请等待主题准备就绪后再尝试启动。
            </StatusMessage>
          )}
        </CommandBox>
      </Section>

      <Section>
        <SectionTitle>Bundle 检查</SectionTitle>
        <p>检查主题是否能成功执行 bundle 命令，确保主题可以正常打包：</p>
        <ButtonGroup>
          <BundleButton onClick={handleCheckBundle} disabled={isCheckingBundle}>
            <BundleIcon>📦</BundleIcon>
            {isCheckingBundle ? "检查中..." : "检查 Bundle 功能"}
          </BundleButton>
        </ButtonGroup>

        {bundleResult && (
          <BundleResultBox success={bundleResult.bundleSuccess}>
            <h4
              style={{
                margin: "0 0 0.5rem 0",
                color: bundleResult.bundleSuccess ? "#2e7d32" : "#c62828",
              }}>
              {bundleResult.bundleSuccess ? "Bundle 检查成功" : "Bundle 检查失败"}
            </h4>
            <p style={{ margin: "0 0 0.5rem 0" }}>{bundleResult.message}</p>
            {!bundleResult.bundleSuccess && (
              <div>
                <p style={{ color: "#c62828", fontWeight: "bold" }}>错误详情：</p>
                <pre
                  style={{
                    backgroundColor: "#ffebee",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    maxHeight: "200px",
                    overflow: "auto",
                    fontSize: "0.8rem",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}>
                  {bundleResult.error}
                </pre>
              </div>
            )}
          </BundleResultBox>
        )}
      </Section>

      <Section>
        <SectionTitle>Git 仓库</SectionTitle>
        {error && (
          <ErrorMessage>
            {error}{" "}
            <Button
              onClick={() => {
                setError("");
                checkGitRemoteStatus();
              }}
              style={{ marginLeft: "1rem" }}>
              重试
            </Button>
          </ErrorMessage>
        )}

        {isCheckingGit ? (
          <div>正在检查 Git 远程仓库配置...</div>
        ) : !theme.gitInfo ? (
          <div>
            <p>正在加载 Git 仓库信息...</p>
            <Button onClick={() => checkGitRemoteStatus()} style={{ marginTop: "1rem" }}>
              重新检查 Git 仓库
            </Button>
          </div>
        ) : (
          <div>
            {theme.gitInfo.isGitRepo ? (
              theme.gitInfo.hasRemote ? (
                <div>
                  <p>此主题已关联 GitHub 仓库:</p>
                  <div style={{ marginTop: "1rem" }}>
                    <GitHubLink
                      href={repoUrl || theme.gitInfo.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer">
                      <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                      </svg>
                      在 GitHub 上查看
                    </GitHubLink>
                  </div>
                </div>
              ) : (
                <div>
                  <p>此主题尚未关联 GitHub 仓库。</p>
                  <p style={{ marginTop: "0.5rem", color: "#7f8c8d" }}>
                    如果您对这个主题满意，请创建GitHub仓库以保存它。如果不满意，可以立即删除它。
                  </p>
                  <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                    <GitHubButton onClick={handleCreateGitHubRepo} disabled={isCreatingRepo}>
                      {isCreatingRepo ? "正在创建..." : "创建 GitHub 仓库并提交"}
                    </GitHubButton>
                    <DeleteButton
                      onClick={handleDeleteTheme}
                      disabled={isDeleting}
                      title="如果您对这个主题不满意，可以删除它">
                      {isDeleting ? "正在删除..." : "删除主题"}
                    </DeleteButton>
                  </div>
                </div>
              )
            ) : (
              <div>
                <p>此目录尚未初始化为 Git 仓库。</p>
                <p style={{ marginTop: "0.5rem", color: "#7f8c8d" }}>
                  如果您对这个主题满意，请初始化并创建GitHub仓库以保存它。如果不满意，可以立即删除它。
                </p>
                <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                  <GitHubButton onClick={handleCreateGitHubRepo} disabled={isCreatingRepo}>
                    {isCreatingRepo ? "正在创建..." : "初始化并创建 GitHub 仓库"}
                  </GitHubButton>
                  <DeleteButton
                    onClick={handleDeleteTheme}
                    disabled={isDeleting}
                    title="如果您对这个主题不满意，可以删除它">
                    {isDeleting ? "正在删除..." : "删除主题"}
                  </DeleteButton>
                </div>
              </div>
            )}

            {/* 添加子模块状态信息 */}
            {theme.gitInfo.hasRemote && (
              <div style={{ marginTop: "1rem" }}>
                <h4>子模块状态</h4>
                {isCheckingSubmodule ? (
                  <div>正在检查子模块状态...</div>
                ) : submoduleError ? (
                  <div style={{ color: "red" }}>{submoduleError}</div>
                ) : (
                  <SubmoduleStatus isSubmodule={isSubmodule}>
                    <SubmoduleStatusTitle isSubmodule={isSubmodule}>
                      {isSubmodule ? "已添加为子模块" : "尚未添加为子模块"}
                    </SubmoduleStatusTitle>
                    <SubmoduleStatusText>
                      {isSubmodule
                        ? "此主题已在主仓库中设置为 Git 子模块。"
                        : "此主题尚未在主仓库中设置为 Git 子模块。当您创建 GitHub 仓库时，系统将自动尝试添加为子模块。"}
                    </SubmoduleStatusText>
                  </SubmoduleStatus>
                )}
              </div>
            )}
          </div>
        )}
      </Section>
    </Container>
  );
}

export default ThemeDetail;
