#!/usr/bin/env node

/**
 * GitHub 协同开发技能 - 主入口脚本
 * 支持多项目异步排队、定时任务、日进度报告、关联仓库管理
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  defaultRepoName: 'collab-project',
  defaultVisibility: 'private',
  agents: {
    coder: 'coder',
    checker: 'checker',
    writer: 'memowriter'
  },
  dataDir: path.join(__dirname, '..', 'data'),
  queueFile: path.join(__dirname, '..', 'data', 'project-queue.json'),
  projectsFile: path.join(__dirname, '..', 'data', 'projects.json')
};

function initDataDir() {
  if (!fs.existsSync(CONFIG.dataDir)) {
    fs.mkdirSync(CONFIG.dataDir, { recursive: true });
  }
}

function readJSON(file) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (error) {
    console.error(`读取文件失败：${file}`, error.message);
  }
  return null;
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`写入文件失败：${file}`, error.message);
  }
}

function checkGitHubCLI() {
  try {
    const version = execSync('gh --version', { encoding: 'utf8' });
    console.log('✅ GitHub CLI 已安装:', version.split('\n')[0]);
    return true;
  } catch (error) {
    console.error('❌ GitHub CLI 未安装或未配置');
    throw new Error('GH_NOT_CONFIGURED: 请运行 `gh auth login` 配置 GitHub token');
  }
}

function checkGitHubToken() {
  try {
    const token = execSync('gh auth status', { encoding: 'utf8' });
    console.log('✅ GitHub token 已配置');
    return true;
  } catch (error) {
    console.error('❌ GitHub token 未配置');
    throw new Error('TOKEN_INVALID: 请运行 `gh auth login` 配置 GitHub token');
  }
}

function getCurrentUser() {
  try {
    const user = JSON.parse(execSync('gh api user', { encoding: 'utf8' }));
    return user.login;
  } catch (error) {
    return 'wljmmx';
  }
}

function createRepository(repoName, description, visibility = 'private') {
  try {
    console.log(`📦 创建仓库：${repoName}`);
    const visibilityFlag = visibility === 'public' ? '--public' : visibility === 'private' ? '--private' : '';
    const cmd = `gh repo create ${repoName} --description "${description}" ${visibilityFlag}`;
    execSync(cmd, { encoding: 'utf8' });
    console.log(`✅ 仓库创建成功：https://github.com/${repoName}`);
    return repoName;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.warn(`⚠️ 仓库 ${repoName} 已存在`);
      return repoName;
    }
    throw new Error(`REPO_CREATE_FAILED: ${error.message}`);
  }
}

function initProjectStructure(repoName) {
  const projectDir = path.join(process.cwd(), repoName);
  
  const dirs = ['docs', 'src', 'tests', 'scripts', '.github/workflows'];
  dirs.forEach(dir => {
    const fullPath = path.join(projectDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });

  const readme = `# ${repoName}

## 项目说明

这是一个通过 GitHub 协同开发的项目。

## 项目结构

\`\`\`
${repoName}/
├── README.md
├── docs/           # 文档目录
├── src/            # 源代码
├── tests/          # 测试代码
├── scripts/        # 构建脚本
└── .github/        # GitHub 配置
    └── workflows/  # CI/CD 工作流
\`\`\`

## 环境搭建

请查看 docs/setup.md

## 开发流程

1. 从 main 分支创建 feature 分支
2. 开发功能并编写测试
3. 提交代码并创建 Pull Request
4. 代码审查后合并

## 参与开发

- **Coder**: 负责编码实现
- **Checker**: 负责测试验证
- **Memowriter**: 负责文档编写

---
*本项目由 GitHub 协同开发技能自动生成*
`;

  fs.writeFileSync(path.join(projectDir, 'README.md'), readme);
  console.log('✅ 项目结构初始化完成');
}

function createIssues(repoName, tasks) {
  const fullRepoName = `${getCurrentUser()}/${repoName}`;
  tasks.forEach(task => {
    try {
      const labels = task.type === 'code' ? 'coding' : task.type === 'test' ? 'testing' : 'documentation';
      const cmd = `gh issue create --repo ${fullRepoName} --title "[${task.type.toUpperCase()}] ${task.title}" --body "${task.description}" --label ${labels}`;
      execSync(cmd, { encoding: 'utf8' });
      console.log(`✅ Issue 创建：${task.title}`);
    } catch (error) {
      console.error(`❌ Issue 创建失败：${task.title}`, error.message);
    }
  });
}

function assignAgents(repoName, tasks) {
  const agentTasks = {
    coder: tasks.filter(t => t.type === 'code'),
    checker: tasks.filter(t => t.type === 'test'),
    writer: tasks.filter(t => t.type === 'doc')
  };

  console.log('📋 任务分配结果:');
  Object.entries(agentTasks).forEach(([agent, tasks]) => {
    if (tasks.length > 0) {
      console.log(`  - ${agent}: ${tasks.length} 个任务`);
      tasks.forEach(t => {
        console.log(`    * [${t.type.toUpperCase()}] ${t.title}`);
      });
    }
  });

  return agentTasks;
}

function generateProgressReport(repoName) {
  const fullRepoName = `${getCurrentUser()}/${repoName}`;
  try {
    const issues = execSync(`gh issue list --repo ${fullRepoName} --limit 50`, { encoding: 'utf8' });
    const commits = execSync(`gh pr list --repo ${fullRepoName} --limit 20`, { encoding: 'utf8' });
    
    const report = `
## 📊 项目进度报告 - ${repoName}

### Issues 状态
${issues}

### Pull Requests
${commits}

---
*报告生成时间：${new Date().toISOString()}*
    `;
    
    console.log(report);
    return report;
  } catch (error) {
    console.error('❌ 进度报告生成失败:', error.message);
    return null;
  }
}

function addToQueue(project) {
  const queue = readJSON(CONFIG.queueFile) || [];
  queue.push({
    id: project.id || `project-${Date.now()}`,
    ...project,
    status: 'pending',
    queuedAt: new Date().toISOString()
  });
  writeJSON(CONFIG.queueFile, queue);
  console.log(`✅ 项目已添加到队列，ID: ${project.id}`);
  return queue;
}

function processQueue() {
  const queue = readJSON(CONFIG.queueFile) || [];
  const pending = queue.filter(p => p.status === 'pending');
  
  if (pending.length === 0) {
    console.log('📭 队列为空');
    return;
  }

  console.log(`🚀 开始处理队列，共 ${pending.length} 个项目`);
  
  const batchSize = 3;
  for (let i = 0; i < pending.length; i += batchSize) {
    const batch = pending.slice(i, i + batchSize);
    const promises = batch.map(processProject);
    Promise.all(promises);
  }
}

function processProject(project) {
  console.log(`\n📦 处理项目：${project.repoName}`);
  project.status = 'processing';
  project.startedAt = new Date().toISOString();
  
  try {
    checkGitHubCLI();
    checkGitHubToken();
    
    const repoName = createRepository(project.repoName, project.description, project.visibility);
    initProjectStructure(repoName);
    
    const tasks = [
      { type: 'code', title: '实现核心功能模块', description: '开发项目核心功能' },
      { type: 'test', title: '编写单元测试', description: '为核心功能编写测试用例' },
      { type: 'doc', title: '编写操作手册', description: '编写项目使用文档' }
    ];
    
    createIssues(repoName, tasks);
    assignAgents(repoName, tasks);
    generateProgressReport(repoName);
    
    project.status = 'completed';
    project.completedAt = new Date().toISOString();
    console.log(`✅ 项目处理完成：${project.repoName}`);
  } catch (error) {
    project.status = 'failed';
    project.error = error.message;
    console.error(`❌ 项目处理失败：${project.repoName}`, error.message);
  }
  
  const queue = readJSON(CONFIG.queueFile) || [];
  const index = queue.findIndex(p => p.id === project.id);
  if (index !== -1) {
    queue[index] = project;
    writeJSON(CONFIG.queueFile, queue);
  }
}

function linkRepository(repoName, parentRepo, category) {
  const projects = readJSON(CONFIG.projectsFile) || {};
  
  if (!projects[repoName]) {
    console.error(`❌ 项目 ${repoName} 不存在`);
    return;
  }
  
  if (!projects[repoName].linkedRepos) {
    projects[repoName].linkedRepos = [];
  }
  
  projects[repoName].linkedRepos.push({
    repo: parentRepo,
    category: category || 'default',
    linkedAt: new Date().toISOString()
  });
  
  writeJSON(CONFIG.projectsFile, projects);
  console.log(`✅ 仓库 ${repoName} 已关联到 ${parentRepo} (${category || 'default'})`);
}

function listProjects(category) {
  const projects = readJSON(CONFIG.projectsFile) || {};
  
  console.log('📋 项目列表:');
  if (Object.keys(projects).length === 0) {
    console.log('  无项目');
    return;
  }
  
  Object.entries(projects).forEach(([name, project]) => {
    if (category && project.category !== category) return;
    
    console.log(`  - ${name}: ${project.description || '无描述'}`);
    console.log(`    状态：${project.status || '未初始化'}`);
    console.log(`    分类：${project.category || 'default'}`);
    if (project.linkedRepos) {
      console.log(`    关联仓库：${project.linkedRepos.map(r => `${r.repo}(${r.category})`).join(', ')}`);
    }
    if (project.lastUpdate) {
      console.log(`    最后更新：${new Date(project.lastUpdate).toLocaleString()}`);
    }
  });
}

function generateDailyReport() {
  console.log('📊 生成每日进度报告...');
  const projects = readJSON(CONFIG.projectsFile) || {};
  const report = [];
  
  Object.entries(projects).forEach(([name, project]) => {
    const fullRepoName = `${getCurrentUser()}/${name}`;
    try {
      const issues = execSync(`gh issue list --repo ${fullRepoName} --limit 10`, { encoding: 'utf8' });
      const commits = execSync(`gh pr list --repo ${fullRepoName} --limit 5`, { encoding: 'utf8' });
      
      report.push({
        repo: name,
        issues: issues,
        prs: commits,
        lastUpdate: project.lastUpdate || new Date().toISOString()
      });
    } catch (error) {
      console.error(`❌ 获取项目 ${name} 进度失败`, error.message);
    }
  });
  
  const summary = `
## 📊 每日进度报告 - ${new Date().toLocaleDateString()}

${report.map(r => `
### ${r.repo}
**Issues:**
${r.issues}
**PRs:**
${r.prs}
`).join('\n')}

---
*报告生成时间：${new Date().toISOString()}*
`;
  
  console.log(summary);
  return summary;
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  initDataDir();
  
  switch (command) {
    case 'queue':
      processQueue();
      break;
      
    case 'add':
      const project = {
        id: args[1],
        repoName: args[1] || CONFIG.defaultRepoName,
        description: args[2] || 'Collaborative development project',
        visibility: args[3] || CONFIG.defaultVisibility
      };
      addToQueue(project);
      break;
      
    case 'link':
      linkRepository(args[1], args[2], args[3]);
      break;
      
    case 'list':
      listProjects(args[1]);
      break;
      
    case 'report':
      generateDailyReport();
      break;
      
    case 'init':
    default:
      const params = {
        repoName: CONFIG.defaultRepoName,
        description: 'Collaborative development project',
        visibility: CONFIG.defaultVisibility
      };
      
      console.log('🔍 检查 GitHub 环境...');
      checkGitHubCLI();
      checkGitHubToken();
      
      const repoName = createRepository(params.repoName, params.description, params.visibility);
      initProjectStructure(repoName);
      
      const tasks = [
        { type: 'code', title: '实现核心功能模块', description: '开发项目核心功能' },
        { type: 'test', title: '编写单元测试', description: '为核心功能编写测试用例' },
        { type: 'doc', title: '编写操作手册', description: '编写项目使用文档' }
      ];
      
      createIssues(repoName, tasks);
      assignAgents(repoName, tasks);
      generateProgressReport(repoName);
      
      console.log('\n🎉 项目初始化完成!');
      console.log(`📍 仓库地址：https://github.com/${repoName}`);
      break;
  }
}

main().catch(error => {
  console.error('💥 错误:', error.message);
  process.exit(1);
});
