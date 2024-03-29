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
  Pda,
  PublicKey,
  Signer,
  TransactionBuilder,
  publicKey,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import {
  Serializer,
  array,
  bool,
  mapSerializer,
  struct,
  u8,
} from '@metaplex-foundation/umi/serializers';
import { addAccountMeta, addObjectProperty } from '../shared';

// Accounts.
export type DistributeNftInstructionAccounts = {
  payer?: Signer;
  member: PublicKey | Pda;
  membershipMintTokenAccount: PublicKey | Pda;
  membershipKey: PublicKey | Pda;
  membershipVoucher: PublicKey | Pda;
  fanout: PublicKey | Pda;
  holdingAccount: PublicKey | Pda;
  fanoutForMint: PublicKey | Pda;
  fanoutForMintMembershipVoucher: PublicKey | Pda;
  fanoutMint: PublicKey | Pda;
  fanoutMintMemberTokenAccount: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
  rent?: PublicKey | Pda;
  tokenProgram?: PublicKey | Pda;
};

// Data.
export type DistributeNftInstructionData = {
  discriminator: Array<number>;
  distributeForMint: boolean;
};

export type DistributeNftInstructionDataArgs = { distributeForMint: boolean };

/** @deprecated Use `getDistributeNftInstructionDataSerializer()` without any argument instead. */
export function getDistributeNftInstructionDataSerializer(
  _context: object
): Serializer<DistributeNftInstructionDataArgs, DistributeNftInstructionData>;
export function getDistributeNftInstructionDataSerializer(): Serializer<
  DistributeNftInstructionDataArgs,
  DistributeNftInstructionData
>;
export function getDistributeNftInstructionDataSerializer(
  _context: object = {}
): Serializer<DistributeNftInstructionDataArgs, DistributeNftInstructionData> {
  return mapSerializer<
    DistributeNftInstructionDataArgs,
    any,
    DistributeNftInstructionData
  >(
    struct<DistributeNftInstructionData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['distributeForMint', bool()],
      ],
      { description: 'DistributeNftInstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: [108, 240, 68, 81, 144, 83, 58, 153],
    })
  ) as Serializer<
    DistributeNftInstructionDataArgs,
    DistributeNftInstructionData
  >;
}

// Args.
export type DistributeNftInstructionArgs = DistributeNftInstructionDataArgs;

// Instruction.
export function distributeNft(
  context: Pick<Context, 'programs' | 'payer'>,
  input: DistributeNftInstructionAccounts & DistributeNftInstructionArgs
): TransactionBuilder {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId = context.programs.getPublicKey(
    'mplHydra',
    'hyDQ4Nz1eYyegS6JfenyKwKzYxRsCWCriYSAjtzP4Vg'
  );

  // Resolved inputs.
  const resolvedAccounts = {
    member: [input.member, true] as const,
    membershipMintTokenAccount: [
      input.membershipMintTokenAccount,
      true,
    ] as const,
    membershipKey: [input.membershipKey, false] as const,
    membershipVoucher: [input.membershipVoucher, true] as const,
    fanout: [input.fanout, true] as const,
    holdingAccount: [input.holdingAccount, true] as const,
    fanoutForMint: [input.fanoutForMint, true] as const,
    fanoutForMintMembershipVoucher: [
      input.fanoutForMintMembershipVoucher,
      true,
    ] as const,
    fanoutMint: [input.fanoutMint, false] as const,
    fanoutMintMemberTokenAccount: [
      input.fanoutMintMemberTokenAccount,
      true,
    ] as const,
  };
  const resolvingArgs = {};
  addObjectProperty(
    resolvedAccounts,
    'payer',
    input.payer
      ? ([input.payer, false] as const)
      : ([context.payer, false] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'systemProgram',
    input.systemProgram
      ? ([input.systemProgram, false] as const)
      : ([
          context.programs.getPublicKey(
            'splSystem',
            '11111111111111111111111111111111'
          ),
          false,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'rent',
    input.rent
      ? ([input.rent, false] as const)
      : ([
          publicKey('SysvarRent111111111111111111111111111111111'),
          false,
        ] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'tokenProgram',
    input.tokenProgram
      ? ([input.tokenProgram, false] as const)
      : ([
          context.programs.getPublicKey(
            'splToken',
            'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
          ),
          false,
        ] as const)
  );
  const resolvedArgs = { ...input, ...resolvingArgs };

  addAccountMeta(keys, signers, resolvedAccounts.payer, false);
  addAccountMeta(keys, signers, resolvedAccounts.member, false);
  addAccountMeta(
    keys,
    signers,
    resolvedAccounts.membershipMintTokenAccount,
    false
  );
  addAccountMeta(keys, signers, resolvedAccounts.membershipKey, false);
  addAccountMeta(keys, signers, resolvedAccounts.membershipVoucher, false);
  addAccountMeta(keys, signers, resolvedAccounts.fanout, false);
  addAccountMeta(keys, signers, resolvedAccounts.holdingAccount, false);
  addAccountMeta(keys, signers, resolvedAccounts.fanoutForMint, false);
  addAccountMeta(
    keys,
    signers,
    resolvedAccounts.fanoutForMintMembershipVoucher,
    false
  );
  addAccountMeta(keys, signers, resolvedAccounts.fanoutMint, false);
  addAccountMeta(
    keys,
    signers,
    resolvedAccounts.fanoutMintMemberTokenAccount,
    false
  );
  addAccountMeta(keys, signers, resolvedAccounts.systemProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.rent, false);
  addAccountMeta(keys, signers, resolvedAccounts.tokenProgram, false);

  // Data.
  const data =
    getDistributeNftInstructionDataSerializer().serialize(resolvedArgs);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
