# BLOCK WORLD 开发与校验 Playbook

## 目的
建立统一的校验与执行规范，保证任务在霓虹科技风设计系统与反偏航机制下稳定推进。

## 校验命令
- 运行：`pnpm validate`
- 作用：检查设计系统文件存在、默认页面使用 Neon 组件、UI 状态齐全、组件/页面禁止直接使用十六进制颜色。
- 结果：输出 PASS/FAIL；FAIL 必须在当前任务修复。

## 设计系统要求
- 文件：`src/design/tokens.ts`、`src/design/tailwind-neon-rules.ts`
- 组件：使用 `NeonCard`、`NeonButton`
- 禁止：在组件/页面中直接写 `#xxxxxx`（仅 `tokens.ts` 允许）
- 颜色约束：黄色仅用于奖励/国库信息

## UI 状态
- 页面必须包含并展示：Loading / Empty / Error / Degraded
- 每个状态需具备样式，不允许纯文字

## 工作流
1. 完成开发
2. 执行 `pnpm validate`
3. 校验通过后提交任务结果与 JIRA 工单块

## 常见问题
- PostCSS/Tailwind 未加载：确保 `app/layout.tsx` 引入 `./globals.css`
- 颜色写法违规：在组件中使用 `var(--...)` 或 `classes` 中的预设类
