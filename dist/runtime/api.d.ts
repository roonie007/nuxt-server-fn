import type { EventHandler } from 'h3';
export declare function createServerFnAPI<T>(functions: T): EventHandler<T>;
