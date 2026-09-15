import { mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { derivePath } from 'ed25519-hd-key';

export function deriveSep0005Seed(
  mnemonic: string,
  index: number,
  invalidMessage = 'Invalid mnemonic',
): Buffer {
  if (!validateMnemonic(mnemonic, wordlist)) {
    throw new Error(invalidMessage);
  }
  const seed = mnemonicToSeedSync(mnemonic);
  const { key } = derivePath(
    `m/44'/148'/${index}'`,
    Buffer.from(seed).toString('hex'),
  );
  return Buffer.from(key);
}
