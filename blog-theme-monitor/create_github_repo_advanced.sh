#!/bin/bash

# 默认值
VISIBILITY="private"
DEFAULT_BRANCH="main"
COMMIT_MESSAGE="初始提交"

# 显示帮助信息
show_help() {
    echo "用法: $0 [选项] <组织名> <仓库名>"
    echo "选项:"
    echo "  -d, --description <描述>    仓库描述 (默认: '通过GitHub CLI自动创建的仓库')"
    echo "  -v, --visibility <可见性>   仓库可见性 (private/public/internal, 默认: private)"
    echo "  -b, --branch <分支名>       默认分支名 (默认: main)"
    echo "  -m, --message <提交信息>    初始提交信息 (默认: '初始提交')"
    echo "  -h, --help                  显示此帮助信息"
    exit 1
}

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--description)
            DESCRIPTION="$2"
            shift 2
            ;;
        -v|--visibility)
            VISIBILITY="$2"
            shift 2
            ;;
        -b|--branch)
            DEFAULT_BRANCH="$2"
            shift 2
            ;;
        -m|--message)
            COMMIT_MESSAGE="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            ;;
        *)
            if [ -z "$ORG_NAME" ]; then
                ORG_NAME="$1"
            elif [ -z "$REPO_NAME" ]; then
                REPO_NAME="$1"
            else
                echo "错误: 未知参数 $1"
                show_help
            fi
            shift
            ;;
    esac
done

# 检查必要参数
if [ -z "$ORG_NAME" ] || [ -z "$REPO_NAME" ]; then
    echo "错误: 必须提供组织名和仓库名"
    show_help
fi

# 设置默认描述（如果未提供）
DESCRIPTION=${DESCRIPTION:-"通过GitHub CLI自动创建的仓库"}

# 检查GitHub CLI是否已安装
if ! command -v gh &> /dev/null; then
    echo "错误: GitHub CLI (gh) 未安装。请先安装: https://cli.github.com/"
    exit 1
fi

# 检查GitHub认证状态
if ! gh auth status &> /dev/null; then
    echo "错误: 未登录到GitHub。请先运行 'gh auth login'"
    exit 1
fi

echo "正在为组织 $ORG_NAME 创建仓库 $REPO_NAME..."

# 创建GitHub仓库
if ! gh repo create "$ORG_NAME/$REPO_NAME" --"$VISIBILITY" --description "$DESCRIPTION" --confirm; then
    echo "错误: 创建仓库失败"
    exit 1
fi

# 检查是否已经初始化了git
if [ ! -d .git ]; then
    echo "初始化本地git仓库..."
    git init
    
    # 设置默认分支名
    git checkout -b "$DEFAULT_BRANCH"
else
    # 获取当前分支名
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [ "$CURRENT_BRANCH" != "$DEFAULT_BRANCH" ]; then
        echo "警告: 当前分支 ($CURRENT_BRANCH) 与指定的默认分支 ($DEFAULT_BRANCH) 不同"
        read -p "是否切换到 $DEFAULT_BRANCH 分支? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # 检查分支是否存在
            if git show-ref --verify --quiet "refs/heads/$DEFAULT_BRANCH"; then
                git checkout "$DEFAULT_BRANCH"
            else
                git checkout -b "$DEFAULT_BRANCH"
            fi
        fi
    fi
fi

# 检查远程仓库是否已存在
if git remote | grep -q "^origin$"; then
    echo "远程仓库 'origin' 已存在，正在更新..."
    git remote set-url origin "https://github.com/$ORG_NAME/$REPO_NAME.git"
else
    echo "添加远程仓库..."
    git remote add origin "https://github.com/$ORG_NAME/$REPO_NAME.git"
fi

# 添加所有文件
echo "添加所有文件..."
git add .

# 检查是否有可提交的更改
if git diff --cached --quiet; then
    echo "没有要提交的更改"
else
    # 提交
    echo "提交更改..."
    git commit -m "$COMMIT_MESSAGE"

    # 推送到GitHub
    echo "推送到GitHub..."
    git push -u origin "$(git rev-parse --abbrev-ref HEAD)"
fi

echo "完成！仓库已创建并推送到 https://github.com/$ORG_NAME/$REPO_NAME" 