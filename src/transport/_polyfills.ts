/**
 * Polyfills for AbortSignal static methods and CustomEvent.
 *
 * AbortSignal.timeout() and AbortSignal.any() are not available in all runtimes.
 * CustomEvent may not be available in Node.js environments.
 * This module provides fallback implementations when the native methods are not available.
 */

/** AbortSignal with polyfills for timeout and any. */
export const AbortSignal_ = {
  /**
   * Creates an AbortSignal that will automatically abort after the specified timeout.
   *
   * @param ms - The timeout in milliseconds.
   * @returns An AbortSignal that will abort after the timeout.
   */
  timeout(ms: number): AbortSignal {
    if ("timeout" in AbortSignal && typeof AbortSignal.timeout === "function") {
      return AbortSignal.timeout(ms);
    }

    // Fallback implementation
    const controller = new AbortController();
    setTimeout(() => controller.abort(new DOMException("TimeoutError", "TimeoutError")), ms);
    return controller.signal;
  },

  /**
   * Creates an AbortSignal that will abort when any of the provided signals abort.
   *
   * @param signals - The signals to combine.
   * @returns An AbortSignal that will abort when any of the provided signals abort.
   */
  any(signals: AbortSignal[]): AbortSignal {
    if ("any" in AbortSignal && typeof AbortSignal.any === "function") {
      return AbortSignal.any(signals);
    }

    // Fallback implementation
    const controller = new AbortController();
    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort(signal.reason);
        break;
      }
      signal.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
    }
    return controller.signal;
  },
};

/**
 * CustomEvent polyfill for environments that don't have it natively.
 * This is needed for Node.js environments where CustomEvent may not be available.
 */
export const CustomEvent_: typeof CustomEvent = (() => {
  if (typeof CustomEvent !== "undefined") {
    return CustomEvent;
  }

  // Fallback implementation for Node.js
  return class CustomEvent_<T = unknown> extends Event {
    readonly detail: T;

    constructor(type: string, eventInitDict?: CustomEventInit<T>) {
      super(type, eventInitDict);
      this.detail = eventInitDict?.detail as T;
    }
  } as typeof CustomEvent;
})();
