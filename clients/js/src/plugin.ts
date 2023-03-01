import { UmiPlugin } from '@metaplex-foundation/umi';
import { mplEssentials } from '@metaplex-foundation/mpl-essentials';
import { getMplHydraProgram } from './generated';

export const mplHydra = (): UmiPlugin => ({
  install(umi) {
    umi.use(mplEssentials());
    umi.programs.add(getMplHydraProgram(), false);
  },
});
