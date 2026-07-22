import type { BookingErrors, BookingField, BookingValues } from './types'

/** チェックインは最短で翌日から */
export const MIN_LEAD_DAYS = 1
/** チェックインの上限は180日後 */
export const MAX_AHEAD_DAYS = 180

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** ローカル日付のまま YYYY-MM-DD に変換する(UTCずれを避ける) */
function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base.getFullYear(), base.getMonth(), base.getDate())
  next.setDate(next.getDate() + days)
  return next
}

/** input[type=date] の min 属性用 */
export function minDateString(today: Date): string {
  return toDateString(addDays(today, MIN_LEAD_DAYS))
}

/** input[type=date] の max 属性用 */
export function maxDateString(today: Date): string {
  return toDateString(addDays(today, MAX_AHEAD_DAYS))
}

/** YYYY-MM-DD をローカル日付として解釈する(new Date(string) のUTC解釈を避ける) */
function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

/**
 * 単一フィールドの検証。エラーメッセージ、問題なければ null を返す。
 * `today` を注入することで日付境界のテストを決定的にする。
 */
export function validateField(
  field: BookingField,
  values: BookingValues,
  today: Date,
): string | null {
  const value = values[field]

  switch (field) {
    case 'name': {
      if (value.trim() === '') return 'お名前を入力してください'
      if (value.length > 30) return 'お名前は30文字以内で入力してください'
      return null
    }
    case 'email': {
      if (value.trim() === '') return 'メールアドレスを入力してください'
      if (!EMAIL_PATTERN.test(value)) {
        return 'メールアドレスの形式が正しくありません'
      }
      return null
    }
    case 'phone': {
      if (value.trim() === '') return '電話番号を入力してください'
      const digits = value.replace(/[-\s]/g, '')
      if (!/^0\d{9,10}$/.test(digits)) {
        return '電話番号は0から始まる10〜11桁で入力してください'
      }
      return null
    }
    case 'checkIn': {
      if (value === '') return 'チェックイン日を入力してください'
      const date = parseLocalDate(value)
      if (!date) return 'チェックイン日の形式が正しくありません'
      const min = addDays(today, MIN_LEAD_DAYS)
      const max = addDays(today, MAX_AHEAD_DAYS)
      if (date.getTime() < min.getTime()) {
        return `チェックインは翌日(${toDateString(min)})以降でご指定ください`
      }
      if (date.getTime() > max.getTime()) {
        return `チェックインは${MAX_AHEAD_DAYS}日後(${toDateString(max)})まででご指定ください`
      }
      return null
    }
    case 'nights': {
      if (value === '') return 'ご宿泊数を選択してください'
      return null
    }
    case 'guests': {
      if (value === '') return 'ご人数を選択してください'
      return null
    }
    case 'room': {
      if (value === '') return 'お部屋タイプを選択してください'
      return null
    }
    case 'notes': {
      if (value.length > 400) return 'ご要望は400文字以内で入力してください'
      return null
    }
  }
}

/** 全フィールドを検証し、エラーのあるフィールドだけを持つオブジェクトを返す */
export function validateAll(values: BookingValues, today: Date): BookingErrors {
  const errors: BookingErrors = {}
  for (const field of Object.keys(values) as BookingField[]) {
    const message = validateField(field, values, today)
    if (message) errors[field] = message
  }
  return errors
}
