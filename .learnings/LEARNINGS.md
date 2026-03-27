# Learnings

## 2026-03-23 - Github-Collab 数据库路径

**发现**: Github-Collab 数据库位于 `/workspace/skills/Github-Collab/github-collab.db`

**原因**: 技能目录结构使用 `skills/Github-Collab` 而非 `skills/github-collab`

**经验**: 核实路径时要区分大小写，注意实际目录结构

## 2026-03-23 - Agent 绑定地址配置

**问题**: `agent-addresses.js` 中的 Agent QQ 地址都是占位符

**解决**: 需要配置真实的 QQ ID 到环境变量：
- `MAIN_AGENT_QQ_ID`
- `CODER_AGENT_QQ_ID`
- `CHECKER_AGENT_QQ_ID`
- `MEMOWRITER_AGENT_QQ_ID`

**经验**: 多 Agent 协作需要预先配置通信地址
