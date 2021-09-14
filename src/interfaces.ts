export interface ObjectAny {
  [key: string]: any
}

export interface ExDepOptions {
  type?: 'multiton' | 'singleton',
  key?: string
}

export interface ExDepBase {
  key: string,
  type: 'multiton' | 'singleton'
}

export interface ExDep extends ExDepBase {
  ctr: ObjectAny
  instance?: ObjectAny
}
