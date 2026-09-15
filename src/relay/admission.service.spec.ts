import { execFileSync } from 'node:child_process';

describe('deserializeRelayPackage', () => {
  it('rejects invalid bodies and accepts a v1 package', () => {
    const script = `
      import { deserializeRelayPackage, RELAY_PACKAGE_VERSION_V1 } from '@arcanetech/privacy-sdk-relay';
      const empty = deserializeRelayPackage({});
      const bad = deserializeRelayPackage({ version: 2, proofBytes: 'aa' });
      const ok = deserializeRelayPackage({
        version: RELAY_PACKAGE_VERSION_V1,
        poolSelector: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        zkConfigNonce: '3',
        proofBytes: 'aabb',
        publicSignals: '0011',
        applicationIdHints: ['1', '1', '1', '1'],
      });
      console.log(JSON.stringify({
        empty: empty === undefined,
        bad: bad === undefined,
        ok: Boolean(ok && ok.poolSelector.includes('CDLZ') && ok.zkConfigNonce === '3'),
      }));
    `;
    const output = execFileSync(process.execPath, ['--input-type=module', '-e', script], {
      encoding: 'utf8',
      cwd: process.cwd(),
    });
    expect(JSON.parse(output)).toEqual({ empty: true, bad: true, ok: true });
  });
});
