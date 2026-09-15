import { deriveSep0005Seed } from './hd-seed';

describe('deriveStellarKeypair', () => {
  it('is deterministic for SEP-0005 index 0', () => {
    const mnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const first = deriveSep0005Seed(mnemonic, 0);
    const second = deriveSep0005Seed(mnemonic, 0);
    expect(first.equals(second)).toBe(true);
    expect(first.length).toBe(32);
  });
});
