import { UmiPlugin } from '@metaplex-foundation/umi';
import { mplEssentials } from '@metaplex-foundation/mpl-essentials';
import { createMplHydraProgram } from './generated';

export const mplHydra = (): UmiPlugin => ({
  install(umi) {
    umi.use(mplEssentials());
    umi.programs.add(createMplHydraProgram(), false);
  },
});
