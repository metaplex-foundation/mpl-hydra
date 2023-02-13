/* eslint-disable import/no-extraneous-dependencies */
import { createMetaplex as baseCreateMetaplex } from '@metaplex-foundation/umi-test';
import { mplHydra } from '../src';

export const createMetaplex = async () =>
  (await baseCreateMetaplex()).use(mplHydra());
