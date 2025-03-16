const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs-extra");
const { exec } = require("child_process");
const yaml = require("js-yaml");

// 创建 Express 应用
const app = express();
const PORT = process.env.PORT || 3007;

// 工作目录
const WORKSPACE_DIR = path.resolve(__dirname, "../../");
// 基础主题目录
const BASE_THEME_DIR = path.join(WORKSPACE_DIR, "base_blog_theme");
// 基础主题的 DID
const BASE_THEME_DID = "z2qa2aCch4YEq6m9Qd5GnYRo76yhwfuHEKRTF";

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务，用于提供主题 logo 文件
app.use("/theme-logos", express.static(WORKSPACE_DIR));

// 主题数据
const themes = [];

// API 路由
const apiRouter = express.Router();

// 获取所有主题
apiRouter.get("/themes", async (req, res) => {
  console.log("收到获取主题请求");

  // 为每个主题添加 GitHub 仓库信息
  const themesWithGitInfo = await Promise.all(
    themes.map(async (theme) => {
      try {
        // 检查 git 远程仓库配置
        const gitInfo = await new Promise((resolve, reject) => {
          exec(`cd ${theme.path} && git remote -v`, (error, stdout, stderr) => {
            if (error) {
              // 如果是因为不是 git 仓库导致的错误，返回特定状态
              if (error.message.includes("not a git repository")) {
                return resolve({ hasRemote: false, isGitRepo: false, remotes: [], repoUrl: null });
              }
              return resolve({ hasRemote: false, isGitRepo: false, remotes: [], repoUrl: null });
            }

            // 解析远程仓库信息
            const remotes = [];
            const lines = stdout.trim().split("\n");

            for (const line of lines) {
              const parts = line.trim().split(/\s+/);
              if (parts.length >= 2) {
                remotes.push({
                  name: parts[0],
                  url: parts[1],
                  type: parts[2] ? parts[2].replace(/[()]/g, "") : "fetch",
                });
              }
            }

            // 检查是否有 origin 远程仓库
            const hasOrigin = remotes.some((remote) => remote.name === "origin");

            // 如果有 origin 远程仓库，设置仓库 URL
            let repoUrl = null;
            if (hasOrigin) {
              const originRemote = remotes.find((r) => r.name === "origin" && r.type === "fetch");
              if (originRemote) {
                let url = originRemote.url;
                // 将 SSH URL 转换为 HTTPS URL 以便在浏览器中打开
                if (url.startsWith("git@github.com:")) {
                  url = url.replace("git@github.com:", "https://github.com/").replace(/\.git$/, "");
                } else if (url.startsWith("https://") && url.endsWith(".git")) {
                  url = url.replace(/\.git$/, "");
                }
                repoUrl = url;
              }
            }

            resolve({
              hasRemote: remotes.length > 0,
              isGitRepo: true,
              remotes,
              hasOrigin,
              repoUrl,
            });
          });
        });

        return {
          ...theme,
          gitInfo,
        };
      } catch (err) {
        console.error(`检查主题 ${theme.id} 的 git 远程仓库配置失败:`, err);
        return {
          ...theme,
          gitInfo: { hasRemote: false, isGitRepo: false, remotes: [], repoUrl: null },
        };
      }
    }),
  );

  res.json(themesWithGitInfo);
});

// 获取单个主题
apiRouter.get("/themes/:id", (req, res) => {
  const { id } = req.params;
  const theme = themes.find((t) => t.id === id);

  if (!theme) {
    return res.status(404).json({ error: "主题不存在" });
  }

  // 检查主题是否正在运行但没有 serverUrl
  if (theme.isRunning && theme.process && !theme.serverUrl) {
    console.log(`主题 ${id} 正在运行，但尚未获取到服务器URL，尝试从进程输出中提取...`);

    // 这里不做任何操作，因为我们已经在 spawn 的回调中设置了 serverUrl
    // 这只是为了记录日志，表明我们知道这种情况
  }

  console.log(`返回主题 ${id} 的信息:`, {
    ...theme,
    process: theme.process ? "进程正在运行" : "无进程",
  });

  res.json(theme);
});

// 添加一个路由专门用于获取主题 logo
apiRouter.get("/themes/:id/logo", (req, res) => {
  const { id } = req.params;
  const theme = themes.find((t) => t.id === id);

  if (!theme) {
    return res.status(404).json({ error: "主题不存在" });
  }

  const logoPath = path.join(theme.path, "logo.png");

  if (fs.existsSync(logoPath)) {
    return res.sendFile(logoPath);
  } else {
    return res.status(404).json({ error: "Logo 不存在" });
  }
});

// 执行 blocklet create --did-only 命令
apiRouter.post("/themes/:id/update-did", (req, res) => {
  const { id } = req.params;
  const theme = themes.find((t) => t.id === id);

  if (!theme) {
    return res.status(404).json({ error: "主题不存在" });
  }

  console.log(`开始更新主题 ${id} 的 DID...`);

  // 执行命令
  exec(`cd ${theme.path} && blocklet create --did-only`, (error, stdout, stderr) => {
    if (error) {
      console.error(`执行命令出错: ${error}`);
      return res.status(500).json({ error: "执行命令失败", details: error.message });
    }

    if (stderr) {
      console.error(`命令错误输出: ${stderr}`);
    }

    console.log(`命令输出: ${stdout}`);

    // 直接打印完整的命令输出，用于调试
    console.log("完整命令输出:");
    console.log(stdout);

    // 使用更简单直接的方法提取DID
    const lines = stdout.split("\n");
    let newDid = null;

    // 遍历每一行寻找包含"Created Blocklet DID:"的行
    for (const line of lines) {
      console.log(`检查行: ${line}`);
      if (line.includes("Created Blocklet DID:")) {
        console.log(`找到包含DID的行: ${line}`);
        // 提取DID
        const parts = line.split("Created Blocklet DID:");
        if (parts.length > 1) {
          newDid = parts[1].trim();
          // 清除ANSI颜色代码
          newDid = newDid.replace(/\u001b\[\d+m/g, "");
          console.log(`提取到DID（清除颜色代码后）: ${newDid}`);
          break;
        }
      }
    }

    if (newDid) {
      console.log(`成功提取到新的 DID: ${newDid}`);

      const blockletYmlPath = path.join(theme.path, "blocklet.yml");

      if (!fs.existsSync(blockletYmlPath)) {
        return res.status(404).json({ error: "blocklet.yml 文件不存在" });
      }

      // 使用 Promise 链式调用替代 await
      fs.readFile(blockletYmlPath, "utf-8")
        .then((content) => {
          // 使用 js-yaml 解析
          let yamlContent;
          try {
            yamlContent = yaml.load(content);
          } catch (yamlError) {
            console.error(`YAML 解析失败: ${theme.path}`, yamlError);
            return Promise.reject({
              status: 500,
              error: "YAML 解析失败",
              details: yamlError.message,
            });
          }

          // 更新 did 属性
          yamlContent.did = newDid;

          // 将更新后的内容写回文件
          return fs.writeFile(blockletYmlPath, yaml.dump(yamlContent), "utf-8").then(() => {
            // 更新主题信息
            Object.assign(theme, {
              did: newDid,
              needsDidUpdate: false,
              updatedAt: new Date(),
              status: "就绪",
            });

            console.log(`主题 ${id} 的 DID 已更新为: ${newDid}`);
            res.json({ success: true, theme });
          });
        })
        .catch((error) => {
          if (error.status) {
            res.status(error.status).json({ error: error.error, details: error.details });
          } else {
            console.error(`更新主题 DID 失败: ${error}`);
            res.status(500).json({ error: "更新主题 DID 失败", details: error.message });
          }
        });
    } else {
      // 如果没有找到 DID，返回错误
      console.error("命令执行成功，但未能从输出中提取 DID");
      res.status(500).json({
        error: "未能从命令输出中提取 DID",
        details: "请检查命令输出",
        output: stdout,
      });
    }
  });
});

// 手动更新主题的 DID 属性
apiRouter.post("/themes/:id/set-did", async (req, res) => {
  const { id } = req.params;
  const { did } = req.body;

  if (!did) {
    return res.status(400).json({ error: "缺少 DID 参数" });
  }

  const theme = themes.find((t) => t.id === id);

  if (!theme) {
    return res.status(404).json({ error: "主题不存在" });
  }

  console.log(`开始手动设置主题 ${id} 的 DID 为 ${did}...`);

  try {
    const blockletYmlPath = path.join(theme.path, "blocklet.yml");

    if (!fs.existsSync(blockletYmlPath)) {
      return res.status(404).json({ error: "blocklet.yml 文件不存在" });
    }

    // 读取 blocklet.yml 文件
    const content = await fs.readFile(blockletYmlPath, "utf-8");

    // 使用 js-yaml 解析
    let yamlContent;
    try {
      yamlContent = yaml.load(content);
    } catch (yamlError) {
      console.error(`YAML 解析失败: ${theme.path}`, yamlError);
      return res.status(500).json({ error: "YAML 解析失败", details: yamlError.message });
    }

    // 更新 did 属性
    yamlContent.did = did;

    // 将更新后的内容写回文件
    await fs.writeFile(blockletYmlPath, yaml.dump(yamlContent), "utf-8");

    // 更新主题信息
    Object.assign(theme, {
      did,
      needsDidUpdate: false,
      updatedAt: new Date(),
    });

    console.log(`主题 ${id} 的 DID 已手动更新为: ${did}`);
    res.json({ success: true, theme });
  } catch (error) {
    console.error(`更新主题 DID 失败: ${error}`);
    res.status(500).json({ error: "更新主题 DID 失败", details: error.message });
  }
});

// 手动刷新主题列表
apiRouter.post("/themes/refresh", async (req, res) => {
  try {
    await scanThemes();
    res.json({ success: true, themes });
  } catch (error) {
    console.error("刷新主题失败:", error);
    res.status(500).json({ error: "刷新主题失败", details: error.message });
  }
});

// 启动主题
apiRouter.post("/themes/:id/launch", async (req, res) => {
  const { id } = req.params;
  const theme = themes.find((t) => t.id === id);

  if (!theme) {
    return res.status(404).json({ error: "主题不存在" });
  }

  // 检查主题状态是否为"就绪"
  if (theme.status !== "就绪") {
    return res.status(400).json({
      error: "主题未就绪",
      details: "只有状态为'就绪'的主题才能启动",
      currentStatus: theme.status,
    });
  }

  // 返回启动命令
  const command = `cd ${theme.path} && yarn run update:deps && blocklet dev`;

  res.json({
    success: true,
    theme,
    command,
    message: "请在终端中执行以下命令启动主题",
  });
});

// 启动主题的 Studio 模式
apiRouter.post("/themes/:id/launch-studio", async (req, res) => {
  const { id } = req.params;
  const theme = themes.find((t) => t.id === id);

  if (!theme) {
    return res.status(404).json({ error: "主题不存在" });
  }

  // 检查主题状态是否为"就绪"
  if (theme.status !== "就绪") {
    return res.status(400).json({
      error: "主题未就绪",
      details: "只有状态为'就绪'的主题才能启动",
      currentStatus: theme.status,
    });
  }

  // 构建命令
  const command = `cd ${theme.path} && blocklet dev studio`;

  console.log(`正在启动主题 ${id} 的 Studio 模式，执行命令: ${command}`);
  console.log(`Studio 模式将允许用户更新主题的 Logo、Screenshots 和元数据`);

  // 执行命令
  const childProcess = exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`执行 Studio 命令出错: ${error}`);
      // 这里不返回错误，因为我们已经向客户端发送了响应
    }

    if (stderr) {
      console.error(`Studio 命令错误输出: ${stderr}`);
    }

    if (stdout) {
      console.log(`Studio 命令输出: ${stdout}`);

      // 尝试从输出中提取 Studio URL
      const urlMatch = stdout.match(/(https?:\/\/[^\s]+)/);
      if (urlMatch && urlMatch[1]) {
        console.log(`检测到 Studio 模式 URL: ${urlMatch[1]}`);
      }
    }
  });

  // 设置进程错误处理
  childProcess.on("error", (error) => {
    console.error(`Studio 进程错误: ${error.message}`);
  });

  // 立即返回成功响应，不等待命令完成
  res.json({
    success: true,
    message: "已启动主题的 Studio 模式，可用于更新主题 Logo、Screenshots 和元数据",
    theme,
  });
});

// 检查主题的 bundle 功能
apiRouter.post("/themes/:id/check-bundle", async (req, res) => {
  const { id } = req.params;
  const theme = themes.find((t) => t.id === id);

  if (!theme) {
    return res.status(404).json({ error: "主题不存在" });
  }

  console.log(`正在检查主题 ${id} 的 bundle 功能，执行命令: cd ${theme.path} && yarn run bundle`);

  // 执行 bundle 命令
  exec(
    `cd ${theme.path} && NODE_OPTIONS="--max-old-space-size=6144" yarn run bundle yarn run bundle`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`执行 bundle 命令出错: ${error}`);
        return res.json({
          success: false,
          bundleSuccess: false,
          message: "Bundle 检查失败，需要人工介入处理",
          error: error.message,
          stdout,
          stderr,
          theme,
        });
      }

      if (stderr) {
        console.error(`Bundle 命令错误输出: ${stderr}`);
      }

      console.log(`Bundle 命令输出: ${stdout}`);

      // 返回成功响应
      res.json({
        success: true,
        bundleSuccess: true,
        message: "Bundle 检查成功，主题可以正常打包",
        stdout,
        theme,
      });
    },
  );
});

// 检查主题的 git 远程仓库配置
apiRouter.get("/themes/:id/git-remote", (req, res) => {
  const { id } = req.params;
  const theme = themes.find((t) => t.id === id);

  if (!theme) {
    return res.status(404).json({ error: "主题不存在" });
  }

  // 执行 git 命令检查远程仓库配置
  exec(`cd ${theme.path} && git remote -v`, (error, stdout, stderr) => {
    if (error) {
      console.error(`检查远程仓库配置失败: ${error.message}`);
      // 如果是因为不是 git 仓库导致的错误，返回特定状态
      if (error.message.includes("not a git repository")) {
        return res.json({ hasRemote: false, isGitRepo: false, remotes: [] });
      }
      return res.status(500).json({ error: `检查远程仓库配置失败: ${error.message}` });
    }

    // 解析远程仓库信息
    const remotes = [];
    const lines = stdout.trim().split("\n");

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        remotes.push({
          name: parts[0],
          url: parts[1],
          type: parts[2] ? parts[2].replace(/[()]/g, "") : "fetch",
        });
      }
    }

    // 检查是否有 origin 远程仓库
    const hasOrigin = remotes.some((remote) => remote.name === "origin");

    res.json({
      hasRemote: remotes.length > 0,
      isGitRepo: true,
      remotes,
      hasOrigin,
    });
  });
});

// 创建 GitHub 仓库并提交代码
apiRouter.post("/themes/:id/create-github-repo", (req, res) => {
  const { id } = req.params;
  const theme = themes.find((t) => t.id === id);

  if (!theme) {
    return res.status(404).json({ error: "主题不存在" });
  }

  // 获取主题目录名作为仓库名
  const repoName = path.basename(theme.path);
  const orgName = "blocklet"; // 使用固定的组织名
  const description = `${theme.name || repoName} - A blog theme created with Blocklet`;

  // 执行创建仓库脚本
  const scriptPath = path.join(__dirname, "../create_github_repo.sh");

  exec(
    `${scriptPath} ${orgName} ${repoName} "${description}"`,
    { cwd: theme.path },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`创建 GitHub 仓库失败: ${error.message}`);
        return res
          .status(500)
          .json({ error: `创建 GitHub 仓库失败: ${error.message}`, details: stderr });
      }

      console.log(`GitHub 仓库创建成功: ${stdout}`);

      // 返回成功信息和仓库 URL
      res.json({
        success: true,
        message: "GitHub 仓库创建成功",
        repoUrl: `https://github.com/${orgName}/${repoName}`,
        output: stdout,
      });
    },
  );
});

// 删除主题
apiRouter.delete("/themes/:id", async (req, res) => {
  const { id } = req.params;
  const themeIndex = themes.findIndex((t) => t.id === id);

  if (themeIndex === -1) {
    return res.status(404).json({ error: "主题不存在" });
  }

  const theme = themes[themeIndex];
  console.log(`准备删除主题: ${id}, 路径: ${theme.path}`);

  try {
    // 删除主题目录
    await fs.remove(theme.path);
    console.log(`已删除主题目录: ${theme.path}`);

    // 从主题列表中移除
    themes.splice(themeIndex, 1);

    res.json({
      success: true,
      message: `主题 ${id} 已成功删除`,
    });
  } catch (error) {
    console.error(`删除主题 ${id} 失败:`, error);
    res.status(500).json({
      error: `删除主题失败: ${error.message}`,
    });
  }
});

// 使用 API 路由
app.use("/api", apiRouter);

// 读取 blocklet.yml 文件内容
async function readBlockletYml(dirPath) {
  try {
    const blockletYmlPath = path.join(dirPath, "blocklet.yml");

    if (!fs.existsSync(blockletYmlPath)) {
      console.log(`${blockletYmlPath} 不存在`);
      return {};
    }

    const content = await fs.readFile(blockletYmlPath, "utf-8");

    // 尝试使用 yaml 解析
    try {
      const yamlContent = yaml.load(content);
      console.log(`成功解析 ${dirPath} 的 YAML:`, yamlContent);
      return {
        title: yamlContent.title || "",
        description: yamlContent.description || "",
        did: yamlContent.did || "",
      };
    } catch (yamlError) {
      console.error(`YAML 解析失败: ${dirPath}`, yamlError);

      // 如果 YAML 解析失败，使用正则表达式
      const result = {};

      // 提取 description
      const descriptionMatch = content.match(/description:\s*(.+?)(\n|$)/);
      if (descriptionMatch && descriptionMatch[1]) {
        result.description = descriptionMatch[1].trim();
      }

      // 提取 did
      const didMatch = content.match(/did:\s*(.+?)(\n|$)/);
      if (didMatch && didMatch[1]) {
        result.did = didMatch[1].trim();
      }

      // 提取 title
      const titleMatch = content.match(/title:\s*(.+?)(\n|$)/);
      if (titleMatch && titleMatch[1]) {
        result.title = titleMatch[1].trim();
      }

      console.log(`使用正则表达式解析结果:`, result);
      return result;
    }
  } catch (error) {
    console.error(`读取 blocklet.yml 失败: ${dirPath}`, error);
    return {};
  }
}

// 读取主题信息
async function readThemeInfo(dirPath) {
  try {
    const blockletYmlInfo = await readBlockletYml(dirPath);
    const packageJsonPath = path.join(dirPath, "package.json");

    let name = "";

    if (fs.existsSync(packageJsonPath)) {
      const packageJsonContent = await fs.readFile(packageJsonPath, "utf-8");
      try {
        const packageJson = JSON.parse(packageJsonContent);
        name = packageJson.name || "";
      } catch (jsonError) {
        console.error(`解析 package.json 失败: ${dirPath}`, jsonError);
      }
    }

    // 检查是否存在 logo.png 文件
    const logoPath = path.join(dirPath, "logo.png");
    const hasLogo = fs.existsSync(logoPath);

    return {
      title: blockletYmlInfo.title || "",
      description: blockletYmlInfo.description || "",
      did: blockletYmlInfo.did || "",
      name,
      hasLogo,
      logoPath: hasLogo ? logoPath : null,
    };
  } catch (error) {
    console.error(`获取主题信息失败: ${dirPath}`, error);
    return {};
  }
}

// 扫描主题目录
async function scanThemes() {
  try {
    // 清空主题列表
    themes.length = 0;

    // 读取基础主题的 DID
    const baseThemeInfo = await readThemeInfo(BASE_THEME_DIR);
    const baseThemeDid = baseThemeInfo.did || BASE_THEME_DID;

    console.log(`基础主题 DID: ${baseThemeDid}`);

    const dirs = fs.readdirSync(WORKSPACE_DIR);

    for (const dir of dirs) {
      const dirPath = path.join(WORKSPACE_DIR, dir);
      const stats = fs.statSync(dirPath);

      if (
        stats.isDirectory() &&
        dir.includes("theme") &&
        dir !== "blog-theme-monitor" &&
        dir !== "base_blog_theme"
      ) {
        // 检查是否包含 blocklet.yml 和 package.json 文件
        const hasBlockletYml = fs.existsSync(path.join(dirPath, "blocklet.yml"));
        const hasPackageJson = fs.existsSync(path.join(dirPath, "package.json"));

        if (hasBlockletYml && hasPackageJson) {
          // 读取主题信息
          const themeInfo = await readThemeInfo(dirPath);

          // 获取或创建主题的创建时间
          const createdAt = await getOrCreateThemeCreationTime(dirPath);

          // 检查 DID 是否需要更新
          const needsDidUpdate = themeInfo.did === baseThemeDid || !themeInfo.did;

          // 构建 logo URL
          const logoUrl = themeInfo.hasLogo ? `/api/themes/${dir}/logo` : null;

          // 设置主题状态
          let status = "就绪";
          if (needsDidUpdate) {
            status = "需要更新";
          } else if (!themeInfo.did) {
            status = "无 DID";
          }

          // 添加主题
          themes.push({
            id: dir,
            name: themeInfo.name || dir,
            path: dirPath,
            title: themeInfo.title || dir,
            description: themeInfo.description || "",
            did: themeInfo.did || "",
            needsDidUpdate,
            createdAt: createdAt,
            updatedAt: new Date(),
            status,
            logo: logoUrl,
          });

          console.log(
            `主题已添加: ${dir}, 描述: ${themeInfo.description || "无"}, DID: ${
              themeInfo.did || "无"
            }, 需要更新 DID: ${needsDidUpdate}, 状态: ${status}, Logo: ${
              logoUrl || "无"
            }, 创建时间: ${new Date(createdAt).toLocaleString()}`,
          );
        }
      }
    }

    // 按创建时间倒序排序
    themes.sort((a, b) => b.createdAt - a.createdAt);

    console.log(`共发现 ${themes.length} 个主题，已按创建时间倒序排列`);
  } catch (error) {
    console.error("扫描主题目录失败:", error);
  }
}

// 获取或创建主题的创建时间
async function getOrCreateThemeCreationTime(themePath) {
  const metadataPath = path.join(themePath, ".theme-metadata.json");

  try {
    // 检查元数据文件是否存在
    if (fs.existsSync(metadataPath)) {
      // 读取现有的元数据文件
      const metadata = JSON.parse(await fs.readFile(metadataPath, "utf-8"));
      if (metadata.createdAt) {
        return new Date(metadata.createdAt).getTime();
      }
    }

    // 如果元数据文件不存在或没有创建时间，创建新的元数据
    const now = new Date();
    const metadata = {
      createdAt: now.toISOString(),
      createdBy: "blog-theme-monitor",
    };

    // 写入元数据文件
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");
    console.log(
      `为主题 ${path.basename(themePath)} 创建了元数据文件，记录创建时间: ${now.toLocaleString()}`,
    );

    return now.getTime();
  } catch (error) {
    console.error(`获取或创建主题创建时间失败: ${themePath}`, error);
    // 如果出错，使用当前时间作为备选
    return Date.now();
  }
}

// 在生产环境中提供静态文件
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
} else {
  // 在开发环境中重定向到前端开发服务器
  app.get("/", (req, res) => {
    res.redirect("http://localhost:3008");
  });
}

// 启动服务器
app.listen(PORT, async () => {
  console.log(`主题监控服务运行在 http://localhost:${PORT}`);

  // 扫描主题
  await scanThemes();
});
