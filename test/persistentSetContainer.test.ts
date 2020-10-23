import { mkdir, rmdir } from 'fs/promises';
import { PersistentSetContainer } from '../src/persistentSetContainer';

describe('persistent set container', () => {
  beforeEach(async () => {
    await mkdir('test/tmp/');
  });

  afterEach(async () => {
    await rmdir('test/tmp', { recursive: true });
  });

  test('saves and loads set', async () => {
    const containerA = new PersistentSetContainer<string>('test/tmp/set.json');

    // modifica il set
    const setA = await containerA.get();
    setA.add('foo');
    setA.add('bar');
    setA.add('baz');

    // salva il set
    await containerA.save();

    // carica il set
    const containerB = new PersistentSetContainer<string>('test/tmp/set.json');

    // controlla uguaglianza
    const setB = await containerB.get();

    expect(setB).toEqual(setA);
  });
});
