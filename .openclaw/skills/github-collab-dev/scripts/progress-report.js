#!/usr/bin/env node

/**
 * 进度报告脚本
 * 定期生成项目进度报告并通过 QQ 发送
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * 获取仓库 Issues 状态
 */
function getIssuesStatus(repoName) {
  try {
    const issues = execSync(`gh issue list --repo ${repoName} --limit 50 --json number,title,state,labels`, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    
    const issuesArray = JSON.parse(issues);
    return {
      total: issuesArray.length,
      open: issuesArray.filter(i => i.state === 'OPEN').length,
      closed: issuesArray.filter(i => i.state === 'CLOSED').length,
      details: issuesArray
    };
  } catch (error) {
    console.error('❌ 获取 Issues 失败:', error.message);
    return null;
  }
}

/**
 * 获取 Pull Requests 状态
 */
function getPRsStatus(repoName) {
  try {
    const prs = execSync(`gh pr list --repo ${repoName} --limit 20 --json number,title,state,author`, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    
    const prsArray = JSON.parse(prs);
    return {
      total: prsArray.length,
      open: prsArray.filter(p => p.state === 'OPEN').length,
      closed: prsArray.filter(p => p.state === 'CLOSED').length,
      merged: prsArray.filter(p => p.state === 'MERGED').length,
      details: prsArray
    };
  } catch (error) {
    console.error('❌ 获取 PRs 失败:', error.message);
    return null;
  }
}

/**
 * 获取最近提交记录
 */
function getRecentCommits(repoName) {
  try {
    const commits = execSync(`gh api /repos/${repoName}/commits --paginate --jq '.[0:10] | [.[] | {sha: .sha[:7], message: .commit.message[:50], author: .author.login}]'`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    
    return JSON.parse(commits);
  } catch (error) {
    console.error('❌ 获取提交记录失败:', error.message);
    return [];
  }
}

/**
 * 生成进度报告
 */
function generateProgressReport(repoName) {
  const issues = getIssuesStatus(repoName);
  const prs = getPRsStatus(repoName);
  const commits = getRecentCommits(repoName);

  const report = `
## 📊 GitHub 项目进度报告

### 📦 仓库：${repoName}

---

### 📋 Issues 统计
- **总数**: ${issues?.total || 0}
- **开启**: ${issues?.open || 0}
- **已关闭**: ${issues?.closed || 0}

${issues?.details?.slice(0, 5).map(issue => `  - #${issue.number} ${issue.title} (${issue.state})`).join('\n') || '  暂无 Issues'}

---

### 🔀 Pull Requests
- **总数**: ${prs?.total || 0}
- **开启**: ${prs?.open || 0}
- **已关闭**: ${prs?.closed || 0}
- **已合并**: ${prs?.merged || 0}

${prs?.details?.slice(0, 5).map(pr => `  - #${pr.number} ${pr.title} by @${pr.author.login} (${pr.state})`).join('\n') || '  暂无 PRs'}

---

### 📝 最近提交
${commits?.slice(0, 5).map(commit => `  - ${commit.sha} ${commit.message} (@${commit.author})`).join('\n') || '  暂无提交记录'}

---

*报告生成时间：${new Date().toLocaleString('zh-CN')}*
`;

  return report;
}

/**
 * 保存报告到文件
 */
function saveReport(report, repoName) {
  const reportDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${repoName}-progress-${timestamp}.md`;
  const filepath = path.join(reportDir, filename);

  fs.writeFileSync(filepath, report);
  console.log(`✅ 报告已保存到：${filepath}`);

  return filepath;
}

/**
 * 设置定时任务（cron）
 */
function scheduleReports(repoName, frequency = 'daily') {
  const cronSchedule = {
    hourly: '0 * * * *',
    daily: '0 9 * * *',
    weekly: '0 9 * * 1'
  };

  const schedule = cronSchedule[frequency] || cronSchedule.daily;
  
  // 创建 cron 脚本
  const cronScript = `#!/bin/bash
cd ${process.cwd()}/github-collab-dev
node scripts/progress-report.js --repo ${repoName} --report-only
`;

  const cronScriptPath = path.join(process.cwd(), `report-${repoName}.sh`);
  fs.writeFileSync(cronScriptPath, cronScript, { mode: 0o755 });

  console.log(`⏰ 定时任务配置: ${frequency} (${schedule})`);
  console.log(`📄 Cron 脚本：${cronScriptPath}`);

  return {
    schedule: schedule,
    script: cronScriptPath
  };
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  
  let repoName = 'collab-project';
  let reportOnly = false;
  let scheduleOnly = false;
  let frequency = 'daily';

  // 解析参数
  args.forEach(arg => {
    if (arg.startsWith('--repo=')) {
      repoName = arg.split('=')[1];
    } else if (arg === '--report-only') {
      reportOnly = true;
    } else if (arg === '--schedule') {
      scheduleOnly = true;
    } else if (arg.startsWith('--frequency=')) {
      frequency = arg.split('=')[1];
    }
  });

  if (scheduleOnly) {
    console.log(`⏰ 设置定时任务：${repoName} (${frequency})`);
    scheduleReports(repoName, frequency);
    return;
  }

  console.log(`📊 生成进度报告：${repoName}`);
  
  const report = generateProgressReport(repoName);
  
  if (reportOnly) {
    console.log(report);
    saveReport(report, repoName);
  } else {
    console.log(report);
    const filepath = saveReport(report, repoName);
    
    // TODO: 集成 QQ 发送功能
    // 可以通过 OpenClaw sessions_send 或 qqbot 发送
    console.log('\n📤 准备通过 QQ 发送报告...');
  }

  return report;
}

// 导出函数
module.exports = {
  generateProgressReport,
  saveReport,
  scheduleReports
};

// 运行
if (require.main === module) {
  main();
}
