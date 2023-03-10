/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  AccountMeta,
  Context,
  PublicKey,
  Serializer,
  Signer,
  WrappedInstruction,
  checkForIsWritableOverride as isWritable,
  mapSerializer,
} from '@metaplex-foundation/umi';

// Accounts.
export type RemoveMemberInstructionAccounts = {
  authority?: Signer;
  member: PublicKey;
  fanout: PublicKey;
  membershipAccount: PublicKey;
  destination: PublicKey;
};

// Arguments.
export type RemoveMemberInstructionData = { discriminator: Array<number> };

export type RemoveMemberInstructionDataArgs = {};

export function getRemoveMemberInstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<RemoveMemberInstructionDataArgs, RemoveMemberInstructionData> {
  const s = context.serializer;
  return mapSerializer<
    RemoveMemberInstructionDataArgs,
    RemoveMemberInstructionData,
    RemoveMemberInstructionData
  >(
    s.struct<RemoveMemberInstructionData>(
      [['discriminator', s.array(s.u8(), { size: 8 })]],
      { description: 'RemoveMemberInstructionArgs' }
    ),
    (value) =>
      ({
        ...value,
        discriminator: [9, 45, 36, 163, 245, 40, 150, 85],
      } as RemoveMemberInstructionData)
  ) as Serializer<RemoveMemberInstructionDataArgs, RemoveMemberInstructionData>;
}

// Instruction.
export function removeMember(
  context: Pick<Context, 'serializer' | 'programs' | 'identity'>,
  input: RemoveMemberInstructionAccounts
): WrappedInstruction {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId = context.programs.getPublicKey(
    'mplHydra',
    'hyDQ4Nz1eYyegS6JfenyKwKzYxRsCWCriYSAjtzP4Vg'
  );

  // Resolved accounts.
  const authorityAccount = input.authority ?? context.identity;
  const memberAccount = input.member;
  const fanoutAccount = input.fanout;
  const membershipAccountAccount = input.membershipAccount;
  const destinationAccount = input.destination;

  // Authority.
  signers.push(authorityAccount);
  keys.push({
    pubkey: authorityAccount.publicKey,
    isSigner: true,
    isWritable: isWritable(authorityAccount, true),
  });

  // Member.
  keys.push({
    pubkey: memberAccount,
    isSigner: false,
    isWritable: isWritable(memberAccount, false),
  });

  // Fanout.
  keys.push({
    pubkey: fanoutAccount,
    isSigner: false,
    isWritable: isWritable(fanoutAccount, true),
  });

  // Membership Account.
  keys.push({
    pubkey: membershipAccountAccount,
    isSigner: false,
    isWritable: isWritable(membershipAccountAccount, true),
  });

  // Destination.
  keys.push({
    pubkey: destinationAccount,
    isSigner: false,
    isWritable: isWritable(destinationAccount, true),
  });

  // Data.
  const data = getRemoveMemberInstructionDataSerializer(context).serialize({});

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return {
    instruction: { keys, programId, data },
    signers,
    bytesCreatedOnChain,
  };
}
