import { createMint } from '@metaplex-foundation/mpl-essentials';
import {
  generateRandomString,
  generateSigner,
  none,
  publicKey,
  transactionBuilder,
} from '@metaplex-foundation/umi-test';
import test from 'ava';
import {
  Fanout,
  fetchFanout,
  findFanoutNativeAccountPda,
  findFanoutPda,
  init,
  MembershipModel,
} from '../src';
import { createUmi } from './_setup';

test('it can create a fanout account', async (t) => {
  // Given a bunch of accounts.
  const umi = await createUmi();
  const name = generateRandomString();
  const fanout = findFanoutPda(umi, { name });
  const nativeAccount = findFanoutNativeAccountPda(umi, { fanout });
  const membershipMint = generateSigner(umi);

  // When we create a new fanout account from them.
  await transactionBuilder(umi)
    .add(createMint(umi, { mint: membershipMint }))
    .add(
      init(umi, {
        fanout,
        holdingAccount: nativeAccount,
        membershipMint: membershipMint.publicKey,
        name,
        bumpSeed: fanout.bump,
        nativeAccountBumpSeed: nativeAccount.bump,
        model: MembershipModel.Wallet,
        totalShares: 100,
      })
    )
    .sendAndConfirm();

  // Then a new fanout account was created with the right data.
  const fanoutAccount = await fetchFanout(umi, fanout);
  t.like(fanoutAccount, <Fanout>{
    publicKey: publicKey(fanout),
    authority: publicKey(umi.identity),
    name,
    accountKey: publicKey(nativeAccount),
    totalShares: 100n,
    totalMembers: 0n,
    totalInflow: 0n,
    lastSnapshotAmount: 0n,
    bumpSeed: fanout.bump,
    totalAvailableShares: 100n,
    membershipModel: MembershipModel.Wallet,
    membershipMint: none(),
    totalStakedShares: none(),
  });
});
