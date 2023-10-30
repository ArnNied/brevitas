import type {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';

export function genericFirestoreDataConverter<T>(): FirestoreDataConverter<T> {
  return {
    toFirestore(item: T): DocumentData {
      return item as DocumentData;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as T & { id: string };
    },
  };
}
