/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Context, Serializer } from '@metaplex-foundation/umi-core';

export type AddMemberArgs = { shares: bigint };

export type AddMemberArgsArgs = { shares: number | bigint };

export function getAddMemberArgsSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<AddMemberArgsArgs, AddMemberArgs> {
  const s = context.serializer;
  return s.struct<AddMemberArgs>(
    [['shares', s.u64]],
    'AddMemberArgs'
  ) as Serializer<AddMemberArgsArgs, AddMemberArgs>;
}