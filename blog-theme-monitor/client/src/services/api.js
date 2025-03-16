import axios from "axios";

const API_URL = "/api";

// 创建 axios 实例
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 获取所有主题
export const getAllThemes = async () => {
  try {
    const response = await api.get("/themes");
    return response.data;
  } catch (error) {
    console.error("获取主题列表失败:", error);
    throw error;
  }
};

// 获取单个主题
export const getThemeById = async (id) => {
  try {
    const response = await api.get(`/themes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`获取主题 ${id} 失败:`, error);
    throw error;
  }
};

// 更新主题 DID
export const updateThemeDid = async (id) => {
  try {
    const response = await api.post(`/themes/${id}/update-did`);
    return response.data;
  } catch (error) {
    console.error(`更新主题 ${id} 的 DID 失败:`, error);
    throw error;
  }
};

// 手动设置主题 DID
export const setThemeDid = async (id, did) => {
  try {
    const response = await api.post(`/themes/${id}/set-did`, { did });
    return response.data;
  } catch (error) {
    console.error(`设置主题 ${id} 的 DID 失败:`, error);
    throw error;
  }
};

// 刷新主题列表
export const refreshThemes = async () => {
  try {
    const response = await api.post("/themes/refresh");
    return response.data;
  } catch (error) {
    console.error("刷新主题列表失败:", error);
    throw error;
  }
};

// 启动主题
export const launchTheme = async (id) => {
  try {
    const response = await api.post(`/themes/${id}/launch`);
    return response.data;
  } catch (error) {
    console.error(`启动主题 ${id} 失败:`, error);
    throw error;
  }
};

// 启动主题的 Studio 模式
export const launchThemeStudio = async (id) => {
  try {
    const response = await api.post(`/themes/${id}/launch-studio`);
    return response.data;
  } catch (error) {
    console.error(`启动主题 ${id} 的 Studio 模式失败:`, error);
    throw error;
  }
};

// 检查主题的 git 远程仓库配置
export const checkGitRemote = async (id) => {
  try {
    const response = await api.get(`/themes/${id}/git-remote`);
    return response.data;
  } catch (error) {
    console.error(`检查主题 ${id} 的 git 远程仓库配置失败:`, error);
    throw error;
  }
};

// 检查主题的子模块状态
export const checkSubmoduleStatus = async (id) => {
  try {
    const response = await api.get(`/themes/${id}/submodule-status`);
    return response.data;
  } catch (error) {
    console.error(`检查主题 ${id} 的子模块状态失败:`, error);
    throw error;
  }
};

// 创建 GitHub 仓库并提交代码
export const createGitHubRepo = async (id) => {
  try {
    const response = await api.post(`/themes/${id}/create-github-repo`);
    return response.data;
  } catch (error) {
    console.error(`为主题 ${id} 创建 GitHub 仓库失败:`, error);
    throw error;
  }
};

// 删除主题
export const deleteTheme = async (id) => {
  try {
    const response = await api.delete(`/themes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`删除主题 ${id} 失败:`, error);
    throw error;
  }
};

// 检查主题的 bundle 功能
export const checkThemeBundle = async (id) => {
  try {
    const response = await api.post(`/themes/${id}/check-bundle`);
    return response.data;
  } catch (error) {
    console.error(`检查主题 ${id} 的 bundle 功能失败:`, error);
    throw error;
  }
};
