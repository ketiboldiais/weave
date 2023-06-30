export class PNode<T> {
  data: T | null;
  private parent: () => PNode<T>;
  private children: () => PNode<T>[];
  constructor(data: T | null = null) {
    this.data = data;
    this.parent = () => PNode.none();
    this.children = () => [];
  }
  static none<T>() {
    return new PNode<T>(null);
  }
  static some<T>(data: T) {
    return new PNode<T>(data);
  }
}
