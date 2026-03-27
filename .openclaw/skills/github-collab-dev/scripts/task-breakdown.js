#!/usr/bin/env node

/**
 * 任务拆解脚本
 * 使用 stp 技能将复杂任务拆解为 TODO 列表
 */

const fs = require('fs');
const path = require('path');

/**
 * 任务类型分类
 */
const TASK_TYPES = {
  CODE: 'code',
  TEST: 'test',
  DOC: 'doc'
};

/**
 * 分析任务并分类
 */
function analyzeTask(taskDescription) {
  const tasks = [];
  
  // 这里应该调用 stp 技能进行任务拆解
  // 暂时使用简单的规则分类
  
  const keywords = {
    code: ['实现', '开发', '编写代码', '功能', '模块', '接口', 'api', 'function'],
    test: ['测试', '验证', '单元测试', '集成测试', 'bug', '修复'],
    doc: ['文档', '说明', '手册', 'README', '注释', '帮助']
  };
  
  // 示例任务拆解
  tasks.push({
    id: 1,
    type: TASK_TYPES.CODE,
    title: '核心功能开发',
    description: taskDescription,
    priority: 'high',
    assignee: 'coder'
  });
  
  tasks.push({
    id: 2,
    type: TASK_TYPES.TEST,
    title: '单元测试编写',
    description: '为核心功能编写单元测试，确保代码质量',
    priority: 'medium',
    assignee: 'checker'
  });
  
  tasks.push({
    id: 3,
    type: TASK_TYPES.DOC,
    title: '项目文档编写',
    description: '编写项目说明文档、API 文档和操作手册',
    priority: 'low',
    assignee: 'memowriter'
  });
  
  return tasks;
}

/**
 * 生成 TODO 列表
 */
function generateTodoList(tasks) {
  const todoList = {
    code: tasks.filter(t => t.type === TASK_TYPES.CODE),
    test: tasks.filter(t => t.type === TASK_TYPES.TEST),
    doc: tasks.filter(t => t.type === TASK_TYPES.DOC)
  };
  
  return todoList;
}

/**
 * 保存 TODO 列表到文件
 */
function saveTodoList(todoList, outputPath) {
  const content = JSON.stringify(todoList, null, 2);
  fs.writeFileSync(outputPath, content);
  console.log(`✅ TODO 列表已保存到：${outputPath}`);
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const taskDescription = args[0] || '默认任务描述';
  
  console.log('🔍 分析任务:', taskDescription);
  
  // 分析任务
  const tasks = analyzeTask(taskDescription);
  
  // 生成 TODO 列表
  const todoList = generateTodoList(tasks);
  
  // 保存 TODO 列表
  const outputPath = path.join(process.cwd(), 'todo-list.json');
  saveTodoList(todoList, outputPath);
  
  // 输出统计
  console.log('\n📊 任务统计:');
  console.log(`  - 编码任务：${todoList.code.length}`);
  console.log(`  - 测试任务：${todoList.test.length}`);
  console.log(`  - 文档任务：${todoList.doc.length}`);
  console.log(`  - 总计：${tasks.length}`);
  
  return todoList;
}

// 导出函数供其他模块使用
module.exports = {
  analyzeTask,
  generateTodoList,
  saveTodoList
};

// 运行
if (require.main === module) {
  main();
}
