import { hash as ohash } from 'ohash'
// @ts-expect-error nuxt
import { useState } from '#app'

declare const $fetch: typeof import('ohmyfetch').$fetch

export type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never
export type ReturnType<T> = T extends (...args: any) => infer R ? R : never

export type Promisify<T> = ReturnType<T> extends Promise<any>
  ? T
  : (...args: ArgumentsType<T>) => Promise<Awaited<ReturnType<T>>>

export type ClientRPC<T> = {
  [K in keyof T]: T[K] extends (...args: any) => any ? Promisify<T[K]> : never
}

export function createServerFn<T>() {
  /**
   * Use server functions in client
   * A POST request to Nuxt server will be created for each function call and will not cache.
   * For a cached version, use `useServerStateFn()`
   */
  function useServerFn() {
    return new Proxy({}, {
      get(_, name) {
        return async (...args: any[]) => {
          return $fetch('/api/__server_fn__', {
            method: 'POST',
            body: {
              name,
              args,
            },
          })
        }
      },
    }) as ClientRPC<T>
  }

  return useServerFn
}

export function createServerStateFn<T>() {
  /**
   * Auto cached version of `useServerFn`. Use `useState` under the hood. The result will be shared across client and server for hydration.
   */
  function useServerStateFn() {
    const _cache = useState('server-fn-cache', () => new Map<string, any>())
    const _promise = useState('server-fn-promise', () => new Map<string, Promise<T>>())

    return new Proxy({}, {
      get(_, name) {
        return async (...args: any[]) => {
          const hash = ohash({ name, args })
          if (_cache.value.has(hash))
            return _cache.value.get(hash)

          if (_promise.value.has(hash))
            return _promise.value.get(hash)

          const request = $fetch('/api/__server_fn__', {
            method: 'POST',
            body: {
              name,
              args,
            },
          })
            .then((r) => {
              _cache.value.set(hash, r)
              _promise.value.delete(hash)
              return r
            })

          _promise.value.set(hash, request)

          return request
        }
      },
    }) as ClientRPC<T>
  }

  return useServerStateFn
}
