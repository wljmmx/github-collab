# Errors

## 2026-03-23 - Git 身份未配置

**错误**: `fatal: unable to auto-detect email address`

**原因**: 沙盒环境未配置 Git 用户身份

**解决**: 
```bash
git config --global user.email "sandbox@example.com"
git config --global user.name "Sandbox"
```

## 2026-03-23 - GitHub API 网络错误

**错误**: `GnuTLS recv error (-110): The TLS connection was non-properly terminated`

**原因**: 沙盒环境网络不稳定

**解决**: 重试或检查网络连接
