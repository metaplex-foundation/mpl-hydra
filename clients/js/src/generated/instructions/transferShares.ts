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
export type TransferSharesInstructionAccounts = {
  authority?: Signer;
  fromMember: PublicKey;
  toMember: PublicKey;
  fanout: PublicKey;
  fromMembershipAccount: PublicKey;
  toMembershipAccount: PublicKey;
};

// Arguments.
export type TransferSharesInstructionData = {
  discriminator: Array<number>;
  shares: bigint;
};

export type TransferSharesInstructionDataArgs = { shares: number | bigint };

export function getTransferSharesInstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<
  TransferSharesInstructionDataArgs,
  TransferSharesInstructionData
> {
  const s = context.serializer;
  return mapSerializer<
    TransferSharesInstructionDataArgs,
    TransferSharesInstructionData,
    TransferSharesInstructionData
  >(
    s.struct<TransferSharesInstructionData>(
      [
        ['discriminator', s.array(s.u8(), { size: 8 })],
        ['shares', s.u64()],
      ],
      { description: 'TransferSharesInstructionArgs' }
    ),
    (value) =>
      ({
        ...value,
        discriminator: [195, 175, 36, 50, 101, 22, 28, 87],
      } as TransferSharesInstructionData)
  ) as Serializer<
    TransferSharesInstructionDataArgs,
    TransferSharesInstructionData
  >;
}

// Instruction.
export function transferShares(
  context: Pick<Context, 'serializer' | 'programs' | 'identity'>,
  input: TransferSharesInstructionAccounts & TransferSharesInstructionDataArgs
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
  const fromMemberAccount = input.fromMember;
  const toMemberAccount = input.toMember;
  const fanoutAccount = input.fanout;
  const fromMembershipAccountAccount = input.fromMembershipAccount;
  const toMembershipAccountAccount = input.toMembershipAccount;

  // Authority.
  signers.push(authorityAccount);
  keys.push({
    pubkey: authorityAccount.publicKey,
    isSigner: true,
    isWritable: isWritable(authorityAccount, false),
  });

  // From Member.
  keys.push({
    pubkey: fromMemberAccount,
    isSigner: false,
    isWritable: isWritable(fromMemberAccount, false),
  });

  // To Member.
  keys.push({
    pubkey: toMemberAccount,
    isSigner: false,
    isWritable: isWritable(toMemberAccount, false),
  });

  // Fanout.
  keys.push({
    pubkey: fanoutAccount,
    isSigner: false,
    isWritable: isWritable(fanoutAccount, true),
  });

  // From Membership Account.
  keys.push({
    pubkey: fromMembershipAccountAccount,
    isSigner: false,
    isWritable: isWritable(fromMembershipAccountAccount, true),
  });

  // To Membership Account.
  keys.push({
    pubkey: toMembershipAccountAccount,
    isSigner: false,
    isWritable: isWritable(toMembershipAccountAccount, true),
  });

  // Data.
  const data =
    getTransferSharesInstructionDataSerializer(context).serialize(input);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return {
    instruction: { keys, programId, data },
    signers,
    bytesCreatedOnChain,
  };
}
