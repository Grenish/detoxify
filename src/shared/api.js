/**
 * Cross-browser extension API (Chrome + Firefox).
 * Prefer `browser` when present (Firefox / polyfilled Chrome).
 */
export const api = globalThis.browser ?? globalThis.chrome;

export function storageGet(keys) {
  return new Promise((resolve, reject) => {
    try {
      const result = api.storage.sync.get(keys);
      if (result && typeof result.then === "function") {
        result.then(resolve).catch(reject);
        return;
      }
      api.storage.sync.get(keys, (data) => {
        if (api.runtime?.lastError) {
          reject(new Error(api.runtime.lastError.message));
          return;
        }
        resolve(data);
      });
    } catch (err) {
      reject(err);
    }
  });
}

export function storageSet(values) {
  return new Promise((resolve, reject) => {
    try {
      const result = api.storage.sync.set(values);
      if (result && typeof result.then === "function") {
        result.then(resolve).catch(reject);
        return;
      }
      api.storage.sync.set(values, () => {
        if (api.runtime?.lastError) {
          reject(new Error(api.runtime.lastError.message));
          return;
        }
        resolve();
      });
    } catch (err) {
      reject(err);
    }
  });
}

export function onStorageChanged(listener) {
  if (!api?.storage?.onChanged) return () => {};
  const handler = (changes, area) => {
    if (area === "sync") listener(changes);
  };
  api.storage.onChanged.addListener(handler);
  return () => api.storage.onChanged.removeListener(handler);
}
