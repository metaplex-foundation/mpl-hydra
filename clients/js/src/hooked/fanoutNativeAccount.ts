import { Context, Pda, PublicKey } from '@metaplex-foundation/umi-core';

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
    s.string({ size: 'variable' }).serialize('fanout-native-account'),
    s.publicKey().serialize(seeds.fanout),
  ]);
}
