import { MetaplexPlugin } from '@metaplex-foundation/umi-core';
import { mplEssentials } from '@lorisleiva/mpl-essentials';
import { getMplHydraProgram } from './generated';

export const mplHydra = (): MetaplexPlugin => ({
  install(metaplex) {
    metaplex.use(mplEssentials());
    metaplex.programs.add(getMplHydraProgram(), false);
  },
});
