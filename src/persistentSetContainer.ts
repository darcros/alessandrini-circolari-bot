import { readFile, writeFile, mkdir } from "fs/promises";
import { dirname } from "path";

export class PersistentSetContainer<T> {
  private set: Set<T> = null;
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.load();
  }

  public async get(): Promise<Set<T>> {
    if (this.set === null) {
      this.set = await this.load();
    }

    return this.set;
  }

  private async load(): Promise<Set<T>> {
    try {
      const buf = await readFile(this.filePath);
      const arr = JSON.parse(buf.toString());
      return new Set(arr);
    } catch (_) {
      return new Set();
    }
  }

  public async save(): Promise<void> {
    const urls = [...this.set.values()];
    const jsonString = JSON.stringify(urls, null, 2);

    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, jsonString);
  }
}
