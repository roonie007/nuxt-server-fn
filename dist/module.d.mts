import * as _nuxt_schema from '@nuxt/schema';

interface ModuleOptions {
    /**
     * @default '/api/__server_fn__'
     */
    apiRoute?: string;
    /**
     * @default ['server/functions']
     */
    dirs?: string[];
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions>;

export { type ModuleOptions, _default as default };
