import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SiteHeader } from '../components/layout/SiteHeader'

describe('SiteHeader / MobileDrawer', () => {
  it('メニューボタンでドロワーが開閉し、aria-expanded が切り替わる', async () => {
    const user = userEvent.setup()
    render(<SiteHeader />)

    const menuButton = screen.getByRole('button', { name: 'メニュー' })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('dialog', { name: 'メニュー' })).toBeInTheDocument()
  })

  it('Escape で閉じ、フォーカスがメニューボタンへ戻る', async () => {
    const user = userEvent.setup()
    render(<SiteHeader />)

    const menuButton = screen.getByRole('button', { name: 'メニュー' })
    await user.click(menuButton)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(menuButton).toHaveFocus()
  })

  it('開いたとき最初のフォーカス可能要素(閉じる)にフォーカスし、Tab が循環する', async () => {
    const user = userEvent.setup()
    render(<SiteHeader />)

    await user.click(screen.getByRole('button', { name: 'メニュー' }))
    const dialog = screen.getByRole('dialog')
    const closeButton = within(dialog).getByRole('button', { name: '閉じる' })
    expect(closeButton).toHaveFocus()

    // Shift+Tab で先頭から末尾(ご予約リンク)へ循環する
    await user.tab({ shift: true })
    expect(within(dialog).getByRole('link', { name: 'ご予約' })).toHaveFocus()

    // Tab で末尾から先頭へ戻る
    await user.tab()
    expect(closeButton).toHaveFocus()
  })

  it('ナビリンクを選ぶとドロワーが閉じる', async () => {
    const user = userEvent.setup()
    render(<SiteHeader />)

    await user.click(screen.getByRole('button', { name: 'メニュー' }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('link', { name: '部屋' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
