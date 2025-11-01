function getErrorMessage(err: unknown): string {
    if (err instanceof Error) {
        return err.message || String(err)
    }

    try {
        return JSON.stringify(err) || String(err)
    } catch {
        return String(err)
    }
}

export default getErrorMessage