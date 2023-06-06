import { UmiPlugin } from '@metaplex-foundation/umi';
import { mplToolbox } from '@metaplex-foundation/mpl-toolbox';
import { createMplHydraProgram } from './generated';

export const mplHydra = (): UmiPlugin => ({
  install(umi) {
    umi.use(mplToolbox());
    umi.programs.add(createMplHydraProgram(), false);
  },
});
