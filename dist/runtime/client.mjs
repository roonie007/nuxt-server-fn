import { hash as ohash } from "ohash";
import { useNuxtApp } from "#app";
export function createServerFunctions(route) {
  return (options = {}) => {
    const { cache = true } = options;
    const nuxt = useNuxtApp();
    const payloadCache = nuxt.payload.functions = nuxt.payload.functions || {};
    const state = nuxt.__server_fn__ || {};
    const promiseMap = state.promiseMap = state.promiseMap || /* @__PURE__ */ new Map();
    let cachedClient;
    let cachelessClient;
    cachelessClient = state.cachelessClient = state.cachelessClient || new Proxy({}, {
      get(_, name) {
        if (name === "$cached")
          return cachedClient;
        return async (...args) => {
          return $fetch(route, {
            method: "POST",
            body: {
              name,
              args
            },
            ...options.fetchOptions || {}
          });
        };
      }
    });
    cachedClient = state.cachedClient = state.cachedClient || new Proxy({}, {
      get(_, name) {
        if (name === "$cacheless")
          return cachelessClient;
        return async (...args) => {
          const body = { name, args };
          const key = args.length === 0 ? name : `${name}-${ohash(args)}`;
          if (key in payloadCache)
            return payloadCache[key];
          if (promiseMap.has(key))
            return promiseMap.get(key);
          const request = $fetch(route, { method: "POST", body, ...options.fetchOptions || {} }).then((r) => {
            payloadCache[key] = r;
            promiseMap.delete(key);
            return r;
          });
          promiseMap.set(key, request);
          return request;
        };
      }
    });
    return cache ? cachedClient : cachelessClient;
  };
}
