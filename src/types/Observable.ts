export type Observable<T> = {
  subscribe(observer: (subject: T) => void): () => void;
};
