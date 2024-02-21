import { atob, isBackendService, isJSAllowed } from "../utilities"
import cloneDeep from "lodash.clonedeep"
import { LITERAL_MARKER } from "../helpers/constants"
import { getJsHelperList } from "./list"

// The method of executing JS scripts depends on the bundle being built.
// This setter is used in the entrypoint (either index.js or index.mjs).
let runJS
export const setJSRunner = runner => (runJS = runner)

export const removeJSRunner = () => (runJS = undefined)

let onErrorLog
export const setOnErrorLog = delegate => (onErrorLog = delegate)

// Helper utility to strip square brackets from a value
const removeSquareBrackets = value => {
  if (!value || typeof value !== "string") {
    return value
  }
  const regex = /\[+(.+)]+/
  const matches = value.match(regex)
  if (matches && matches[1]) {
    return matches[1]
  }
  return value
}

// Our context getter function provided to JS code as $.
// Extracts a value from context.
const getContextValue = (path, context) => {
  let data = context
  path.split(".").forEach(key => {
    if (data == null || typeof data !== "object") {
      return null
    }
    data = data[removeSquareBrackets(key)]
  })
  return data
}

// Evaluates JS code against a certain context
export function processJS(handlebars, context) {
  if (!isJSAllowed() || (isBackendService() && !runJS)) {
    throw new Error("JS disabled in environment.")
  }
  try {
    // Wrap JS in a function and immediately invoke it.
    // This is required to allow the final `return` statement to be valid.
    const js = `(function(){${atob(handlebars)}})();`

    // Our $ context function gets a value from context.
    // We clone the context to avoid mutation in the binding affecting real
    // app context.
    const sandboxContext = {
      $: path => getContextValue(path, cloneDeep(context)),
      helpers: getJsHelperList(),
    }

    // Create a sandbox with our context and run the JS
    const res = { data: runJS(js, sandboxContext) }
    return `{{${LITERAL_MARKER} js_result-${JSON.stringify(res)}}}`
  } catch (error) {
    onErrorLog && onErrorLog(error)

    if (error.code === "ERR_SCRIPT_EXECUTION_TIMEOUT") {
      return "Timed out while executing JS"
    }
    if (error.name === "ExecutionTimeoutError") {
      return "Request JS execution limit hit"
    }
    return "Error while executing JS"
  }
}
