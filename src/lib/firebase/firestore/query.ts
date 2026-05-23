import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { DEFAULT_QUERY_LIMIT } from "@/lib/firebase/firestore/constants";
import { getFirebaseDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";

export function requireFirestore() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Add keys to .env.local (see .env.example).",
    );
  }
  return getFirebaseDb();
}

export type QueryPage<T> = {
  items: T[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
};

export async function queryCollection<T>(options: {
  collectionPath: string;
  constraints?: QueryConstraint[];
  mapDoc: (id: string, data: DocumentData) => T;
  pageSize?: number;
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
}): Promise<QueryPage<T>> {
  const db = requireFirestore();
  const pageSize = options.pageSize ?? DEFAULT_QUERY_LIMIT;

  const constraints: QueryConstraint[] = [
    ...(options.constraints ?? []),
    limit(pageSize),
  ];

  if (options.cursor) {
    constraints.push(startAfter(options.cursor));
  }

  const q = query(collection(db, options.collectionPath), ...constraints);
  const snapshot = await getDocs(q);

  const items = snapshot.docs.map((d) =>
    options.mapDoc(d.id, d.data()),
  );

  const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return {
    items,
    lastDoc,
    hasMore: snapshot.docs.length === pageSize,
  };
}

export { where, orderBy, limit };
