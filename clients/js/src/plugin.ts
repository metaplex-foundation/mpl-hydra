import { UmiPlugin } from '@metaplex-foundation/umi-core';
import { mplEssentials } from '@lorisleiva/mpl-essentials';
import { getMplHydraProgram } from './generated';

export const mplHydra = (): UmiPlugin => ({
  install(umi) {
    umi.use(mplEssentials());
    umi.programs.add(getMplHydraProgram(), false);
  },
});
