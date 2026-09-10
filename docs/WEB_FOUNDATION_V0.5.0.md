# Web Foundation V0.5.0

> V0.5.0 是 DataRoadmap 从 Prototype 进入真实 Web App 的第一轮。

## 1. 技术基线

```text
React 19
TypeScript
Vite
Markdown / YAML
Static First
Hash Routing
GitHub Pages
```

没有 Backend。

V1 内容仍由仓库中的 `content/` 作为事实源。

## 2. 为什么使用 Hash Routing

GitHub Pages 是静态托管。

V0.5.0 使用：

```text
#/learn
#/interview
#/scale
#/projects
```

这样直接刷新子页面不会要求服务器提供 `/learn/index.html`。

同时 Vite：

```ts
base: '/data-roadmap/'
```

适配：

```text
https://lcx921203.github.io/data-roadmap/
```

## 3. 当前真实页面

四个顶级 Route 已有 React 页面：

```text
Learn
Interview
Scale Lab
Projects
```

### Learn

直接读取：

```text
content/taxonomy.yaml
```

因此 12 Stage 不是在 React 页面里复制一份配置。

### Interview

直接读取：

```text
content/interviews/first-interview-bank-30-v0.3.8.yaml
```

题目 Rank、Evidence Count、Curated Status 都来自 Content-as-Code。

### Scale

V0.5.0 先建立入口和 Scenario Family 骨架。

### Projects

V0.5.0 只建立真实性边界 UI，不提前把未经 Fact Check 的项目细节写死。

## 4. Content Loader

Vite 使用：

```ts
import.meta.glob('../../content/**/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
})
```

把仓库现有 Content-as-Code 编入静态 Bundle。

YAML 使用 `js-yaml` 解析。

这意味着：

```text
Git Content
↓
Vite Build
↓
Typed Registry
↓
React UI
```

V1 不需要数据库。

## 5. Build Gate

`npm run build` 不是直接运行 Vite。

顺序：

```text
validate:content
↓
typecheck
↓
vite build
```

`validate:content` 当前检查：

- Taxonomy 必须 12 Stage；
- First Interview Bank 必须 30 道；
- Interview ID 不重复；
- Design System `components-v1.yaml` 必须仍是 Frozen V1。

这样 Content-as-Code 出现结构性问题时，CI 应直接失败，而不是部署坏页面。

## 6. Design System

实现直接读取 V0.4.2 的规则：

- Warm Canvas；
- Signal Blue；
- Row over Card；
- 16px 中文正文；
- 20px Mobile Padding；
- 44px Touch Target；
- Bottom Navigation；
- Desktop Left Sidebar；
- iOS Safe Area；
- Reduced Motion。

Design Token 已落到：

```text
src/styles/tokens.css
```

## 7. Workflow 为什么不直接放进本轮 ZIP

现有 `Apply DataRoadmap package` 为了避免 GitHub Workflow Permission 冲突，会明确排除：

```text
.github/workflows/*
```

因此即使把 `deploy-pages.yml` 塞进 ZIP，它也不会落库。

本轮把正式模板放在：

```text
ops/workflows/deploy-pages.yml.template
```

这样 Application Bootstrap 与 Deployment Workflow 不混淆。

V0.5.1 单独安装 GitHub Pages Workflow，并验证真实 Pages URL。

## 8. V0.5.0 Definition of Done

```text
[x] React / TypeScript / Vite
[x] base = /data-roadmap/
[x] Hash Router
[x] Four top-level routes
[x] Frozen Design Tokens
[x] Mobile Bottom Navigation
[x] Desktop Sidebar
[x] YAML Content Loader
[x] Static Registry
[x] Real Taxonomy rendering
[x] Real Interview Bank rendering
[x] Content validation build gate
[x] Pages workflow template
[ ] Live GitHub Pages deployment
```

下一轮：

# V0.5.1 GitHub Pages Deployment

## 9. Dependency Lock 状态

V0.5.0 Bootstrap 尚未提交 `package-lock.json`，因此 Pages Workflow 模板暂时使用：

```bash
npm install
```

V0.5.1 在真实 GitHub Actions 安装依赖并验证版本后，再提交锁文件并把 Workflow 收紧为：

```bash
npm ci
```

这样不会在没有经过构建验证的情况下手写一个假的 Lockfile。
