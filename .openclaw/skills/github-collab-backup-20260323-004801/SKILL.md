# GitHub 协同开发技能 v2.0

## 概述
本技能实现复杂任务的自动化拆解和通过 GitHub 进行多 Agent 协同开发。支持任务分析、仓库创建、Agent 分配、进度跟踪、定时任务和项目分类管理。

## 核心功能

### 1. 任务分析拆解
- 使用 stp 技能对复杂任务进行结构化分析
- 自动将任务拆解为编码、测试、文档三类 TODO
- 生成详细的项目计划和时间表

### 2. GitHub 项目管理
- 自动创建新仓库或初始化现有仓库
- 按任务类型创建对应的 Issues
- 管理项目板和标签
- 自动提交代码和文档

### 3. Agent 协同分配
- **Coder Agent**: 负责编码任务开发
- **Checker Agent**: 负责测试验证和问题修复
- **Memowriter Agent**: 负责文档编写和项目说明

### 4. 多项目异步排队
- 支持多项目任务并发处理
- 队列化管理，批量执行
- 项目状态追踪和错误处理

### 5. 关联仓库管理
- 大型项目关联多个仓库
- 父子项目关系管理
- 跨仓库依赖追踪

### 6. 项目分类管理
- 按项目地址分类管理进度
- 自定义分类标签
- 分类视图和筛选

### 7. 定时任务和日进度报告
- 每日自动进度报告
- 定时任务调度器
- 项目状态监控

## 使用方式

### 基本命令
```
/stp [任务描述] --github-collab
```

### 项目队列管理
```bash
# 添加项目到队列
node scripts/main.js add <repo-name> <description> <visibility>

# 处理队列
node scripts/main.js queue
```

### 项目分类管理
```bash
# 创建分类
node scripts/project-manager.js category <name> <description>

# 列出分类
node scripts/project-manager.js categories

# 分配项目到分类
node scripts/project-manager.js assign <repo-name> <category>

# 按分类列出项目
node scripts/project-manager.js list <category>
```

### 关联仓库管理
```bash
# 关联仓库
node scripts/project-manager.js link <repo-name> <parent-repo> <category>

# 查看项目列表
node scripts/project-manager.js list
```

### 定时任务
```bash
# 设置定时任务
node scripts/scheduler.js set <type> <time>

# 取消定时任务
node scripts/scheduler.js clear <type>

# 查看定时任务
node scripts/scheduler.js show

# 运行定时任务
node scripts/scheduler.js run

# 生成日进度报告
node scripts/scheduler.js report
```

### 项目进度
```bash
# 查看项目进度
node scripts/project-manager.js progress <repo-name>
```

## 项目结构

### 默认目录结构
```
<repo-name>/
├── README.md                 # 项目说明
├── docs/                     # 文档目录
│   ├── manual.md            # 操作手册
│   ├── api.md               # API 文档
│   └── architecture.md       # 架构设计
├── src/                      # 源代码
├── tests/                    # 测试代码
├── scripts/                  # 构建脚本
└── .github/                  # GitHub 配置
    └── workflows/           # CI/CD 工作流
```

### Skill 目录结构
```
github-collab/
├── SKILL.md                  # 技能说明文档
├── data/                     # 数据存储目录
│   ├── project-queue.json    # 项目队列
│   ├── projects.json         # 项目信息
│   ├── categories.json       # 分类配置
│   └── schedule.json         # 定时任务
└── scripts/
    ├── main.js               # 主入口脚本
    ├── task-breakdown.js     # 任务拆解
    ├── agent-assign.js       # Agent 分配
    ├── progress-report.js    # 进度报告
    ├── scheduler.js          # 定时任务调度器
    └── project-manager.js    # 项目管理器
```

## GitHub 环境配置

### 前置检查
技能会自动检查以下环境：
1. `gh` CLI 是否已安装
2. GitHub token 是否配置
3. GitHub API 权限是否足够

### 配置 GitHub Token
```bash
# 1. 安装 gh CLI
gh --version

# 2. 登录 GitHub
gh auth login

# 3. 或手动设置 token
export GH_TOKEN=your_github_token
```

### 权限要求
- repo: 完整仓库权限
- gist: Gist 权限
- read:user: 读取用户信息

## 输出

### 创建后提供
- GitHub 仓库 URL
- 项目 TODO 列表（Issues）
- 项目结构说明
- Agent 分配情况
- 每日进度报告通道

### 定时报告
- 每日项目进度汇总
- Issue 状态更新
- 代码提交统计
- 测试覆盖率

## 错误处理

### 常见错误
1. **GH_NOT_CONFIGURED**: GitHub CLI 未配置
2. **TOKEN_INVALID**: Token 无效或过期
3. **REPO_EXISTS**: 仓库已存在
4. **RATE_LIMIT**: API 调用频率限制
5. **LABEL_NOT_FOUND**: Issue 标签不存在

### 异常处理
所有错误会抛出详细异常信息，包含：
- 错误类型
- 错误原因
- 解决建议
- 配置指引

## 示例

### 创建新项目
```bash
node scripts/main.js add my-project "我的项目描述" public
node scripts/main.js queue
```

### 创建分类并分配项目
```bash
node scripts/project-manager.js category frontend "前端项目"
node scripts/project-manager.js assign my-frontend-app frontend
```

### 设置每日报告
```bash
node scripts/scheduler.js set daily-report 09:00
node scripts/scheduler.js show
```

### 关联仓库
```bash
node scripts/project-manager.js link sub-project main-project frontend
```

## 依赖技能
- `stp`: 任务规划与执行
- `sessions_spawn`: 创建子 Agent 会话
- `gh`: GitHub CLI 工具

## 版本历史
- v2.0.0: 新增多项目异步排队、定时任务、项目分类管理
- v1.1.0: 添加 Agent 分配和进度报告功能
- v1.0.0: 初始版本，支持基本协同开发功能
