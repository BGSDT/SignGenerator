/**
 * 构建期样式处理。
 *
 * 除了 Tailwind，部署到子路径（GitHub Pages 的 `/<仓库名>/`）时再挂一个
 * `postcss-url`：Next.js 只给 `<script>` / `<link>` 自动加 basePath，
 * CSS 里 `url(/fonts/...)` 这种根绝对路径不会被改写，导出后字体会 404。
 * 本地构建（basePath 为空）时不做任何改动。
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const config = {
  plugins: {
    '@tailwindcss/postcss': {
    },
    ...(basePath === '' ? {} : {
      'postcss-url': {
        url: asset => (
          asset.url.startsWith('/') && !asset.url.startsWith('//')
            ? `${basePath}${asset.url}`
            : asset.url
        ),
      },
    }),
  },
}

export default config
