# Blog Theme Monitor

Blog Theme Monitor 是一个用于管理和监控博客主题的工具，它提供了以下功能：

- 扫描和显示所有博客主题
- 查看主题详情和状态
- 更新和设置主题的 DID
- 启动主题进行开发
- 启动主题的 Studio 模式
- 创建 GitHub 仓库并提交主题代码

## 项目结构

- `server/`: 服务器端代码
- `client/`: 客户端代码
- `create_github_repo.sh`: GitHub 仓库创建脚本（基础版本）
- `create_github_repo_advanced.sh`: GitHub 仓库创建脚本（高级版本）

## GitHub 仓库自动创建工具

本项目包含两个 Shell 脚本，用于自动化创建 GitHub 仓库并推送本地代码的过程。

### 前提条件

- 已安装 [GitHub CLI](https://cli.github.com/)
- 已通过 `gh auth login` 登录到 GitHub

### 脚本说明

#### 1. 基础版本 (`create_github_repo.sh`)

简单易用的基础版本，适合快速创建仓库。

##### 使用方法

```bash
./create_github_repo.sh <组织名> <仓库名> [描述]
```

##### 参数说明

- `<组织名>`: 必填，GitHub 组织名称
- `<仓库名>`: 必填，要创建的仓库名称
- `[描述]`: 可选，仓库描述（默认为"通过 GitHub CLI 自动创建的仓库"）

##### 示例

```bash
./create_github_repo.sh ArcBlock my-awesome-repo "这是一个示例仓库"
```

#### 2. 高级版本 (`create_github_repo_advanced.sh`)

提供更多选项和错误处理的高级版本。

##### 使用方法

```bash
./create_github_repo_advanced.sh [选项] <组织名> <仓库名>
```

##### 选项

- `-d, --description <描述>`: 仓库描述（默认为"通过 GitHub CLI 自动创建的仓库"）
- `-v, --visibility <可见性>`: 仓库可见性，可选值：private/public/internal（默认为 private）
- `-b, --branch <分支名>`: 默认分支名（默认为 main）
- `-m, --message <提交信息>`: 初始提交信息（默认为"初始提交"）
- `-h, --help`: 显示帮助信息

##### 示例

```bash
# 创建公开仓库
./create_github_repo_advanced.sh -v public ArcBlock my-public-repo

# 指定分支名和提交信息
./create_github_repo_advanced.sh -b develop -m "初始开发代码" ArcBlock dev-project

# 完整示例
./create_github_repo_advanced.sh -d "我的项目描述" -v public -b main -m "初始代码提交" ArcBlock my-project
```

### 功能特点

两个脚本都能够：

1. 在指定的 GitHub 组织下创建一个新仓库
2. 初始化本地 git 仓库（如果尚未初始化）
3. 添加远程仓库
4. 添加所有文件并提交
5. 推送到新创建的仓库

高级版本还提供了：

1. 命令行参数解析
2. 更多选项（可见性、分支名、提交信息等）
3. 错误处理和状态检查
4. 分支管理
5. 检查是否有可提交的更改

## 启动项目

```bash
# 安装依赖
npm install

# 启动服务
npm start
```
