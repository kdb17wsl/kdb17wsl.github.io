// ============================================================
// save.js — IndexedDB 存档：只存章节。
// 数据库里只有一条记录：{ id:1, chapter:N, at:时间戳 }
// 不存数值、不存凭证、不存 flag —— 恢复时从该章开头重新走。
// ============================================================

const DB_NAME = 'jintuikuan';
const STORE = 'progress';
const KEY = 1;

let dbp = null;

function open() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('no indexedDB'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}

function tx(mode, fn) {
  return open().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(req && req.result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  }));
}

// 写入当前章节。失败静默 —— 存档挂了不该影响游戏。
export async function saveChapter(chapter) {
  try {
    await tx('readwrite', s => s.put({ id: KEY, chapter, at: Date.now() }));
    return true;
  } catch (e) {
    return false;
  }
}

// 读取存档。没有则返回 null。
export async function loadChapter() {
  try {
    const rec = await tx('readonly', s => s.get(KEY));
    if (!rec || typeof rec.chapter !== 'number' || rec.chapter <= 0) return null;
    return rec;
  } catch (e) {
    return null;
  }
}

export async function clearSave() {
  try {
    await tx('readwrite', s => s.delete(KEY));
    return true;
  } catch (e) {
    return false;
  }
}
