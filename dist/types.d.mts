
import type { ModuleOptions } from './module.js'


declare module '@nuxt/schema' {
  interface NuxtConfig { ['serverFn']?: Partial<ModuleOptions> }
  interface NuxtOptions { ['serverFn']?: ModuleOptions }
}

declare module 'nuxt/schema' {
  interface NuxtConfig { ['serverFn']?: Partial<ModuleOptions> }
  interface NuxtOptions { ['serverFn']?: ModuleOptions }
}


export type { ModuleOptions, default } from './module.js'
