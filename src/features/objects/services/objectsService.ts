// Objects service - handles object persistence and real-time sync
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { ref, set, onValue, remove } from 'firebase/database';
import { db, rtdb } from '@/shared/lib/firebase';
import { CanvasObject } from '@/shared/types';
import { ObjectUpdate } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new object and persist to Firestore
 */
export async function createObject(
  canvasId: string,
  object: Omit<CanvasObject, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CanvasObject> {
  const id = uuidv4();
  const now = Date.now();
  
  const newObject: CanvasObject = {
    ...object,
    id,
    createdAt: now,
    updatedAt: now,
  };
  
  // Persist to Firestore
  const objectRef = doc(db, 'canvases', canvasId, 'objects', id);
  await setDoc(objectRef, newObject);
  
  // Broadcast creation via RTDB
  await broadcastObjectUpdate(canvasId, {
    id,
    updates: newObject,
    timestamp: now,
  });
  
  return newObject;
}

/**
 * Update an existing object
 */
export async function updateObject(
  canvasId: string,
  objectId: string,
  updates: Partial<CanvasObject>
): Promise<void> {
  const now = Date.now();
  const objectRef = doc(db, 'canvases', canvasId, 'objects', objectId);
  
  // Update in Firestore
  await updateDoc(objectRef, {
    ...updates,
    updatedAt: now,
  });
  
  // Broadcast update via RTDB
  await broadcastObjectUpdate(canvasId, {
    id: objectId,
    updates: { ...updates, updatedAt: now },
    timestamp: now,
  });
}

/**
 * Delete an object
 */
export async function deleteObject(canvasId: string, objectId: string): Promise<void> {
  const objectRef = doc(db, 'canvases', canvasId, 'objects', objectId);
  await deleteDoc(objectRef);
  
  // Broadcast deletion via RTDB
  const deltaRef = ref(rtdb, `deltas/${canvasId}/${objectId}`);
  await set(deltaRef, {
    id: objectId,
    deleted: true,
    timestamp: Date.now(),
  });
}

/**
 * Get all objects for a canvas
 */
export async function getCanvasObjects(canvasId: string): Promise<CanvasObject[]> {
  const objectsRef = collection(db, 'canvases', canvasId, 'objects');
  const snapshot = await getDocs(objectsRef);
  
  return snapshot.docs.map((doc) => doc.data() as CanvasObject);
}

/**
 * Get a single object
 */
export async function getObject(canvasId: string, objectId: string): Promise<CanvasObject | null> {
  const objectRef = doc(db, 'canvases', canvasId, 'objects', objectId);
  const snapshot = await getDoc(objectRef);
  
  if (!snapshot.exists()) return null;
  
  return snapshot.data() as CanvasObject;
}

/**
 * Broadcast object update via RTDB (for real-time sync)
 */
async function broadcastObjectUpdate(canvasId: string, update: ObjectUpdate): Promise<void> {
  const deltaRef = ref(rtdb, `deltas/${canvasId}/${update.id}`);
  await set(deltaRef, update);
  
  // Clear delta after a short delay (it's already in Firestore)
  setTimeout(async () => {
    try {
      await remove(deltaRef);
    } catch (error) {
      console.error('Failed to clear delta:', error);
    }
  }, 5000);
}

/**
 * Broadcast real-time position update during drag (RTDB only, no Firestore)
 * This is for smooth real-time sync without persisting every frame
 */
export async function broadcastPositionUpdate(
  canvasId: string,
  objectId: string,
  position: { x: number; y: number }
): Promise<void> {
  const deltaRef = ref(rtdb, `deltas/${canvasId}/${objectId}`);
  await set(deltaRef, {
    id: objectId,
    updates: { position },
    timestamp: Date.now(),
  });
}

/**
 * Broadcast real-time transform update during resize/rotate (RTDB only, no Firestore)
 * This is for smooth real-time sync of transformations
 */
export async function broadcastTransformUpdate(
  canvasId: string,
  objectId: string,
  updates: {
    position?: { x: number; y: number };
    width?: number;
    height?: number;
    rotation?: number;
  }
): Promise<void> {
  const deltaRef = ref(rtdb, `deltas/${canvasId}/${objectId}`);
  await set(deltaRef, {
    id: objectId,
    updates,
    timestamp: Date.now(),
  });
}

/**
 * Broadcast that a user is starting to transform an object
 */
export async function broadcastTransformStart(
  canvasId: string,
  objectId: string,
  userId: string
): Promise<void> {
  const deltaRef = ref(rtdb, `deltas/${canvasId}/${objectId}`);
  await set(deltaRef, {
    id: objectId,
    updates: { transformingBy: userId },
    timestamp: Date.now(),
  });
}

/**
 * Broadcast that a user has finished transforming an object
 */
export async function broadcastTransformEnd(
  canvasId: string,
  objectId: string
): Promise<void> {
  const deltaRef = ref(rtdb, `deltas/${canvasId}/${objectId}`);
  await set(deltaRef, {
    id: objectId,
    updates: { transformingBy: undefined },
    timestamp: Date.now(),
  });
}

/**
 * Subscribe to object updates via RTDB
 */
export function subscribeToObjectUpdates(
  canvasId: string,
  callback: (update: ObjectUpdate) => void
): () => void {
  const deltasRef = ref(rtdb, `deltas/${canvasId}`);
  
  const unsubscribe = onValue(deltasRef, (snapshot) => {
    const deltas = snapshot.val() || {};
    
    Object.values(deltas).forEach((delta) => {
      if (delta && typeof delta === 'object' && 'id' in delta) {
        callback(delta as ObjectUpdate);
      }
    });
  });
  
  return unsubscribe;
}

/**
 * Subscribe to all objects in Firestore (initial load and changes)
 */
export function subscribeToCanvasObjects(
  canvasId: string,
  callback: (objects: CanvasObject[]) => void
): () => void {
  const objectsRef = collection(db, 'canvases', canvasId, 'objects');
  
  const unsubscribe = onSnapshot(objectsRef, (snapshot) => {
    const objects = snapshot.docs.map((doc) => doc.data() as CanvasObject);
    callback(objects);
  });
  
  return unsubscribe;
}

