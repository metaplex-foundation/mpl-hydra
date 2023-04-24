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
  TransactionBuilder,
  mapSerializer,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import { addObjectProperty, isWritable } from '../shared';

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

// Data.
export type SetTokenMemberStakeInstructionData = {
  discriminator: Array<number>;
  shares: bigint;
};

export type SetTokenMemberStakeInstructionDataArgs = {
  shares: number | bigint;
};

export function getSetTokenMemberStakeInstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<
  SetTokenMemberStakeInstructionDataArgs,
  SetTokenMemberStakeInstructionData
> {
  const s = context.serializer;
  return mapSerializer<
    SetTokenMemberStakeInstructionDataArgs,
    SetTokenMemberStakeInstructionData,
    SetTokenMemberStakeInstructionData
  >(
    s.struct<SetTokenMemberStakeInstructionData>(
      [
        ['discriminator', s.array(s.u8(), { size: 8 })],
        ['shares', s.u64()],
      ],
      { description: 'SetTokenMemberStakeInstructionData' }
    ),
    (value) =>
      ({
        ...value,
        discriminator: [167, 29, 12, 30, 44, 193, 249, 142],
      } as SetTokenMemberStakeInstructionData)
  ) as Serializer<
    SetTokenMemberStakeInstructionDataArgs,
    SetTokenMemberStakeInstructionData
  >;
}

// Args.
export type SetTokenMemberStakeInstructionArgs =
  SetTokenMemberStakeInstructionDataArgs;

// Instruction.
export function setTokenMemberStake(
  context: Pick<Context, 'serializer' | 'programs'>,
  input: SetTokenMemberStakeInstructionAccounts &
    SetTokenMemberStakeInstructionArgs
): TransactionBuilder {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId = {
    ...context.programs.getPublicKey(
      'mplHydra',
      'hyDQ4Nz1eYyegS6JfenyKwKzYxRsCWCriYSAjtzP4Vg'
    ),
    isWritable: false,
  };

  // Resolved inputs.
  const resolvingAccounts = {};
  const resolvingArgs = {};
  addObjectProperty(
    resolvingAccounts,
    'systemProgram',
    input.systemProgram ?? {
      ...context.programs.getPublicKey(
        'splSystem',
        '11111111111111111111111111111111'
      ),
      isWritable: false,
    }
  );
  addObjectProperty(
    resolvingAccounts,
    'tokenProgram',
    input.tokenProgram ?? {
      ...context.programs.getPublicKey(
        'splToken',
        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
      ),
      isWritable: false,
    }
  );
  const resolvedAccounts = { ...input, ...resolvingAccounts };
  const resolvedArgs = { ...input, ...resolvingArgs };

  // Member.
  signers.push(resolvedAccounts.member);
  keys.push({
    pubkey: resolvedAccounts.member.publicKey,
    isSigner: true,
    isWritable: isWritable(resolvedAccounts.member, true),
  });

  // Fanout.
  keys.push({
    pubkey: resolvedAccounts.fanout,
    isSigner: false,
    isWritable: isWritable(resolvedAccounts.fanout, true),
  });

  // Membership Voucher.
  keys.push({
    pubkey: resolvedAccounts.membershipVoucher,
    isSigner: false,
    isWritable: isWritable(resolvedAccounts.membershipVoucher, true),
  });

  // Membership Mint.
  keys.push({
    pubkey: resolvedAccounts.membershipMint,
    isSigner: false,
    isWritable: isWritable(resolvedAccounts.membershipMint, true),
  });

  // Membership Mint Token Account.
  keys.push({
    pubkey: resolvedAccounts.membershipMintTokenAccount,
    isSigner: false,
    isWritable: isWritable(resolvedAccounts.membershipMintTokenAccount, true),
  });

  // Member Stake Account.
  keys.push({
    pubkey: resolvedAccounts.memberStakeAccount,
    isSigner: false,
    isWritable: isWritable(resolvedAccounts.memberStakeAccount, true),
  });

  // System Program.
  keys.push({
    pubkey: resolvedAccounts.systemProgram,
    isSigner: false,
    isWritable: isWritable(resolvedAccounts.systemProgram, false),
  });

  // Token Program.
  keys.push({
    pubkey: resolvedAccounts.tokenProgram,
    isSigner: false,
    isWritable: isWritable(resolvedAccounts.tokenProgram, false),
  });

  // Data.
  const data =
    getSetTokenMemberStakeInstructionDataSerializer(context).serialize(
      resolvedArgs
    );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
