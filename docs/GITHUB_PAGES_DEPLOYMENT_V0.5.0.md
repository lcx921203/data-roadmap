# GitHub Pages Deployment Plan V0.5.0

## Target

```text
https://lcx921203.github.io/data-roadmap/
```

## Build

```bash
npm install
npm run build
```

Output:

```text
dist/
```

## Pages Workflow Template

仓库内模板：

```text
ops/workflows/deploy-pages.yml.template
```

最终需要成为：

```text
.github/workflows/deploy-pages.yml
```

但是现有包应用工作流明确排除 `.github/workflows/*`，因此不能通过普通 DataRoadmap ZIP 自动安装。

## 下一轮部署顺序

```text
1. 先确认 V0.5.0 package 已成功落库
2. 验证 package.json / vite.config.ts / src/
3. 安装 deploy-pages.yml
4. GitHub Settings → Pages → Source = GitHub Actions
5. Run Deploy workflow
6. 检查 build / deploy
7. 手机打开正式 Pages URL
```

如果 GitHub Connector 对 Workflow 文件仍没有写权限，则使用一次性 GitHub Mobile 创建文件；正文模板已在仓库内，不需要重新手写部署逻辑。
