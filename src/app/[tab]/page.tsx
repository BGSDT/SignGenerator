import {
  Suspense,
} from 'react'

import TAB_TITLES from './tab-meta.json'
import TabPage from './TabPage'

import type {
  Metadata,
} from 'next'

interface TabPageProps {
    params: Promise<{ tab: string }>;
}

export function generateStaticParams() {
  return Object.keys(TAB_TITLES).map(tab => ({
    tab,
  }))
}

export async function generateMetadata({
  params,
}: TabPageProps) {
  const {
    tab,
  } = await params
  return {
    title: TAB_TITLES[tab as keyof typeof TAB_TITLES],
  } satisfies Metadata
}

export default function Page() {
  // TabPage 里读了 `useSearchParams()`（旧版工作区用它恢复初始值），
  // 静态导出预渲染时必须包一层 Suspense，否则整页会退化到客户端渲染并报错。
  return (
    <Suspense>
      <TabPage />
    </Suspense>
  )
}
