import { createMint } from '@metaplex-foundation/mpl-essentials';
import {
  base58PublicKey,
  generateSigner,
  transactionBuilder,
} from '@metaplex-foundation/umi-test';
import test from 'ava';
import {
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
  const name = 'my-fanout-account';
  const fanout = findFanoutPda(umi, { name });
  const nativeAccount = findFanoutNativeAccountPda(umi, { fanout });
  const membershipMint = generateSigner(umi);

  console.log({
    identity: base58PublicKey(umi.identity),
    fanout: base58PublicKey(fanout),
    nativeAccount: base58PublicKey(nativeAccount),
    membershipMint: base58PublicKey(membershipMint),
  });

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
  console.log(fanoutAccount);
  t.pass();
});
