import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { rooms } from '../../data/inn'
import {
  emptyBookingValues,
  guestsOptions,
  nightsOptions,
} from './types'
import type { BookingErrors, BookingField, BookingValues } from './types'
import {
  maxDateString,
  minDateString,
  validateAll,
  validateField,
} from './validation'
import styles from './BookingForm.module.css'

const FIELD_ORDER: BookingField[] = [
  'name',
  'email',
  'phone',
  'checkIn',
  'nights',
  'guests',
  'room',
  'notes',
]

const FIELD_LABELS: Record<BookingField, string> = {
  name: 'お名前',
  email: 'メールアドレス',
  phone: '電話番号',
  checkIn: 'チェックイン日',
  nights: 'ご宿泊数',
  guests: 'ご人数',
  room: 'お部屋タイプ',
  notes: 'ご要望',
}

function fieldId(field: BookingField): string {
  return field === 'room' ? 'bk-room-0' : `bk-${field}`
}

function errorId(field: BookingField): string {
  return `bk-${field}-error`
}

type Status = 'idle' | 'done'

type FieldShellProps = {
  field: BookingField
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
}

/** ラベル+入力+ヒント+エラーの共通枠 */
function FieldShell({ field, required, error, hint, children }: FieldShellProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={fieldId(field)} className={styles.label}>
        {FIELD_LABELS[field]}
        {required && (
          <span className={styles.required} aria-hidden="true">
            必須
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p id={`${fieldId(field)}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId(field)} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}

/** 宿泊予約フォーム(フロントエンドバリデーションのみ。外部送信なし) */
export function BookingForm() {
  const [values, setValues] = useState<BookingValues>(emptyBookingValues)
  const [errors, setErrors] = useState<BookingErrors>({})
  const [showSummary, setShowSummary] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const doneRef = useRef<HTMLDivElement>(null)

  // 送信ボタンがDOMから消えても、キーボードの現在位置を完了表示へ引き継ぐ
  useEffect(() => {
    if (status === 'done') doneRef.current?.focus()
  }, [status])

  const applyError = (field: BookingField, message: string | null) => {
    setErrors((prev) => {
      const next = { ...prev }
      if (message) {
        next[field] = message
      } else {
        delete next[field]
      }
      return next
    })
  }

  const handleChange = (field: BookingField, value: string) => {
    const next = { ...values, [field]: value }
    setValues(next)
    // 一度エラーになった項目は、入力のたびに再検証して直ちに解消を伝える
    if (errors[field]) {
      applyError(field, validateField(field, next, new Date()))
    }
  }

  const handleBlur = (field: BookingField) => {
    applyError(field, validateField(field, values, new Date()))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const all = validateAll(values, new Date())
    setErrors(all)
    const invalidFields = FIELD_ORDER.filter((field) => all[field])

    if (invalidFields.length > 0) {
      setShowSummary(true)
      document.getElementById(fieldId(invalidFields[0]))?.focus()
      return
    }

    setShowSummary(false)
    setStatus('done')
  }

  const describedBy = (field: BookingField, hasHint = false) => {
    const ids: string[] = []
    if (errors[field]) ids.push(errorId(field))
    if (hasHint) ids.push(`${fieldId(field)}-hint`)
    return ids.length > 0 ? ids.join(' ') : undefined
  }

  const inputProps = (field: BookingField) => ({
    id: fieldId(field),
    className: styles.input,
    value: values[field],
    onChange: (e: { target: { value: string } }) =>
      handleChange(field, e.target.value),
    onBlur: () => handleBlur(field),
    'aria-invalid': Boolean(errors[field]),
  })

  if (status === 'done') {
    return (
      <div ref={doneRef} role="status" tabIndex={-1} className={styles.doneBox}>
        <p className={styles.doneTitle}>予約フォームのデモが完了しました</p>
        <p className={styles.doneBody}>
          入力された内容は保存・送信されていません。実在する宿への予約も成立していません。
        </p>
        <p className={styles.doneNote}>ご入力ありがとうございました。</p>
      </div>
    )
  }

  const invalidFields = FIELD_ORDER.filter((field) => errors[field])
  const today = new Date()

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {showSummary && invalidFields.length > 0 && (
        <div role="alert" className={styles.summary}>
          <p className={styles.summaryTitle}>
            入力内容に{invalidFields.length}件の不備があります
          </p>
          <ul className={styles.summaryList}>
            {invalidFields.map((field) => (
              <li key={field}>
                <a
                  href={`#${fieldId(field)}`}
                  className={styles.summaryLink}
                  onClick={(event) => {
                    event.preventDefault()
                    document.getElementById(fieldId(field))?.focus()
                  }}
                >
                  {FIELD_LABELS[field]}: {errors[field]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.grid}>
        <FieldShell field="name" required error={errors.name}>
          <input
            type="text"
            autoComplete="name"
            required
            maxLength={30}
            aria-describedby={describedBy('name')}
            {...inputProps('name')}
          />
        </FieldShell>

        <FieldShell field="email" required error={errors.email}>
          <input
            type="email"
            autoComplete="email"
            required
            aria-describedby={describedBy('email')}
            {...inputProps('email')}
          />
        </FieldShell>

        <FieldShell field="phone" required error={errors.phone}>
          <input
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            placeholder="090-0000-0000"
            aria-describedby={describedBy('phone')}
            {...inputProps('phone')}
          />
        </FieldShell>

        <FieldShell
          field="checkIn"
          required
          error={errors.checkIn}
          hint="ご到着は明日から180日後までの範囲でご指定ください。"
        >
          <input
            type="date"
            required
            min={minDateString(today)}
            max={maxDateString(today)}
            aria-describedby={describedBy('checkIn', true)}
            {...inputProps('checkIn')}
          />
        </FieldShell>

        <FieldShell field="nights" required error={errors.nights}>
          <select
            required
            aria-describedby={describedBy('nights')}
            {...inputProps('nights')}
          >
            <option value="">選択してください</option>
            {nightsOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FieldShell>

        <FieldShell field="guests" required error={errors.guests}>
          <select
            required
            aria-describedby={describedBy('guests')}
            {...inputProps('guests')}
          >
            <option value="">選択してください</option>
            {guestsOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FieldShell>

        <fieldset className={styles.fieldset}>
          <legend className={styles.label}>
            お部屋タイプ
            <span className={styles.required} aria-hidden="true">
              必須
            </span>
          </legend>
          <div className={styles.radioGroup}>
            {rooms.map((room, index) => (
              <label key={room.id} className={styles.radioLabel}>
                <input
                  id={index === 0 ? fieldId('room') : `bk-room-${index}`}
                  type="radio"
                  name="room"
                  required
                  className={styles.radio}
                  value={room.id}
                  checked={values.room === room.id}
                  onChange={(e) => handleChange('room', e.target.value)}
                  onBlur={() => handleBlur('room')}
                />
                <span>
                  「{room.name}」{room.size}
                </span>
              </label>
            ))}
          </div>
          {errors.room && (
            <p id={errorId('room')} className={styles.error}>
              {errors.room}
            </p>
          )}
        </fieldset>

        <FieldShell
          field="notes"
          error={errors.notes}
          hint="お食事のアレルギー、送迎のご希望、お祝い事などがあればご記入ください(400文字まで)。"
        >
          <textarea
            rows={4}
            maxLength={400}
            aria-describedby={describedBy('notes', true)}
            {...inputProps('notes')}
          />
        </FieldShell>
      </div>

      <button type="submit" className={styles.submit}>
        デモ入力を完了する
      </button>
      <p className={styles.formNote}>
        ※ 本サイトはコンセプトサイトです。フォームの内容が送信されることはありません。
      </p>
    </form>
  )
}
