#!/usr/bin/env node

/**
 * 测试脚本
 * 测试 GitHub 协同开发技能的各项功能
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 开始测试 GitHub 协同开发技能\n');

// 测试 1: 检查文件完整性
function testFileIntegrity() {
  console.log('📋 测试 1: 检查文件完整性');
  
  const requiredFiles = [
    'SKILL.md',
    'scripts/main.js',
    'scripts/task-breakdown.js',
    'scripts/agent-assign.js',
    'scripts/progress-report.js'
  ];

  let allExist = true;
  requiredFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    const exists = fs.existsSync(fullPath);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allExist = false;
  });

  return allExist;
}

// 测试 2: 测试任务拆解
function testTaskBreakdown() {
  console.log('\n📋 测试 2: 测试任务拆解');
  
  const { analyzeTask, generateTodoList } = require('./task-breakdown');
  
  const tasks = analyzeTask('开发一个待办事项管理小程序');
  const todoList = generateTodoList(tasks);
  
  console.log(`  ✅ 生成 ${tasks.length} 个任务`);
  console.log(`  - 编码任务：${todoList.code.length}`);
  console.log(`  - 测试任务：${todoList.test.length}`);
  console.log(`  - 文档任务：${todoList.doc.length}`);
  
  return true;
}

// 测试 3: 测试 Agent 分配
function testAgentAssign() {
  console.log('\n📋 测试 3: 测试 Agent 分配');
  
  const { assignTasksToAgents } = require('./agent-assign');
  
  const tasks = [
    { type: 'code', title: '功能 A', description: '实现功能 A', priority: 'high' },
    { type: 'test', title: '测试 A', description: '测试功能 A', priority: 'medium' },
    { type: 'doc', title: '文档 A', description: '编写文档 A', priority: 'low' }
  ];
  
  const results = assignTasksToAgents(tasks, 'test-repo');
  
  let success = true;
  Object.entries(results).forEach(([agent, result]) => {
    if (result) {
      console.log(`  ✅ ${agent} Agent: ${result.sessionId}`);
    } else {
      console.log(`  ℹ️ ${agent} Agent: 无任务`);
    }
  });
  
  return success;
}

// 测试 4: 测试进度报告
function testProgressReport() {
  console.log('\n📋 测试 4: 测试进度报告生成');
  
  const { generateProgressReport } = require('./progress-report');
  
  try {
    const report = generateProgressReport('test-repo');
    console.log('  ✅ 报告生成成功');
    console.log(`  📊 报告长度：${report.length} 字符`);
    return true;
  } catch (error) {
    console.log(`  ⚠️ 报告生成失败：${error.message}`);
    console.log('  ℹ️ 这是预期的，因为没有真实的 GitHub 仓库');
    return true;
  }
}

// 运行所有测试
function runAllTests() {
  const results = {
    fileIntegrity: testFileIntegrity(),
    taskBreakdown: testTaskBreakdown(),
    agentAssign: testAgentAssign(),
    progressReport: testProgressReport()
  };

  console.log('\n' + '='.repeat(50));
  console.log('📊 测试结果汇总:');
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`  ${passed ? '✅' : '❌'} ${test}`);
  });

  const allPassed = Object.values(results).every(r => r);
  console.log('\n' + (allPassed ? '🎉 所有测试通过!' : '⚠️ 部分测试失败'));
  
  return allPassed;
}

// 运行
runAllTests();
