# Tauri 验证报告

## 范围

通过检查前端编译、TypeScript 完整性以及 Tauri/Rust 构建执行，验证 World Monitor 的桌面构建就绪度。

## 桌面验证前的预检

先跑这些检查，这样失败就能快速分类：

1. npm registry 可达性
   - `npm ping`
2. crates.io sparse index 可达性
   - `curl -I https://index.crates.io/`
3. 如果网络需要代理，确认代理配置存在
   - `env | grep -E '^(HTTP_PROXY|HTTPS_PROXY|NO_PROXY)='`

如果这些检查失败，则后续桌面构建失败应先视为环境级问题，直到网络路径修复。

## 执行过的命令

1. `npm ci` - 失败，因为环境阻止从 npm 下载锁定版本的 `@tauri-apps/cli` 包（`403 Forbidden`）
2. `npm run typecheck` - 成功
3. `npm run build:full` - 成功（仅有警告）
4. `npm run desktop:build:full` - 在此环境中无法运行，因为 `npm ci` 失败，导致本地 `tauri` binary 不可用
5. `cargo check`（在 `src-tauri/` 下）- 失败，因为环境阻止从 `https://index.crates.io` 下载 crates（`403 CONNECT tunnel failed`）

## 结论

- web 应用部分编译成功
- 本次运行中的完整 Tauri 桌面验证被 **外部环境故障/限制** 阻断（registry 访问被 403 拒绝）
- 在这次验证过程中，没有观察到项目源码中的运行时缺陷

## 未来 QA 的失败分类

1. **外部环境故障**
   - 症状：npm/crates registry 请求出现 transport/auth/network 错误（403/5xx/timeout/DNS/proxy），且与仓库状态无关
   - 处理：在健康网络中重试，或修复凭证/代理/mirror 可用性

2. **预期失败：未准备离线模式**
   - 症状：在故意离线的环境中构建，但所需离线输入不存在
   - 处理：先准备离线工件/mirror 配置，再启用 offline override 并重试

## 下一步如何做端到端验证

可选两条路径：

- 在线路径：
  - `npm ci`
  - `npm run desktop:build:full`

- 受限网络路径：
  - 恢复预构建的离线工件
  - 用 vendored/internal source 跑 Cargo，并在需要时使用 `--offline`

完成 `npm ci` 后，桌面构建会使用本地的 `tauri` binary，不再依赖运行时 `npx` 下载包。

## 受限环境的修复选项

- 配置内部 npm mirror/proxy
- 配置内部 Cargo registry/sparse index mirror
- 预先 vendoring Rust crates
- 使用已经恢复缓存工件的 CI runner

更多发布打包细节请参见 `docs/RELEASE_PACKAGING.md` 中的 **Network preflight and remediation** 章节。

