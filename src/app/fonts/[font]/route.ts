import {
  readFile,
} from 'node:fs/promises'
import {
  basename,
  join,
} from 'node:path'

import {
  NextResponse,
} from 'next/server'

import {
  FONT_FILES,
  STUDIO_FONT_FILES,
} from '../loadFontBuffers'

const FONT_DIRECTORY = join(process.cwd(), 'src', 'app', 'fonts', 'files')
const FONT_MIME_TYPES: Record<string, string> = {
  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
}

/**
 * 字体响应只依赖构建时就确定的文件，所以可以预渲染成静态文件 ——
 * GitHub Pages 上没有任何 Node 运行时，动态路由必须在构建期展开。
 */
export const dynamic = 'force-static'

export function generateStaticParams() {
  return [
    ...Object.keys(FONT_FILES),
    ...Object.keys(STUDIO_FONT_FILES),
    ...Object.values(FONT_FILES),
    ...Object.values(STUDIO_FONT_FILES),
  ].map(font => ({
    font,
  }))
}

export async function GET(
  _request: Request,
  {
    params,
  }: RouteContext<'/fonts/[font]'>,
) {
  const {
    font,
  } = await params
  const filename = resolveFontFile(font)
  if (!filename)
    return NextResponse.json({
      error: 'Not found',
    }, {
      status: 404,
    })

  const filePath = join(FONT_DIRECTORY, filename)
  let buffer: Buffer
  try {
    buffer = await readFile(filePath)
  } catch {
    return NextResponse.json({
      error: 'Not found',
    }, {
      status: 404,
    })
  }
  const ext = filename.slice(filename.lastIndexOf('.'))

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': FONT_MIME_TYPES[ext] ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

function isFontKey(value: string): value is keyof typeof FONT_FILES {
  return value in FONT_FILES
}

/**
 * 解析要提供的字体文件：
 * 1. `FONT_FILES` 里的短键（han / a / b / c）；
 * 2. `STUDIO_FONT_FILES` 里的工坊字体（unifont）；
 * 3. 直接按字体目录里的文件名访问（`/fonts/jtbz_A.ttf`、`/fonts/unifont-17.0.04.ttf`），
 *    仅允许纯文件名 + ttf/otf 后缀，避免路径穿越。
 */
function resolveFontFile(font: string): string | null {
  if (isFontKey(font)) return FONT_FILES[font]
  if (font in STUDIO_FONT_FILES) return STUDIO_FONT_FILES[font]
  if (!/\.(ttf|otf)$/i.test(font)) return null
  if (font !== basename(font) || font.includes('\\')) return null
  return font
}
