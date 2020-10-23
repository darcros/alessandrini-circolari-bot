import { getEnv } from '../src/util';

describe('environment variables', () => {
  beforeAll(() => {
    process.env['foo'] = 'something';
    delete process.env['bar'];
  });

  test('gets defined environemnt variable', () => {
    const env = getEnv('foo');
    expect(env).toBeDefined();
  });

  test('gets default values when environemnt variable is undefined', () => {
    const env = getEnv('bar', 'default');
    expect(env).toBe('default');
  });

  test('thows when getting undefined envornment variable without a default', () => {
    expect(() => getEnv('bar')).toThrowErrorMatchingSnapshot();
  });
});
