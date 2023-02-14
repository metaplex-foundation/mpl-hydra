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
} from '@metaplex-foundation/umi-core';

// Accounts.
export type SetTokenMemberStakeInstructionAccounts = {
  member: Signer;
  fanout: PublicKey;
  membershipVoucher: PublicKey;
  membershipMint: PublicKey;
  membershipMintTokenAccount: PublicKey;
  memberStakeAccount: PublicKey;
  systemProgram?: PublicKey;
  tokenProgram?: PublicKey;
};

// Arguments.
export type SetTokenMemberStakeInstructionData = {
  discriminator: Array<number>;
  shares: bigint;
};

export type SetTokenMemberStakeInstructionArgs = { shares: number | bigint };

export function getSetTokenMemberStakeInstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<
  SetTokenMemberStakeInstructionArgs,
  SetTokenMemberStakeInstructionData
> {
  const s = context.serializer;
  return mapSerializer<
    SetTokenMemberStakeInstructionArgs,
    SetTokenMemberStakeInstructionData,
    SetTokenMemberStakeInstructionData
  >(
    s.struct<SetTokenMemberStakeInstructionData>(
      [
        ['discriminator', s.array(s.u8, 8)],
        ['shares', s.u64],
      ],
      'ProcessSetTokenMemberStakeInstructionArgs'
    ),
    (value) =>
      ({
        ...value,
        discriminator: [167, 29, 12, 30, 44, 193, 249, 142],
      } as SetTokenMemberStakeInstructionData)
  ) as Serializer<
    SetTokenMemberStakeInstructionArgs,
    SetTokenMemberStakeInstructionData
  >;
}

// Instruction.
export function setTokenMemberStake(
  context: Pick<Context, 'serializer' | 'programs'>,
  input: SetTokenMemberStakeInstructionAccounts &
    SetTokenMemberStakeInstructionArgs
): WrappedInstruction {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId: PublicKey = context.programs.get('mplHydra').publicKey;

  // Resolved accounts.
  const memberAccount = input.member;
  const fanoutAccount = input.fanout;
  const membershipVoucherAccount = input.membershipVoucher;
  const membershipMintAccount = input.membershipMint;
  const membershipMintTokenAccountAccount = input.membershipMintTokenAccount;
  const memberStakeAccountAccount = input.memberStakeAccount;
  const systemProgramAccount = input.systemProgram ?? {
    ...context.programs.get('splSystem').publicKey,
    isWritable: false,
  };
  const tokenProgramAccount = input.tokenProgram ?? {
    ...context.programs.get('splToken').publicKey,
    isWritable: false,
  };

  // Member.
  signers.push(memberAccount);
  keys.push({
    pubkey: memberAccount.publicKey,
    isSigner: true,
    isWritable: isWritable(memberAccount, true),
  });

  // Fanout.
  keys.push({
    pubkey: fanoutAccount,
    isSigner: false,
    isWritable: isWritable(fanoutAccount, true),
  });

  // Membership Voucher.
  keys.push({
    pubkey: membershipVoucherAccount,
    isSigner: false,
    isWritable: isWritable(membershipVoucherAccount, true),
  });

  // Membership Mint.
  keys.push({
    pubkey: membershipMintAccount,
    isSigner: false,
    isWritable: isWritable(membershipMintAccount, true),
  });

  // Membership Mint Token Account.
  keys.push({
    pubkey: membershipMintTokenAccountAccount,
    isSigner: false,
    isWritable: isWritable(membershipMintTokenAccountAccount, true),
  });

  // Member Stake Account.
  keys.push({
    pubkey: memberStakeAccountAccount,
    isSigner: false,
    isWritable: isWritable(memberStakeAccountAccount, true),
  });

  // System Program.
  keys.push({
    pubkey: systemProgramAccount,
    isSigner: false,
    isWritable: isWritable(systemProgramAccount, false),
  });

  // Token Program.
  keys.push({
    pubkey: tokenProgramAccount,
    isSigner: false,
    isWritable: isWritable(tokenProgramAccount, false),
  });

  // Data.
  const data =
    getSetTokenMemberStakeInstructionDataSerializer(context).serialize(input);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return {
    instruction: { keys, programId, data },
    signers,
    bytesCreatedOnChain,
  };
}