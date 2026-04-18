/**
 * In-memory stub for @react-native-async-storage/async-storage.
 * MetaMask SDK references this on web; we avoid the real RN package (and react-native peer tree).
 */
const store = new Map();

const AsyncStorage = {
  getItem: async (key) => (store.has(key) ? store.get(key) : null),
  setItem: async (key, value) => {
    store.set(key, String(value));
  },
  removeItem: async (key) => {
    store.delete(key);
  },
  clear: async () => {
    store.clear();
  },
  getAllKeys: async () => Array.from(store.keys()),
  multiGet: async (keys) => keys.map((k) => [k, store.has(k) ? store.get(k) : null]),
  multiSet: async (pairs) => {
    pairs.forEach(([k, v]) => store.set(k, String(v)));
  },
  multiRemove: async (keys) => {
    keys.forEach((k) => store.delete(k));
  },
};

module.exports = AsyncStorage;
module.exports.default = AsyncStorage;
