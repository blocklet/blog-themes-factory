#!/bin/bash

# 检查参数
if [ $# -lt 2 ]; then
    echo "用法: $0 <组织名> <仓库名> [描述]"
    exit 1
fi

ORG_NAME=$1
REPO_NAME=$2
DESCRIPTION=${3:-"通过GitHub CLI自动创建的仓库"}

echo "正在为组织 $ORG_NAME 创建仓库 $REPO_NAME..."

# 创建GitHub仓库
gh repo create "$ORG_NAME/$REPO_NAME" --private --description "$DESCRIPTION" --confirm

# 检查是否已经初始化了git
if [ ! -d .git ]; then
    echo "初始化本地git仓库..."
    git init
fi

# 添加远程仓库
git remote add origin "https://github.com/$ORG_NAME/$REPO_NAME.git"

# 添加所有文件
echo "添加所有文件..."
git add .

# 提交
echo "提交更改..."
git commit -m "初始提交"

# 推送到GitHub
echo "推送到GitHub..."
git push -u origin main || git push -u origin master

echo "完成！仓库已创建并推送到 https://github.com/$ORG_NAME/$REPO_NAME" 