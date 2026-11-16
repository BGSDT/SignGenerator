import {
  type TurbopackRuleConfigItem,
} from 'next/dist/server/config-shared'

import type {
  NextConfig,
} from 'next'

/**
 * GitHub Pages 的项目站点挂在 `/<仓库名>` 子路径下；本地开发与离线包为空。
 * 由 `.github/workflows/deploy-pages.yml` 传入。
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
/**
 * 静态导出开关。只在 CI 构建站点时打开 ——
 * 本地 / 离线包仍然是有 Node 运行时的普通构建（`/api/studio/*` 要用文件系统）。
 */
const staticExport = process.env.NEXT_STATIC_EXPORT === '1'

const
  rawRule = {
    loaders: [
      'raw-loader',
    ],
    as: '*.js',
  } satisfies TurbopackRuleConfigItem,
  nextConfig: NextConfig = {
    // 静态托管没有 Node 运行时：导出纯 HTML/JS，并让每个路由都落成 `xxx/index.html`
    ...(staticExport
      ? {
          output: 'export' as const,
          trailingSlash: true,
        }
      : {}),
    ...(basePath === '' ? {} : {
      basePath,
    }),
    /* config options here */
    reactCompiler: true,
    /*
     * `next dev` 默认只放行启动时用的主机名（`localhost`），其余来源访问
     * `/_next/**`、`/__nextjs*`（含 HMR、字体、字体 CSS）一律 403 Unauthorized。
     * 桌面端预览面板是用 `127.0.0.1:3000` 打开页面的，所以整站 JS chunk 全被拦，
     * 页面能返回 200 但 hydration 直接失败。这里把回环地址显式加进白名单。
     * 只影响 dev，生产构建不带这个开关。
     */
    allowedDevOrigins: [
      '127.0.0.1',
      '[::1]',
    ],
    turbopack: {
      rules: {
        '*.svg': rawRule,
      },
    },
  }

export default nextConfig
