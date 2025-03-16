# Blog Themes Factory

这是一个博客主题工厂项目，用于管理和开发多种博客主题。项目包含一个主题监控工具和多个独立的博客主题。

## 项目结构

- `blog-theme-monitor/`: 博客主题监控工具，用于管理和监控所有主题
- `.cursor/`: Cursor IDE 配置和规则
- 各个主题目录: 作为 git submodule 引入的独立主题项目

## 主题列表

- `base_blog_theme/`: 基础博客主题，作为其他主题的模板
- `cartoon-wonderland-theme/`: 卡通仙境主题
- `cyber-neon-theme/`: 赛博霓虹主题
- `futuristic-tech-theme/`: 未来科技主题
- `nature-vista-theme/`: 自然风景主题
- `steampunk-chronicle-theme/`: 蒸汽朋克编年史主题
- `vintage-nostalgia-theme/`: 复古怀旧主题

## 使用方法

### 克隆仓库及其子模块

```bash
git clone --recursive https://github.com/blocklet/blog-themes-factory.git
cd blog-themes-factory
```

### 使用主题监控工具

```bash
cd blog-theme-monitor
npm install
npm start
```

详细使用说明请参考 [blog-theme-monitor/README.md](blog-theme-monitor/README.md)。

## 开发新主题

请参考 [.cursor/rules/create-new-theme-rules.mdc](.cursor/rules/create-new-theme-rules.mdc) 了解如何创建新主题。

## 许可证

MIT
