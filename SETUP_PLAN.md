# Blog Themes Factory 设置计划

本文档提供了设置 Blog Themes Factory GitHub 仓库的完整步骤。

## 前提条件

- 已安装 [GitHub CLI](https://cli.github.com/)
- 已通过 `gh auth login` 登录到 GitHub
- 所有主题目录已有各自的 GitHub 仓库

## 设置步骤

### 1. 创建主仓库

使用 blog-theme-monitor 中的脚本创建主仓库：

```bash
# 进入项目根目录
cd /path/to/blog-themes-factory

# 使用高级脚本创建仓库（替换 [组织名] 为您的组织名）
bash blog-theme-monitor/create_github_repo_advanced.sh -v public -d "博客主题工厂项目，用于管理和开发多种博客主题" [组织名] blog-themes-factory
```

### 2. 设置子模块

使用我们创建的脚本将现有主题目录设置为子模块：

```bash
# 替换 [组织名] 为您的组织名
./setup_submodules.sh [组织名]
```

### 3. 提交更改

```bash
# 添加所有更改
git add .

# 提交更改
git commit -m "添加子模块并完成初始设置"

# 推送到远程仓库
git push origin main
```

### 4. 验证设置

```bash
# 验证子模块状态
git submodule status
```

## 后续使用

### 克隆仓库及其子模块

```bash
# 克隆主仓库及所有子模块
git clone --recursive https://github.com/[组织名]/blog-themes-factory.git
cd blog-themes-factory
```

### 更新子模块

```bash
# 更新所有子模块
git submodule update --remote
```

### 添加新的子模块

```bash
# 添加新的子模块
git submodule add https://github.com/[组织名]/[新主题名].git [新主题目录]
git commit -m "添加新主题: [新主题名]"
git push origin main
```

## 注意事项

- 子模块默认会被固定在特定的提交，如需更新，需要手动执行更新命令
- 在主仓库中修改子模块内容后，需要先提交子模块的更改，再提交主仓库的更改
- 删除子模块比较复杂，建议参考 Git 文档
