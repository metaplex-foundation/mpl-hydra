import {
  generateRandomString,
  generateSigner,
  publicKey,
} from '@metaplex-foundation/umi';
import test from 'ava';
import {
  addMemberWallet,
  FanoutMembershipVoucher,
  fetchFanout,
  fetchFanoutMembershipVoucher,
  findFanoutMembershipVoucherPda,
  findFanoutPda,
  init,
  MembershipModel,
} from '../src';
import { createUmi } from './_setup';

test('it can add a wallet member to a fanout account', async (t) => {
  // Given a freshly initialised fanout account.
  const umi = await createUmi();
  const name = generateRandomString();
  await init(umi, {
    name,
    model: MembershipModel.Wallet,
    totalShares: 100,
  }).sendAndConfirm(umi);
  const [fanout] = findFanoutPda(umi, { name });

  // When we add a wallet member to it, letting the client derive the
  // membership account from the `fanoutMembershipVoucher` PDA defaults.
  const member = generateSigner(umi).publicKey;
  await addMemberWallet(umi, {
    member,
    fanout,
    shares: 25,
  }).sendAndConfirm(umi);

  // Then the membership voucher was created at the expected PDA.
  const [membershipAccount, membershipBump] = findFanoutMembershipVoucherPda(
    umi,
    { fanout, member }
  );
  const voucher = await fetchFanoutMembershipVoucher(umi, membershipAccount);
  t.like(voucher, <FanoutMembershipVoucher>{
    publicKey: publicKey(membershipAccount),
    fanout: publicKey(fanout),
    membershipKey: publicKey(member),
    shares: 25n,
    totalInflow: 0n,
    lastInflow: 0n,
    bumpSeed: membershipBump,
  });

  // And the fanout account was updated accordingly.
  const fanoutAccount = await fetchFanout(umi, fanout);
  t.is(fanoutAccount.totalMembers, 1n);
  t.is(fanoutAccount.totalAvailableShares, 75n);
});
