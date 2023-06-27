import { uid } from "../aux.js";

export class Vertex<T = any> {
  /**
   * The vertex’s unique identifier, either a string or a number.
   */
  id: string|number;
  /**
   * The data held by the Vertex, a generic type `T`.
   */
  data: T | null;
  constructor(id: string | number, data: T | null = null) {
    this.id = id;
    this.data = data;
  }
  obj() {
    return {id: this.id, data: this.data};
  }
  /**
   * Returns true if the Vertex’s data field is null.
   */
  nil(): this is Vertex<null> {
    return this.data === null;
  }
  /**
   * Sets the Vertex’s stored data to the return
   * type of the provided callback – a function
   * that takes the vertex’s current data type `T`
   * and returns a generic type `K`.
   */
  map<K>(callback: (data: T) => K): Vertex<K> {
    const data = this.data;
    if (data === null) return this as any as Vertex<K>;
    const newData = callback(data);
    const out = new Vertex(this.id, newData);
    return out;
  }
  

  /**
   * Given a callback that takes the
   * Vertex’s current stored data and returns
   * a Vertex of type `K`, returns a vertex of
   * type `K`.
   */
  chain<K>(callback: (data: T) => Vertex<K>): Vertex<K> {
    const data = this.data;
    if (data === null) return this as any as Vertex<K>;
    if (data instanceof Vertex) {
      const d = data.data;
      if (data === null || data === undefined) {
        return data as any as Vertex<K>;
      }
      const out = callback(d);
      out.id = this.id;
      return out;
    }
    const out = callback(data);
    out.id = this.id;
    return out;
  }

  /**
   * Sets the vertex’s data.
   */
  write(data: T) {
    const out = this.copy();
    out.data = data;
    return out;
  }

  /**
   * Returns a copy of the Vertex.
   */
  copy() {
    const out = new Vertex(this.id, this.data);
    return out;
  }
  /**
   * Sets the {@link Vertex.id}
   */
  key(id: string | number) {
    const out = this.copy();
    out.id = `${id}`;
    return out;
  }
}

export const vtx = <T>(id: string | number, data: T | null=null) => (
  new Vertex(id, data)
);
