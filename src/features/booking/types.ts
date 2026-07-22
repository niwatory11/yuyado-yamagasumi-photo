export type BookingValues = {
  name: string
  email: string
  phone: string
  checkIn: string
  nights: string
  guests: string
  room: string
  notes: string
}

export type BookingField = keyof BookingValues

export type BookingErrors = Partial<Record<BookingField, string>>

export const emptyBookingValues: BookingValues = {
  name: '',
  email: '',
  phone: '',
  checkIn: '',
  nights: '',
  guests: '',
  room: '',
  notes: '',
}

export const nightsOptions = ['1泊', '2泊', '3泊', '4泊', '5泊'] as const
export const guestsOptions = ['1名', '2名', '3名', '4名'] as const
