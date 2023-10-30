import type {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';

export function genericFirestoreDataConverter<T>(): FirestoreDataConverter<T> {
  return {
    toFirestore(item: T): DocumentData {
      return item as DocumentData;
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions,
    ): T {
      return {
        id: snapshot.id,
        ...snapshot.data(options),
      } as T;
    },
  };
}
