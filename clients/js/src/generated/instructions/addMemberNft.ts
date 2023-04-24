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
  publicKey,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import { addObjectProperty, isWritable } from '../shared';

// Accounts.
export type AddMemberNftInstructionAccounts = {
  authority?: Signer;
  fanout: PublicKey;
  membershipAccount: PublicKey;
  mint: PublicKey;
  metadata: PublicKey;
  systemProgram?: PublicKey;
  rent?: PublicKey;
  tokenProgram?: PublicKey;
};

// Data.
export type AddMemberNftInstructionData = {
  discriminator: Array<number>;
  shares: bigint;
};

export type AddMemberNftInstructionDataArgs = { shares: number | bigint };

export function getAddMemberNftInstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<AddMemberNftInstructionDataArgs, AddMemberNftInstructionData> {
  const s = context.serializer;
  return mapSerializer<
    AddMemberNftInstructionDataArgs,
    AddMemberNftInstructionData,
    AddMemberNftInstructionData
  >(
    s.struct<AddMemberNftInstructionData>(
      [
        ['discriminator', s.array(s.u8(), { size: 8 })],
        ['shares', s.u64()],
      ],
      { description: 'AddMemberNftInstructionData' }
    ),
    (value) =>
      ({
        ...value,
        discriminator: [92, 255, 105, 209, 25, 41, 3, 7],
      } as AddMemberNftInstructionData)
  ) as Serializer<AddMemberNftInstructionDataArgs, AddMemberNftInstructionData>;
}

// Args.
export type AddMemberNftInstructionArgs = AddMemberNftInstructionDataArgs;

// Instruction.
export function addMemberNft(
  context: Pick<Context, 'serializer' | 'programs' | 'identity'>,
  input: AddMemberNftInstructionAccounts & AddMemberNftInstructionArgs
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
    'authority',
    input.authority ?? context.identity
  );
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
    'rent',
    input.rent ?? publicKey('SysvarRent111111111111111111111111111111111')
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

  // Authority.
  signers.push(resolvedAccounts.authority);
  keys.push({
    pubkey: resolvedAccounts.authority.publicKey,
    isSigner: true,
    isWritable: isWritable(resolvedAccounts.authority, true),
  });

  // Fanout.
  keys.push({
    pubkey: resolvedAccounts.fanout,
    isSigner: false,
    isWritable: isWritable(resolvedAccounts.fanout, true),
  });

  // Membership Account.
  keys.push({
    pubkey: resolvedAccounts.membershipAccount,
    isSigner: false,
    isWritable: isWritable(resolvedAccounts.membershipAccount, true),
  });

  // Mint.
  keys.push({
    pubkey: resolvedAccounts.mint,
    isSigner: false,
    isWritable: isWritable(resolvedAccounts.mint, false),
  });

  // Metadata.
  keys.push({
    pubkey: resolvedAccounts.metadata,
    isSigner: false,
    isWritable: isWritable(resolvedAccounts.metadata, false),
  });

  // System Program.
  keys.push({
    pubkey: resolvedAccounts.systemProgram,
    isSigner: false,
    isWritable: isWritable(resolvedAccounts.systemProgram, false),
  });

  // Rent.
  keys.push({
    pubkey: resolvedAccounts.rent,
    isSigner: false,
    isWritable: isWritable(resolvedAccounts.rent, false),
  });

  // Token Program.
  keys.push({
    pubkey: resolvedAccounts.tokenProgram,
    isSigner: false,
    isWritable: isWritable(resolvedAccounts.tokenProgram, false),
  });

  // Data.
  const data =
    getAddMemberNftInstructionDataSerializer(context).serialize(resolvedArgs);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
