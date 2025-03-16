#!/bin/bash

# 修复子模块设置的脚本
# 使用方法: ./setup_submodules_fix.sh <组织名>

# 检查参数
if [ -z "$1" ]; then
    echo "错误: 必须提供组织名"
    echo "用法: $0 <组织名>"
    exit 1
fi

ORG_NAME="$1"

# 主题目录列表
THEME_DIRS=(
    "base_blog_theme"
    "cartoon-wonderland-theme"
    "cyber-neon-theme"
    "futuristic-tech-theme"
    "nature-vista-theme"
    "steampunk-chronicle-theme"
    "vintage-nostalgia-theme"
)

# 先从索引中移除所有主题目录
echo "从 Git 索引中移除主题目录..."
for dir in "${THEME_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "移除 $dir..."
        git rm --cached "$dir"
    fi
done

# 提交更改
git commit -m "移除嵌入的 Git 仓库，准备添加为子模块"

# 检查每个目录是否存在 .git 目录
for dir in "${THEME_DIRS[@]}"; do
    if [ -d "$dir/.git" ]; then
        echo "处理 $dir..."
        
        # 获取远程仓库 URL
        cd "$dir"
        REMOTE_URL=$(git remote get-url origin 2>/dev/null)
        cd ..
        
        if [ -n "$REMOTE_URL" ]; then
            echo "发现远程仓库: $REMOTE_URL"
            
            # 添加为子模块
            git submodule add "$REMOTE_URL" "$dir"
            
            if [ $? -eq 0 ]; then
                echo "$dir 已成功添加为子模块"
            else
                echo "添加子模块 $dir 失败"
            fi
        else
            echo "警告: $dir 有 .git 目录但没有远程仓库"
        fi
    else
        echo "警告: $dir 不是 git 仓库，跳过"
    fi
done

echo "子模块设置完成"
echo "请检查 .gitmodules 文件并提交更改" 