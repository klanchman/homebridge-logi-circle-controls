/**
 * Merges types T and U, overwriting duplicate definitions with the definition
 * from U
 *
 * @example
 * // Yields { a?: string, b: string, c: string[] }
 * Merge<{ a: number, b: string }, { a?: string, c: string[] }>
 */
export type Merge<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U
