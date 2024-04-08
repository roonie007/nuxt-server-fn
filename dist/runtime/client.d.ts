export type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never;
export type ReturnType<T> = T extends (...args: any) => infer R ? R : never;
export type Promisify<T> = ReturnType<T> extends Promise<any> ? (...args: ArgumentsType<T>) => ReturnType<T> : (...args: ArgumentsType<T>) => Promise<Awaited<ReturnType<T>>>;
export type FunctionsClient<T> = {
    [K in keyof T]: T[K] extends (...args: any) => any ? Promisify<T[K]> : never;
};
export type CachedFunctionsClient<T> = FunctionsClient<T> & {
    /**
     * Get uncached version of the functions
     */
    $cacheless: CachelessFunctionsClient<T>;
};
export type CachelessFunctionsClient<T> = FunctionsClient<T> & {
    /**
     * Get cached version of the functions
     */
    $cached: CachedFunctionsClient<T>;
};
export interface ServerFunctionsOptions<Cache extends boolean = true> {
    /**
     * Cache result with same arguments for hydration
     *
     * @default true
     */
    cache?: Cache;
}
export declare function createServerFunctions<T>(route: string): <C extends boolean = true>(options?: ServerFunctionsOptions<C>) => C extends false ? CachelessFunctionsClient<T> : CachedFunctionsClient<T>;
