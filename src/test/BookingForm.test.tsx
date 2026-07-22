import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookingForm } from '../features/booking/BookingForm'

/** jsdom 実行時の「今日」から相対で有効なチェックイン日(YYYY-MM-DD)を作る */
function validCheckIn(daysAhead = 30): string {
  const date = new Date()
  date.setDate(date.getDate() + daysAhead)
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/お名前/), '山田 花子')
  await user.type(screen.getByLabelText(/メールアドレス/), 'hanako@example.co.jp')
  await user.type(screen.getByLabelText(/電話番号/), '090-1234-5678')
  const checkIn = screen.getByLabelText(/チェックイン日/)
  await user.clear(checkIn)
  await user.type(checkIn, validCheckIn())
  await user.selectOptions(screen.getByLabelText(/ご宿泊数/), '1泊')
  await user.selectOptions(screen.getByLabelText(/ご人数/), '2名')
  await user.click(screen.getByRole('radio', { name: /「灯」/ }))
}

describe('BookingForm', () => {
  it('必須項目に required が付き、ご要望は任意になっている', () => {
    render(<BookingForm />)
    for (const label of [
      /お名前/,
      /メールアドレス/,
      /電話番号/,
      /チェックイン日/,
      /ご宿泊数/,
      /ご人数/,
    ]) {
      expect(screen.getByLabelText(label)).toBeRequired()
    }
    expect(screen.getByLabelText(/ご要望/)).not.toBeRequired()
  })

  it('空のまま送信するとエラーサマリーが出て最初の項目へフォーカスする', async () => {
    const user = userEvent.setup()
    render(<BookingForm />)

    await user.click(screen.getByRole('button', { name: 'デモ入力を完了する' }))

    const summary = screen.getByRole('alert')
    expect(summary).toHaveTextContent('7件の不備')
    expect(screen.getByLabelText(/お名前/)).toHaveFocus()
    expect(screen.getByLabelText(/お名前/)).toHaveAttribute('aria-invalid', 'true')
  })

  it('サマリーのリンクで該当フィールドへフォーカスが移る', async () => {
    const user = userEvent.setup()
    render(<BookingForm />)

    await user.click(screen.getByRole('button', { name: 'デモ入力を完了する' }))
    const summary = screen.getByRole('alert')
    await user.click(
      within(summary).getByRole('link', { name: /チェックイン日/ }),
    )
    expect(screen.getByLabelText(/チェックイン日/)).toHaveFocus()
  })

  it('blur 時に単項目のエラーが表示され、修正すると消える', async () => {
    const user = userEvent.setup()
    render(<BookingForm />)

    const email = screen.getByLabelText(/メールアドレス/)
    await user.type(email, 'broken')
    await user.tab()
    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(
      screen.getByText('メールアドレスの形式が正しくありません'),
    ).toBeInTheDocument()

    await user.clear(email)
    await user.type(email, 'hanako@example.co.jp')
    expect(email).toHaveAttribute('aria-invalid', 'false')
  })

  it('すべて正しく入力して送信すると完了メッセージへ置き換わりフォーカスが移る', async () => {
    const user = userEvent.setup()
    render(<BookingForm />)

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'デモ入力を完了する' }))

    const done = screen.getByRole('status')
    expect(done).toHaveTextContent('予約フォームのデモが完了しました')
    expect(done).toHaveTextContent('保存・送信されていません')
    expect(done).toHaveFocus()
    expect(
      screen.queryByRole('button', { name: 'デモ入力を完了する' }),
    ).not.toBeInTheDocument()
  })
})
