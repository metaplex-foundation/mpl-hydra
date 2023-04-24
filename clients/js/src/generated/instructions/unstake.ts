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
export type UnstakeInstructionAccounts = {
  member: Signer;
  fanout: PublicKey;
  membershipVoucher: PublicKey;
  membershipMint: PublicKey;
  membershipMintTokenAccount: PublicKey;
  memberStakeAccount: PublicKey;
  systemProgram?: PublicKey;
  tokenProgram?: PublicKey;
  instructions: PublicKey;
};

// Data.
export type UnstakeInstructionData = { discriminator: Array<number> };

export type UnstakeInstructionDataArgs = {};

export function getUnstakeInstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<UnstakeInstructionDataArgs, UnstakeInstructionData> {
  const s = context.serializer;
  return mapSerializer<
    UnstakeInstructionDataArgs,
    UnstakeInstructionData,
    UnstakeInstructionData
  >(
    s.struct<UnstakeInstructionData>(
      [['discriminator', s.array(s.u8(), { size: 8 })]],
      { description: 'UnstakeInstructionData' }
    ),
    (value) =>
      ({
        ...value,
        discriminator: [217, 160, 136, 174, 149, 62, 79, 133],
      } as UnstakeInstructionData)
  ) as Serializer<UnstakeInstructionDataArgs, UnstakeInstructionData>;
}

// Instruction.
export function unstake(
  context: Pick<Context, 'serializer' | 'programs'>,
  input: UnstakeInstructionAccounts
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

  // Instructions.
  keys.push({
    pubkey: resolvedAccounts.instructions,
    isSigner: false,
    isWritable: isWritable(resolvedAccounts.instructions, false),
  });

  // Data.
  const data = getUnstakeInstructionDataSerializer(context).serialize({});

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
