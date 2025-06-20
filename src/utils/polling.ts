import { err, Result } from "neverthrow";

type Options<T,E> = {
    task: () => Promise<Result<T, E>>;
    validate: (result: Result<T,E>) => boolean
    intervalMS: number,
    timeoutMs: number,
    onRetry?: (attempt: number) => void
}

export const polling =  async<T, E>(options: Options<T,E>): Promise<Result<T,E>> => {
    const start = Date.now()
    let attempt = 0

    while((Date.now() - start) < options.timeoutMs) {
        const result = await options.task()
        if(options.validate(result)) return result

        attempt++
        options.onRetry?.(attempt)
        await new Promise(res => setTimeout(res, options.intervalMS))
    }

    return err(new Error("Polling timed out") as E)
}