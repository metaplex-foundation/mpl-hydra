/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  ACCOUNT_HEADER_SIZE,
  AccountMeta,
  Context,
  PublicKey,
  Serializer,
  Signer,
  WrappedInstruction,
  checkForIsWritableOverride as isWritable,
  mapSerializer,
  publicKey,
} from '@metaplex-foundation/umi-core';
import {
  findFanoutMembershipVoucherPda,
  getFanoutMembershipVoucherSize,
} from '../accounts';

// Accounts.
export type AddMemberWalletInstructionAccounts = {
  authority?: Signer;
  member: PublicKey;
  fanout: PublicKey;
  membershipAccount?: PublicKey;
  systemProgram?: PublicKey;
  rent?: PublicKey;
  tokenProgram?: PublicKey;
};

// Arguments.
export type AddMemberWalletInstructionData = {
  discriminator: Array<number>;
  shares: bigint;
};

export type AddMemberWalletInstructionDataArgs = { shares: number | bigint };

export function getAddMemberWalletInstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<
  AddMemberWalletInstructionDataArgs,
  AddMemberWalletInstructionData
> {
  const s = context.serializer;
  return mapSerializer<
    AddMemberWalletInstructionDataArgs,
    AddMemberWalletInstructionData,
    AddMemberWalletInstructionData
  >(
    s.struct<AddMemberWalletInstructionData>(
      [
        ['discriminator', s.array(s.u8(), { size: 8 })],
        ['shares', s.u64()],
      ],
      { description: 'AddMemberWalletInstructionData' }
    ),
    (value) =>
      ({
        ...value,
        discriminator: [201, 9, 59, 128, 69, 117, 220, 235],
      } as AddMemberWalletInstructionData)
  ) as Serializer<
    AddMemberWalletInstructionDataArgs,
    AddMemberWalletInstructionData
  >;
}

// Instruction.
export function addMemberWallet(
  context: Pick<Context, 'serializer' | 'programs' | 'eddsa' | 'identity'>,
  input: AddMemberWalletInstructionAccounts & AddMemberWalletInstructionDataArgs
): WrappedInstruction {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId: PublicKey = context.programs.get('mplHydra').publicKey;

  // Resolved accounts.
  const authorityAccount = input.authority ?? context.identity;
  const memberAccount = input.member;
  const fanoutAccount = input.fanout;
  const membershipAccountAccount =
    input.membershipAccount ??
    findFanoutMembershipVoucherPda(context, {
      fanout: publicKey(fanoutAccount),
      member: publicKey(memberAccount),
    });
  const systemProgramAccount = input.systemProgram ?? {
    ...context.programs.get('splSystem').publicKey,
    isWritable: false,
  };
  const rentAccount =
    input.rent ?? publicKey('SysvarRent111111111111111111111111111111111');
  const tokenProgramAccount = input.tokenProgram ?? {
    ...context.programs.get('splToken').publicKey,
    isWritable: false,
  };

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

  // System Program.
  keys.push({
    pubkey: systemProgramAccount,
    isSigner: false,
    isWritable: isWritable(systemProgramAccount, false),
  });

  // Rent.
  keys.push({
    pubkey: rentAccount,
    isSigner: false,
    isWritable: isWritable(rentAccount, false),
  });

  // Token Program.
  keys.push({
    pubkey: tokenProgramAccount,
    isSigner: false,
    isWritable: isWritable(tokenProgramAccount, false),
  });

  // Data.
  const data =
    getAddMemberWalletInstructionDataSerializer(context).serialize(input);

  // Bytes Created On Chain.
  const bytesCreatedOnChain =
    (getFanoutMembershipVoucherSize(context) ?? 0) + ACCOUNT_HEADER_SIZE;

  return {
    instruction: { keys, programId, data },
    signers,
    bytesCreatedOnChain,
  };
}
