#!/usr/bin/env node

/**
 * Agent 任务分配脚本
 * 负责将任务分配给不同的 Agent 并创建子会话
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Agent 类型定义
 */
const AGENT_TYPES = {
  CODER: 'coder',
  CHECKER: 'checker',
  WRITER: 'memowriter'
};

/**
 * 任务优先级
 */
const PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

/**
 * 创建 Agent 会话
 * @param {string} agentType - Agent 类型
 * @param {Array} tasks - 任务列表
 * @param {string} repoName - 仓库名称
 * @returns {object} 会话信息
 */
function spawnAgentSession(agentType, tasks, repoName) {
  const sessionConfig = {
    agent: agentType,
    tasks: tasks,
    repo: repoName,
    timestamp: new Date().toISOString()
  };

  // 生成任务描述
  const taskDescriptions = tasks.map(task => {
    return `
### ${task.title}
- 类型：${task.type}
- 优先级：${task.priority}
- 描述：${task.description}
`;
  }).join('\n');

  // 生成会话消息
  const sessionMessage = `
【GitHub 协同开发任务分配】

📦 项目仓库：${repoName}
👤 Agent 角色：${agentType}
📋 任务数量：${tasks.length}

${taskDescriptions}

---
请开始执行任务，完成后提交到仓库。
`;

  console.log(`📥 准备分配任务给 ${agentType} Agent:`);
  console.log(sessionMessage);

  // TODO: 调用 OpenClaw sessions_spawn API
  // 这里需要集成 OpenClaw 的会话创建功能
  // 示例：
  // const sessionId = sessions_spawn({
  //   agent: agentType,
  //   message: sessionMessage,
  //   context: sessionConfig
  // });

  // 临时方案：保存任务到文件
  const taskFile = path.join(process.cwd(), `${agentType}-tasks-${Date.now()}.json`);
  fs.writeFileSync(taskFile, JSON.stringify(sessionConfig, null, 2));
  console.log(`✅ 任务已保存到：${taskFile}`);

  return {
    sessionId: `session-${agentType}-${Date.now()}`,
    taskFile: taskFile,
    status: 'pending'
  };
}

/**
 * 分配任务给对应 Agent
 * @param {Array} tasks - 任务列表
 * @param {string} repoName - 仓库名称
 * @returns {object} 分配结果
 */
function assignTasksToAgents(tasks, repoName) {
  const agentTasks = {
    [AGENT_TYPES.CODER]: tasks.filter(t => t.type === 'code'),
    [AGENT_TYPES.CHECKER]: tasks.filter(t => t.type === 'test'),
    [AGENT_TYPES.WRITER]: tasks.filter(t => t.type === 'doc')
  };

  const results = {};

  Object.entries(agentTasks).forEach(([agentType, agentTasks]) => {
    if (agentTasks.length > 0) {
      console.log(`\n📋 分配 ${agentTasks.length} 个任务给 ${agentType} Agent`);
      results[agentType] = spawnAgentSession(agentType, agentTasks, repoName);
    } else {
      console.log(`ℹ️ 没有 ${agentType} 类型的任务`);
      results[agentType] = null;
    }
  });

  return results;
}

/**
 * 生成任务分配报告
 * @param {object} results - 分配结果
 * @returns {string} 报告内容
 */
function generateAssignmentReport(results) {
  const report = `
## 📊 任务分配报告

### 分配详情
`;

  Object.entries(results).forEach(([agentType, result]) => {
    if (result) {
      report += `
- **${agentType} Agent**:
  - 会话 ID: ${result.sessionId}
  - 任务文件：${result.taskFile}
  - 状态：${result.status}
`;
    } else {
      report += `\n- **${agentType} Agent**: 无任务`;
    }
  });

  report += `
---
*报告生成时间：${new Date().toISOString()}*
`;

  return report;
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  
  // 从参数或文件读取任务
  let tasks = [];
  let repoName = 'collab-project';

  if (args.length > 0) {
    // 尝试从 JSON 文件读取任务
    if (fs.existsSync(args[0])) {
      const taskData = JSON.parse(fs.readFileSync(args[0], 'utf8'));
      tasks = [...taskData.code, ...taskData.test, ...taskData.doc];
      repoName = args[1] || repoName;
    }
  }

  if (tasks.length === 0) {
    console.log('⚠️ 没有任务可分配');
    return;
  }

  console.log(`🚀 开始分配 ${tasks.length} 个任务到仓库：${repoName}`);

  // 分配任务
  const results = assignTasksToAgents(tasks, repoName);

  // 生成报告
  const report = generateAssignmentReport(results);
  console.log('\n' + report);

  // 保存报告
  const reportFile = path.join(process.cwd(), `assignment-report-${Date.now()}.md`);
  fs.writeFileSync(reportFile, report);
  console.log(`\n📄 报告已保存到：${reportFile}`);

  return results;
}

// 导出函数
module.exports = {
  spawnAgentSession,
  assignTasksToAgents,
  generateAssignmentReport
};

// 运行
if (require.main === module) {
  main();
}
