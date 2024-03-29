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
  mapSerializer,
  struct,
  u64,
  u8,
} from '@metaplex-foundation/umi/serializers';
import { addAccountMeta, addObjectProperty } from '../shared';

// Accounts.
export type AddMemberNftInstructionAccounts = {
  authority?: Signer;
  fanout: PublicKey | Pda;
  membershipAccount: PublicKey | Pda;
  mint: PublicKey | Pda;
  metadata: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
  rent?: PublicKey | Pda;
  tokenProgram?: PublicKey | Pda;
};

// Data.
export type AddMemberNftInstructionData = {
  discriminator: Array<number>;
  shares: bigint;
};

export type AddMemberNftInstructionDataArgs = { shares: number | bigint };

/** @deprecated Use `getAddMemberNftInstructionDataSerializer()` without any argument instead. */
export function getAddMemberNftInstructionDataSerializer(
  _context: object
): Serializer<AddMemberNftInstructionDataArgs, AddMemberNftInstructionData>;
export function getAddMemberNftInstructionDataSerializer(): Serializer<
  AddMemberNftInstructionDataArgs,
  AddMemberNftInstructionData
>;
export function getAddMemberNftInstructionDataSerializer(
  _context: object = {}
): Serializer<AddMemberNftInstructionDataArgs, AddMemberNftInstructionData> {
  return mapSerializer<
    AddMemberNftInstructionDataArgs,
    any,
    AddMemberNftInstructionData
  >(
    struct<AddMemberNftInstructionData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['shares', u64()],
      ],
      { description: 'AddMemberNftInstructionData' }
    ),
    (value) => ({ ...value, discriminator: [92, 255, 105, 209, 25, 41, 3, 7] })
  ) as Serializer<AddMemberNftInstructionDataArgs, AddMemberNftInstructionData>;
}

// Args.
export type AddMemberNftInstructionArgs = AddMemberNftInstructionDataArgs;

// Instruction.
export function addMemberNft(
  context: Pick<Context, 'programs' | 'identity'>,
  input: AddMemberNftInstructionAccounts & AddMemberNftInstructionArgs
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
    fanout: [input.fanout, true] as const,
    membershipAccount: [input.membershipAccount, true] as const,
    mint: [input.mint, false] as const,
    metadata: [input.metadata, false] as const,
  };
  const resolvingArgs = {};
  addObjectProperty(
    resolvedAccounts,
    'authority',
    input.authority
      ? ([input.authority, true] as const)
      : ([context.identity, true] as const)
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

  addAccountMeta(keys, signers, resolvedAccounts.authority, false);
  addAccountMeta(keys, signers, resolvedAccounts.fanout, false);
  addAccountMeta(keys, signers, resolvedAccounts.membershipAccount, false);
  addAccountMeta(keys, signers, resolvedAccounts.mint, false);
  addAccountMeta(keys, signers, resolvedAccounts.metadata, false);
  addAccountMeta(keys, signers, resolvedAccounts.systemProgram, false);
  addAccountMeta(keys, signers, resolvedAccounts.rent, false);
  addAccountMeta(keys, signers, resolvedAccounts.tokenProgram, false);

  // Data.
  const data =
    getAddMemberNftInstructionDataSerializer().serialize(resolvedArgs);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
