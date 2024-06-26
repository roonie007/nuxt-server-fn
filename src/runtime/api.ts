import type { EventHandler } from 'h3'
import { createError, eventHandler, isError, readBody } from 'h3'
import { getQuery } from 'ufo'

export function createServerFnAPI<T>(functions: T): EventHandler<T> {
  return eventHandler(async (event) => {
    let name: string | undefined
    let args: any[] = []

    if (event.node.req.method === 'POST') {
      const body = await readBody(event)
      name = body.name
      args = body.args || []
    }
    else {
      const query = getQuery(event.node.req.url!) as Record<string, string>
      name = query.name
      args = JSON.parse(query.args || '[]') || []
    }

    if (!name || !(name in functions)) {
      event.node.res.statusCode = 404
      return
    }

    try {
      const result = await functions[name].apply(event, args)
      return result
    } catch (error) {
      if(isError(error)) {
        const {stack,...rest} = error;

        event.node.res.statusCode = rest.statusCode || 500
        if(!rest.message) {
          rest.message = rest.data?.message || rest.cause?.message ||  ''
        }

        return rest
      }

      throw error
    }
  })
}
