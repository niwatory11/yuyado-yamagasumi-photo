import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App(スモークテスト)', () => {
  it('h1 がひとつだけあり、主要セクションの見出しが揃っている', () => {
    render(<App />)

    const h1s = screen.getAllByRole('heading', { level: 1 })
    expect(h1s).toHaveLength(1)
    expect(h1s[0]).toHaveTextContent('霞の向こうに、湯の灯り。')

    for (const name of [
      '山霞について',
      '湯',
      '部屋',
      '料理',
      'ご案内',
      'ご予約',
    ]) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument()
    }
  })

  it('スキップリンクと main ランドマークがある', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: '本文へスキップ' })).toHaveAttribute(
      'href',
      '#main',
    )
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1')
  })

  it('架空の宿である旨の注記がヒーローとフッターの両方にある', () => {
    render(<App />)
    const notes = screen.getAllByText(/架空の宿のコンセプトサイト/)
    expect(notes.length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/「湯宿 山霞」は実在せず/)).toBeInTheDocument()
  })

  it('WebGL非対応環境(jsdom)ではフォールバックが描画されクラッシュしない', () => {
    // jsdomはwebgl2コンテキストを返さないため、この描画自体がフォールバック経路の検証になる
    const { container } = render(<App />)
    expect(container.querySelectorAll('canvas')).toHaveLength(0)
  })
})
