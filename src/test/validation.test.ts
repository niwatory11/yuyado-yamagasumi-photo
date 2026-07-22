import { describe, expect, it } from 'vitest'
import { emptyBookingValues } from '../features/booking/types'
import type { BookingValues } from '../features/booking/types'
import {
  MAX_AHEAD_DAYS,
  maxDateString,
  minDateString,
  validateAll,
  validateField,
} from '../features/booking/validation'

/** テスト基準日: 2026-07-20(月)。日付境界を決定的に検証する */
const TODAY = new Date(2026, 6, 20)

function valid(overrides: Partial<BookingValues> = {}): BookingValues {
  return {
    ...emptyBookingValues,
    name: '山田 花子',
    email: 'hanako@example.co.jp',
    phone: '090-1234-5678',
    checkIn: '2026-08-20',
    nights: '1泊',
    guests: '2名',
    room: 'akari',
    notes: '',
    ...overrides,
  }
}

describe('validateField: 必須と文字数', () => {
  it('氏名・メール・電話が空ならエラーになる', () => {
    const values = valid({ name: '', email: '', phone: '' })
    expect(validateField('name', values, TODAY)).toMatch('お名前')
    expect(validateField('email', values, TODAY)).toMatch('メールアドレス')
    expect(validateField('phone', values, TODAY)).toMatch('電話番号')
  })

  it('ご要望は任意だが400文字を超えるとエラーになる', () => {
    expect(validateField('notes', valid({ notes: '' }), TODAY)).toBeNull()
    expect(
      validateField('notes', valid({ notes: 'あ'.repeat(401) }), TODAY),
    ).toMatch('400文字')
  })

  it('選択項目(泊数・人数・部屋)は未選択でエラーになる', () => {
    const values = valid({ nights: '', guests: '', room: '' })
    expect(validateField('nights', values, TODAY)).toMatch('宿泊数')
    expect(validateField('guests', values, TODAY)).toMatch('人数')
    expect(validateField('room', values, TODAY)).toMatch('部屋タイプ')
  })
})

describe('validateField: メールアドレスと電話番号', () => {
  it('メール形式が不正ならエラーになる', () => {
    for (const email of ['hanako', 'hanako@', 'hanako@example', '@example.com']) {
      expect(validateField('email', valid({ email }), TODAY)).not.toBeNull()
    }
    expect(validateField('email', valid({ email: 'a@b.co' }), TODAY)).toBeNull()
  })

  it('電話番号はハイフン許容の10〜11桁', () => {
    expect(validateField('phone', valid({ phone: '0261234567' }), TODAY)).toBeNull()
    expect(
      validateField('phone', valid({ phone: '090-1234-5678' }), TODAY),
    ).toBeNull()
    expect(validateField('phone', valid({ phone: '123-4567' }), TODAY)).not.toBeNull()
  })
})

describe('validateField: チェックイン日の境界', () => {
  it('翌日(最短)は受け付け、当日は拒否する', () => {
    // TODAY=7/20 → 最短は 7/21
    expect(
      validateField('checkIn', valid({ checkIn: '2026-07-21' }), TODAY),
    ).toBeNull()
    expect(
      validateField('checkIn', valid({ checkIn: '2026-07-20' }), TODAY),
    ).toMatch('翌日')
  })

  it('180日後(上限)は受け付け、181日後は拒否する', () => {
    // TODAY=7/20 → 上限は 2027-01-16
    expect(
      validateField('checkIn', valid({ checkIn: '2027-01-16' }), TODAY),
    ).toBeNull()
    expect(
      validateField('checkIn', valid({ checkIn: '2027-01-17' }), TODAY),
    ).toMatch(`${MAX_AHEAD_DAYS}日後`)
  })

  it('存在しない日付は形式エラーになる', () => {
    expect(
      validateField('checkIn', valid({ checkIn: '2026-02-30' }), TODAY),
    ).toMatch('形式')
  })

  it('min/max 属性用の文字列が境界と一致する', () => {
    expect(minDateString(TODAY)).toBe('2026-07-21')
    expect(maxDateString(TODAY)).toBe('2027-01-16')
  })
})

describe('validateAll', () => {
  it('すべて正しければ空オブジェクトを返す', () => {
    expect(validateAll(valid(), TODAY)).toEqual({})
  })

  it('不正な項目だけを列挙する', () => {
    const errors = validateAll(valid({ email: 'broken', room: '' }), TODAY)
    expect(Object.keys(errors).sort()).toEqual(['email', 'room'])
  })

  it('空フォームでは任意項目(ご要望)以外がエラーになる', () => {
    const errors = validateAll(emptyBookingValues, TODAY)
    expect(errors.notes).toBeUndefined()
    expect(Object.keys(errors)).toHaveLength(7)
  })
})
