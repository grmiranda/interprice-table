// Helpers
export interface KeyValueObject {
  key: string
  value: number
}

// Json data objects
export interface Quote {
  Amount: number
  Currency: string
  Years: number
  CouponType: string
  Spread: number
  Yield: number
  '3MLSpread': number
}

export interface Company {
  Id: string
  DateSent: string
  Company: string
  Preferred: string
  Quote: Array<Quote>
}

// Table data Objects
export interface TableQuote {
  spread: Array<KeyValueObject>
  yield: Array<KeyValueObject>
  '3MLSpread': Array<KeyValueObject>
}

export interface TableCompany {
  id: string
  company: string
  preferred: string
  dateSent: string
  quotes: TableQuote | null
}
