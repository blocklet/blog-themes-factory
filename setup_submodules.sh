#!/bin/bash

# 设置子模块的脚本
# 使用方法: ./setup_submodules.sh <组织名>

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
            
            # 移除目录（但保留内容）
            mv "$dir" "${dir}_temp"
            
            # 添加为子模块
            git submodule add "$REMOTE_URL" "$dir"
            
            # 如果子模块添加成功，删除临时目录
            if [ $? -eq 0 ]; then
                rm -rf "${dir}_temp"
                echo "$dir 已成功添加为子模块"
            else
                # 如果失败，恢复原目录
                rm -rf "$dir"
                mv "${dir}_temp" "$dir"
                echo "添加子模块 $dir 失败，已恢复原目录"
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