/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Account,
  Context,
  Pda,
  PublicKey,
  RpcAccount,
  RpcGetAccountOptions,
  RpcGetAccountsOptions,
  Serializer,
  assertAccountExists,
  deserializeAccount,
  gpaBuilder,
  mapSerializer,
} from '@metaplex-foundation/umi';

export type FanoutMint = Account<FanoutMintAccountData>;

export type FanoutMintAccountData = {
  discriminator: Array<number>;
  mint: PublicKey;
  fanout: PublicKey;
  tokenAccount: PublicKey;
  totalInflow: bigint;
  lastSnapshotAmount: bigint;
  bumpSeed: number;
};

export type FanoutMintAccountDataArgs = {
  mint: PublicKey;
  fanout: PublicKey;
  tokenAccount: PublicKey;
  totalInflow: number | bigint;
  lastSnapshotAmount: number | bigint;
  bumpSeed: number;
};

export function getFanoutMintAccountDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<FanoutMintAccountDataArgs, FanoutMintAccountData> {
  const s = context.serializer;
  return mapSerializer<
    FanoutMintAccountDataArgs,
    FanoutMintAccountData,
    FanoutMintAccountData
  >(
    s.struct<FanoutMintAccountData>(
      [
        ['discriminator', s.array(s.u8(), { size: 8 })],
        ['mint', s.publicKey()],
        ['fanout', s.publicKey()],
        ['tokenAccount', s.publicKey()],
        ['totalInflow', s.u64()],
        ['lastSnapshotAmount', s.u64()],
        ['bumpSeed', s.u8()],
      ],
      { description: 'FanoutMintAccountData' }
    ),
    (value) =>
      ({
        ...value,
        discriminator: [117, 125, 188, 123, 180, 213, 133, 164],
      } as FanoutMintAccountData)
  ) as Serializer<FanoutMintAccountDataArgs, FanoutMintAccountData>;
}

export function deserializeFanoutMint(
  context: Pick<Context, 'serializer'>,
  rawAccount: RpcAccount
): FanoutMint {
  return deserializeAccount(
    rawAccount,
    getFanoutMintAccountDataSerializer(context)
  );
}

export async function fetchFanoutMint(
  context: Pick<Context, 'rpc' | 'serializer'>,
  publicKey: PublicKey,
  options?: RpcGetAccountOptions
): Promise<FanoutMint> {
  const maybeAccount = await context.rpc.getAccount(publicKey, options);
  assertAccountExists(maybeAccount, 'FanoutMint');
  return deserializeFanoutMint(context, maybeAccount);
}

export async function safeFetchFanoutMint(
  context: Pick<Context, 'rpc' | 'serializer'>,
  publicKey: PublicKey,
  options?: RpcGetAccountOptions
): Promise<FanoutMint | null> {
  const maybeAccount = await context.rpc.getAccount(publicKey, options);
  return maybeAccount.exists
    ? deserializeFanoutMint(context, maybeAccount)
    : null;
}

export async function fetchAllFanoutMint(
  context: Pick<Context, 'rpc' | 'serializer'>,
  publicKeys: PublicKey[],
  options?: RpcGetAccountsOptions
): Promise<FanoutMint[]> {
  const maybeAccounts = await context.rpc.getAccounts(publicKeys, options);
  return maybeAccounts.map((maybeAccount) => {
    assertAccountExists(maybeAccount, 'FanoutMint');
    return deserializeFanoutMint(context, maybeAccount);
  });
}

export async function safeFetchAllFanoutMint(
  context: Pick<Context, 'rpc' | 'serializer'>,
  publicKeys: PublicKey[],
  options?: RpcGetAccountsOptions
): Promise<FanoutMint[]> {
  const maybeAccounts = await context.rpc.getAccounts(publicKeys, options);
  return maybeAccounts
    .filter((maybeAccount) => maybeAccount.exists)
    .map((maybeAccount) =>
      deserializeFanoutMint(context, maybeAccount as RpcAccount)
    );
}

export function getFanoutMintGpaBuilder(
  context: Pick<Context, 'rpc' | 'serializer' | 'programs'>
) {
  const s = context.serializer;
  const programId = context.programs.getPublicKey(
    'mplHydra',
    'hyDQ4Nz1eYyegS6JfenyKwKzYxRsCWCriYSAjtzP4Vg'
  );
  return gpaBuilder(context, programId)
    .registerFields<{
      discriminator: Array<number>;
      mint: PublicKey;
      fanout: PublicKey;
      tokenAccount: PublicKey;
      totalInflow: number | bigint;
      lastSnapshotAmount: number | bigint;
      bumpSeed: number;
    }>({
      discriminator: [0, s.array(s.u8(), { size: 8 })],
      mint: [8, s.publicKey()],
      fanout: [40, s.publicKey()],
      tokenAccount: [72, s.publicKey()],
      totalInflow: [104, s.u64()],
      lastSnapshotAmount: [112, s.u64()],
      bumpSeed: [120, s.u8()],
    })
    .deserializeUsing<FanoutMint>((account) =>
      deserializeFanoutMint(context, account)
    )
    .whereField('discriminator', [117, 125, 188, 123, 180, 213, 133, 164]);
}

export function getFanoutMintSize(): number {
  return 200;
}

export function findFanoutMintPda(
  context: Pick<Context, 'eddsa' | 'programs' | 'serializer'>,
  seeds: {
    /** The address of the fanout account */
    fanout: PublicKey;
    /** The address of the mint account */
    mint: PublicKey;
  }
): Pda {
  const s = context.serializer;
  const programId = context.programs.getPublicKey(
    'mplHydra',
    'hyDQ4Nz1eYyegS6JfenyKwKzYxRsCWCriYSAjtzP4Vg'
  );
  return context.eddsa.findPda(programId, [
    s.string({ size: 'variable' }).serialize('fanout-config'),
    s.publicKey().serialize(seeds.fanout),
    s.publicKey().serialize(seeds.mint),
  ]);
}
