import {
  createAccount,
  createAssociatedToken,
  fetchToken,
  getMintSize,
  initializeMint2,
  findAssociatedTokenPda,
  mintTokensTo,
  transferSol,
} from '@metaplex-foundation/mpl-toolbox';
import {
  generateRandomString,
  generateSigner,
  publicKey,
  PublicKey,
  sol,
  Umi,
} from '@metaplex-foundation/umi';
import test from 'ava';
import {
  addMemberWallet,
  collectFees,
  collectMintFees,
  distributeWallet,
  fetchFanout,
  fetchFanoutMint,
  findFanoutMembershipMintVoucherPda,
  findFanoutMembershipVoucherPda,
  findFanoutMintPda,
  findFanoutNativeAccountPda,
  findFanoutPda,
  init,
  initForMint,
  MembershipModel,
} from '../src';
import { createUmi } from './_setup';

// Must match `PROTOCOL_FEE_TREASURY` and `PROTOCOL_FEE_BPS` in the program.
const TREASURY = publicKey('HydraFeeTreasury111111111111111111111111111');
const FEE_BPS = 100n;
const NATIVE_MINT = publicKey('So11111111111111111111111111111111111111112');

const fee = (amount: bigint) => (amount * FEE_BPS) / 10_000n;

async function createWalletFanout(umi: Umi, shares: number[]) {
  const name = generateRandomString();
  const totalShares = shares.reduce((a, b) => a + b, 0);
  await init(umi, {
    name,
    model: MembershipModel.Wallet,
    totalShares,
  }).sendAndConfirm(umi);
  const [fanout] = findFanoutPda(umi, { name });
  const members: PublicKey[] = [];
  for (const s of shares) {
    const member = generateSigner(umi).publicKey;
    // eslint-disable-next-line no-await-in-loop
    await addMemberWallet(umi, { member, fanout, shares: s }).sendAndConfirm(
      umi
    );
    members.push(member);
  }
  return { fanout, members };
}

function distributeNative(umi: Umi, fanout: PublicKey, member: PublicKey) {
  // The mint accounts are required by the instruction but unused when
  // `distributeForMint` is false.
  const unused = generateSigner(umi).publicKey;
  return distributeWallet(umi, {
    member,
    membershipVoucher: findFanoutMembershipVoucherPda(umi, { fanout, member }),
    fanout,
    holdingAccount: findFanoutNativeAccountPda(umi, { fanout }),
    fanoutForMint: unused,
    fanoutForMintMembershipVoucher: unused,
    fanoutMint: NATIVE_MINT,
    fanoutMintMemberTokenAccount: unused,
    distributeForMint: false,
  });
}

test('native distributions take the protocol fee and collectFees sends it to the treasury', async (t) => {
  // Given a wallet fanout with two members holding 60 and 40 shares.
  const umi = await createUmi();
  const { fanout, members } = await createWalletFanout(umi, [60, 40]);
  const [holdingAccount] = findFanoutNativeAccountPda(umi, { fanout });
  const holdingRent = (await umi.rpc.getBalance(holdingAccount)).basisPoints;
  // Make sure the treasury exists so any fee amount can be credited to it.
  await umi.rpc.airdrop(TREASURY, sol(1));

  // When 10 SOL is deposited and every member claims their share.
  const deposit = sol(10).basisPoints;
  await transferSol(umi, {
    destination: holdingAccount,
    amount: sol(10),
  }).sendAndConfirm(umi);
  for (const member of members) {
    // eslint-disable-next-line no-await-in-loop
    await distributeNative(umi, fanout, member).sendAndConfirm(umi);
  }

  // Then members received their share of the deposit minus the fee.
  const net = deposit - fee(deposit);
  const balances = await Promise.all(members.map((m) => umi.rpc.getBalance(m)));
  t.is(balances[0].basisPoints, (net * 60n) / 100n);
  t.is(balances[1].basisPoints, (net * 40n) / 100n);

  // And the fee is left in the holding account and tracked on the fanout.
  let fanoutAccount = await fetchFanout(umi, fanout);
  t.is(fanoutAccount.accruedFees, fee(deposit));
  t.is(fanoutAccount.lastSnapshotAmount, fee(deposit));

  // When anyone collects the fees.
  const treasuryBefore = (await umi.rpc.getBalance(TREASURY)).basisPoints;
  await collectFees(umi, { fanout }).sendAndConfirm(umi);

  // Then the treasury received them and the holding account is back to its
  // rent-exempt minimum.
  const treasuryAfter = (await umi.rpc.getBalance(TREASURY)).basisPoints;
  t.is(treasuryAfter - treasuryBefore, fee(deposit));
  t.is((await umi.rpc.getBalance(holdingAccount)).basisPoints, holdingRent);
  fanoutAccount = await fetchFanout(umi, fanout);
  t.is(fanoutAccount.accruedFees, 0n);
  t.is(fanoutAccount.lastSnapshotAmount, 0n);

  // And a later deposit is still distributed correctly.
  await transferSol(umi, {
    destination: holdingAccount,
    amount: sol(1),
  }).sendAndConfirm(umi);
  await distributeNative(umi, fanout, members[0]).sendAndConfirm(umi);
  const second = sol(1).basisPoints;
  t.is(
    (await umi.rpc.getBalance(members[0])).basisPoints,
    balances[0].basisPoints + ((second - fee(second)) * 60n) / 100n
  );
  t.is((await fetchFanout(umi, fanout)).accruedFees, fee(second));
});

test('collectFees rejects any destination other than the treasury', async (t) => {
  const umi = await createUmi();
  const { fanout } = await createWalletFanout(umi, [100]);

  const promise = collectFees(umi, {
    fanout,
    treasury: generateSigner(umi).publicKey,
  }).sendAndConfirm(umi);

  await t.throwsAsync(promise, { message: /InvalidFeeTreasury/ });
});

test('token distributions take the protocol fee and collectMintFees sends it to the treasury', async (t) => {
  // Given a wallet fanout with two members and an SPL mint registered on it.
  const umi = await createUmi();
  const { fanout, members } = await createWalletFanout(umi, [70, 30]);
  const mint = generateSigner(umi);
  const mintSpace = getMintSize();
  await createAccount(umi, {
    newAccount: mint,
    lamports: await umi.rpc.getRent(mintSpace),
    space: mintSpace,
    programId: umi.programs.getPublicKey('splToken'),
  })
    .add(
      initializeMint2(umi, {
        mint: mint.publicKey,
        decimals: 0,
        mintAuthority: umi.identity.publicKey,
        freezeAuthority: null,
      })
    )
    .sendAndConfirm(umi);
  const [holdingAta] = findAssociatedTokenPda(umi, {
    mint: mint.publicKey,
    owner: fanout,
  });
  await createAssociatedToken(umi, {
    mint: mint.publicKey,
    owner: fanout,
  }).sendAndConfirm(umi);
  const [fanoutForMint, fanoutForMintBump] = findFanoutMintPda(umi, {
    fanout,
    mint: mint.publicKey,
  });
  await initForMint(umi, {
    fanout,
    fanoutForMint,
    mintHoldingAccount: holdingAta,
    mint: mint.publicKey,
    bumpSeed: fanoutForMintBump,
  }).sendAndConfirm(umi);

  const memberAtas = members.map(
    (member) =>
      findAssociatedTokenPda(umi, { mint: mint.publicKey, owner: member })[0]
  );
  const distributeMint = (index: number) =>
    distributeWallet(umi, {
      member: members[index],
      membershipVoucher: findFanoutMembershipVoucherPda(umi, {
        fanout,
        member: members[index],
      }),
      fanout,
      holdingAccount: holdingAta,
      fanoutForMint,
      fanoutForMintMembershipVoucher: findFanoutMembershipMintVoucherPda(umi, {
        fanout: fanoutForMint,
        membership: members[index],
        mint: mint.publicKey,
      }),
      fanoutMint: mint.publicKey,
      fanoutMintMemberTokenAccount: memberAtas[index],
      distributeForMint: true,
    });

  // A member's mint voucher starts from the inflow at the time it is created,
  // so create both before any tokens arrive.
  for (let i = 0; i < members.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await createAssociatedToken(umi, {
      mint: mint.publicKey,
      owner: members[i],
    })
      .add(distributeMint(i))
      .sendAndConfirm(umi);
  }

  // When 1,000,000 tokens are deposited and every member claims their share.
  const deposit = 1_000_000n;
  await mintTokensTo(umi, {
    mint: mint.publicKey,
    token: holdingAta,
    amount: deposit,
  }).sendAndConfirm(umi);
  for (let i = 0; i < members.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await distributeMint(i).sendAndConfirm(umi);
  }

  // Then members received their share of the deposit minus the fee.
  const net = deposit - fee(deposit);
  t.is((await fetchToken(umi, memberAtas[0])).amount, (net * 70n) / 100n);
  t.is((await fetchToken(umi, memberAtas[1])).amount, (net * 30n) / 100n);
  t.is((await fetchFanoutMint(umi, fanoutForMint)).accruedFees, fee(deposit));

  // When anyone collects the fees into the treasury's token account.
  const [treasuryAta] = findAssociatedTokenPda(umi, {
    mint: mint.publicKey,
    owner: TREASURY,
  });
  await createAssociatedToken(umi, {
    mint: mint.publicKey,
    owner: TREASURY,
  })
    .add(
      collectMintFees(umi, {
        fanout,
        fanoutForMint,
        holdingAccount: holdingAta,
        treasuryTokenAccount: treasuryAta,
      })
    )
    .sendAndConfirm(umi);

  // Then the treasury holds the fees and the holding account is empty.
  t.is((await fetchToken(umi, treasuryAta)).amount, fee(deposit));
  t.is((await fetchToken(umi, holdingAta)).amount, 0n);
  const fanoutMint = await fetchFanoutMint(umi, fanoutForMint);
  t.is(fanoutMint.accruedFees, 0n);
  t.is(fanoutMint.lastSnapshotAmount, 0n);
});
