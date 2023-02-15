import { Context, Pda, PublicKey, utf8 } from '@metaplex-foundation/umi-core';

export function findFanoutNativeAccountPda(
  context: Pick<Context, 'eddsa' | 'programs' | 'serializer'>,
  seeds: {
    /** The address of the fanout account */
    fanout: PublicKey;
  }
): Pda {
  const s = context.serializer;
  const programId: PublicKey = context.programs.get('mplHydra').publicKey;
  return context.eddsa.findPda(programId, [
    utf8.serialize('fanout-native-account'),
    s.publicKey.serialize(seeds.fanout),
  ]);
}
