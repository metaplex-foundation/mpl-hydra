/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Serializer, scalarEnum } from '@metaplex-foundation/umi/serializers';

export enum MembershipModel {
  Wallet,
  Token,
  NFT,
}

export type MembershipModelArgs = MembershipModel;

/** @deprecated Use `getMembershipModelSerializer()` without any argument instead. */
export function getMembershipModelSerializer(
  _context: object
): Serializer<MembershipModelArgs, MembershipModel>;
export function getMembershipModelSerializer(): Serializer<
  MembershipModelArgs,
  MembershipModel
>;
export function getMembershipModelSerializer(
  _context: object = {}
): Serializer<MembershipModelArgs, MembershipModel> {
  return scalarEnum<MembershipModel>(MembershipModel, {
    description: 'MembershipModel',
  }) as Serializer<MembershipModelArgs, MembershipModel>;
}
