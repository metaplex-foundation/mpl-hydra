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

export type FanoutMembershipVoucher =
  Account<FanoutMembershipVoucherAccountData>;

export type FanoutMembershipVoucherAccountData = {
  discriminator: Array<number>;
  fanout: PublicKey;
  totalInflow: bigint;
  lastInflow: bigint;
  bumpSeed: number;
  membershipKey: PublicKey;
  shares: bigint;
};

export type FanoutMembershipVoucherAccountDataArgs = {
  fanout: PublicKey;
  totalInflow: number | bigint;
  lastInflow: number | bigint;
  bumpSeed: number;
  membershipKey: PublicKey;
  shares: number | bigint;
};

export function getFanoutMembershipVoucherAccountDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<
  FanoutMembershipVoucherAccountDataArgs,
  FanoutMembershipVoucherAccountData
> {
  const s = context.serializer;
  return mapSerializer<
    FanoutMembershipVoucherAccountDataArgs,
    FanoutMembershipVoucherAccountData,
    FanoutMembershipVoucherAccountData
  >(
    s.struct<FanoutMembershipVoucherAccountData>(
      [
        ['discriminator', s.array(s.u8(), { size: 8 })],
        ['fanout', s.publicKey()],
        ['totalInflow', s.u64()],
        ['lastInflow', s.u64()],
        ['bumpSeed', s.u8()],
        ['membershipKey', s.publicKey()],
        ['shares', s.u64()],
      ],
      { description: 'FanoutMembershipVoucherAccountData' }
    ),
    (value) =>
      ({
        ...value,
        discriminator: [16, 229, 84, 210, 96, 22, 126, 120],
      } as FanoutMembershipVoucherAccountData)
  ) as Serializer<
    FanoutMembershipVoucherAccountDataArgs,
    FanoutMembershipVoucherAccountData
  >;
}

export function deserializeFanoutMembershipVoucher(
  context: Pick<Context, 'serializer'>,
  rawAccount: RpcAccount
): FanoutMembershipVoucher {
  return deserializeAccount(
    rawAccount,
    getFanoutMembershipVoucherAccountDataSerializer(context)
  );
}

export async function fetchFanoutMembershipVoucher(
  context: Pick<Context, 'rpc' | 'serializer'>,
  publicKey: PublicKey,
  options?: RpcGetAccountOptions
): Promise<FanoutMembershipVoucher> {
  const maybeAccount = await context.rpc.getAccount(publicKey, options);
  assertAccountExists(maybeAccount, 'FanoutMembershipVoucher');
  return deserializeFanoutMembershipVoucher(context, maybeAccount);
}

export async function safeFetchFanoutMembershipVoucher(
  context: Pick<Context, 'rpc' | 'serializer'>,
  publicKey: PublicKey,
  options?: RpcGetAccountOptions
): Promise<FanoutMembershipVoucher | null> {
  const maybeAccount = await context.rpc.getAccount(publicKey, options);
  return maybeAccount.exists
    ? deserializeFanoutMembershipVoucher(context, maybeAccount)
    : null;
}

export async function fetchAllFanoutMembershipVoucher(
  context: Pick<Context, 'rpc' | 'serializer'>,
  publicKeys: PublicKey[],
  options?: RpcGetAccountsOptions
): Promise<FanoutMembershipVoucher[]> {
  const maybeAccounts = await context.rpc.getAccounts(publicKeys, options);
  return maybeAccounts.map((maybeAccount) => {
    assertAccountExists(maybeAccount, 'FanoutMembershipVoucher');
    return deserializeFanoutMembershipVoucher(context, maybeAccount);
  });
}

export async function safeFetchAllFanoutMembershipVoucher(
  context: Pick<Context, 'rpc' | 'serializer'>,
  publicKeys: PublicKey[],
  options?: RpcGetAccountsOptions
): Promise<FanoutMembershipVoucher[]> {
  const maybeAccounts = await context.rpc.getAccounts(publicKeys, options);
  return maybeAccounts
    .filter((maybeAccount) => maybeAccount.exists)
    .map((maybeAccount) =>
      deserializeFanoutMembershipVoucher(context, maybeAccount as RpcAccount)
    );
}

export function getFanoutMembershipVoucherGpaBuilder(
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
      fanout: PublicKey;
      totalInflow: number | bigint;
      lastInflow: number | bigint;
      bumpSeed: number;
      membershipKey: PublicKey;
      shares: number | bigint;
    }>({
      discriminator: [0, s.array(s.u8(), { size: 8 })],
      fanout: [8, s.publicKey()],
      totalInflow: [40, s.u64()],
      lastInflow: [48, s.u64()],
      bumpSeed: [56, s.u8()],
      membershipKey: [57, s.publicKey()],
      shares: [89, s.u64()],
    })
    .deserializeUsing<FanoutMembershipVoucher>((account) =>
      deserializeFanoutMembershipVoucher(context, account)
    )
    .whereField('discriminator', [16, 229, 84, 210, 96, 22, 126, 120]);
}

export function getFanoutMembershipVoucherSize(): number {
  return 153;
}

export function findFanoutMembershipVoucherPda(
  context: Pick<Context, 'eddsa' | 'programs' | 'serializer'>,
  seeds: {
    /** The address of the fanout account */
    fanout: PublicKey;
    /** The member's public key */
    member: PublicKey;
  }
): Pda {
  const s = context.serializer;
  const programId = context.programs.getPublicKey(
    'mplHydra',
    'hyDQ4Nz1eYyegS6JfenyKwKzYxRsCWCriYSAjtzP4Vg'
  );
  return context.eddsa.findPda(programId, [
    s.string({ size: 'variable' }).serialize('fanout-membership'),
    s.publicKey().serialize(seeds.fanout),
    s.publicKey().serialize(seeds.member),
  ]);
}
