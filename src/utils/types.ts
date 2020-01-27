export type NodeCallback<T> = (
  error?: Error | null | undefined,
  value?: T,
) => void
