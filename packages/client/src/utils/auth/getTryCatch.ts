type TryCatchResult<T> = [T, null] | [null, unknown]

export default async <T>(promise: Promise<T>): Promise<TryCatchResult<T>> => {
  try {
    const res = await promise

    return [res, null]
  } catch (err: unknown) {
    return [null, err]
  }
}
