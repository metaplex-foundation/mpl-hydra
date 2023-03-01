/* eslint-disable import/no-extraneous-dependencies */
import { createUmi as baseCreateUmi } from '@metaplex-foundation/umi-bundle-tests';
import { mplHydra } from '../src';

export const createUmi = async () => (await baseCreateUmi()).use(mplHydra());
