'use client'

import React from 'react'

export function NavHeader() {
  return (
    <div className="os-nav-head">
      <div className="os-nav-head__brand">
        <span className="os-nav-head__mark">O</span>
        <span className="os-nav-head__text">
          <span className="os-nav-head__title">内容管理</span>
          <span className="os-nav-head__sub">OpenShelf</span>
        </span>
      </div>
      <div className="os-nav-head__actions">
        <a className="os-nav-head__add" href="/admin/collections/items">
          ＋ 添加项目
        </a>
        <a className="os-nav-head__link" href="/" target="_blank" rel="noreferrer">
          查看前台 ↗
        </a>
      </div>
    </div>
  )
}
