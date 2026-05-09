// Global save lock to prevent any duplicate saves across the entire app
let isSaving = false;

export function setSaving(saving: boolean) {
  isSaving = saving;
}

export function getSaving(): boolean {
  return isSaving;
}

export function withSaveLock<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    if (isSaving) {
      console.log("[GLOBAL LOCK] Save already in progress, blocking duplicate");
      reject(new Error("Save already in progress"));
      return;
    }
    
    isSaving = true;
    console.log("[GLOBAL LOCK] Acquired save lock");
    
    fn()
      .then((result) => {
        console.log("[GLOBAL LOCK] Save completed, releasing lock");
        isSaving = false;
        resolve(result);
      })
      .catch((error) => {
        console.log("[GLOBAL LOCK] Save failed, releasing lock");
        isSaving = false;
        reject(error);
      });
  });
}
