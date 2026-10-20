'use client'

import Link from 'next/link'
import React from 'react'

import { Mark } from './Brand'

export function NavHeader() {
  return (
    <div className="os-nav-head">
      <div className="os-nav-head__brand">
        <Mark size={30} />
        <span className="os-nav-head__text">
          <span className="os-nav-head__title">内容管理</span>
          <span className="os-nav-head__sub">Shelfry</span>
        </span>
      </div>
      <div className="os-nav-head__actions">
        <Link className="os-nav-head__add" href="/admin/collections/items/create">
          ＋ 添加项目
        </Link>
        <a className="os-nav-head__link" href="/" target="_blank" rel="noreferrer">
          查看前台 ↗
        </a>
      </div>
    </div>
  )
}
