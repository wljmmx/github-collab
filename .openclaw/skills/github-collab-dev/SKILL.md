# GitHub 协同开发技能

## 概述
本技能实现复杂任务的自动化拆解和通过 GitHub 进行多 Agent 协同开发。支持任务分析、仓库创建、Agent 分配、进度跟踪和自动提交。

## 功能特性

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

### 4. 进度跟踪
- 每日定时反馈项目进度
- 更新 Issue 状态和评论
- 生成进度报告和测试报告

## 使用方式

### 基本命令
```
/stp [任务描述] --github-collab
```

### 完整参数
```
/stp [任务描述] --github-collab
  --repo-name <仓库名称>
  --repo-desc <仓库描述>
  --visibility <public|private>
  --assign-coder <coder agent 名称>
  --assign-checker <checker agent 名称>
  --assign-writer <writer agent 名称>
  --schedule <定时任务频率>
```

### 参数说明
- `--repo-name`: 仓库名称，默认自动生成
- `--repo-desc`: 仓库描述
- `--visibility`: 仓库可见性，默认 private
- `--assign-coder`: 分配编码任务的 Agent
- `--assign-checker`: 分配测试任务的 Agent
- `--assign-writer`: 分配文档任务的 Agent
- `--schedule`: 进度报告频率，默认 daily

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

### 文档规范
- 使用 Markdown 格式
- 支持 Mermaid 图表
- 包含架构图、流程图、时序图

## 测试框架

### 单元测试
- 根据项目语言选择合适的测试框架
- 生成测试覆盖率报告
- 集成到 CI/CD 流程

### 环境配置
- 提供 `.env.example` 模板
- 编写环境搭建指引
- 支持容器化部署

## GitHub 环境配置

### 前置检查
技能会自动检查以下环境：
1. `gh` CLI 是否已安装
2. GitHub token 是否配置
3. GitHub API 权限是否足够

### 配置 GitHub Token
如果检测失败，请按以下步骤配置：

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

### 异常处理
所有错误会抛出详细异常信息，包含：
- 错误类型
- 错误原因
- 解决建议
- 配置指引

## 示例

### 创建新项目
```
/stp "开发一个待办事项管理小程序，支持添加、删除、标记完成功能" --github-collab \
  --repo-name "todo-app" \
  --repo-desc "A simple todo management application" \
  --assign-coder "coder" \
  --assign-checker "checker" \
  --assign-writer "memowriter"
```

### 进度查询
```
/github-collab status --repo <repo-name>
```

## 依赖技能
- `stp`: 任务规划与执行
- `sessions_spawn`: 创建子 Agent 会话
- `gh`: GitHub CLI 工具

## 脚本说明

### scripts/
- `main.js`: 主入口脚本，负责仓库创建和初始化
- `task-breakdown.js`: 任务拆解脚本，将复杂任务分类
- `agent-assign.js`: Agent 任务分配，创建子会话
- `progress-report.js`: 进度报告生成和定时任务

## 版本历史
- v1.0.0: 初始版本，支持基本协同开发功能
- v1.1.0: 添加 Agent 分配和进度报告功能
