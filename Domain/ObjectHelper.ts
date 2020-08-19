export type NoUndefinedField<T> = { [P in keyof T]-?: NonNullable<T[P]> };
export const dropNullableField = <T> (obj: T): NoUndefinedField<T> => Object.fromEntries(
  Object.entries(obj)
    .filter(([_, val]) => val !== undefined && val !== null)
) as NoUndefinedField<T>;
