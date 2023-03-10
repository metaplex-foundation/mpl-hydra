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
  WrappedInstruction,
  checkForIsWritableOverride as isWritable,
  mapSerializer,
  publicKey,
} from '@metaplex-foundation/umi';

// Accounts.
export type DistributeNftInstructionAccounts = {
  payer?: Signer;
  member: PublicKey;
  membershipMintTokenAccount: PublicKey;
  membershipKey: PublicKey;
  membershipVoucher: PublicKey;
  fanout: PublicKey;
  holdingAccount: PublicKey;
  fanoutForMint: PublicKey;
  fanoutForMintMembershipVoucher: PublicKey;
  fanoutMint: PublicKey;
  fanoutMintMemberTokenAccount: PublicKey;
  systemProgram?: PublicKey;
  rent?: PublicKey;
  tokenProgram?: PublicKey;
};

// Arguments.
export type DistributeNftInstructionData = {
  discriminator: Array<number>;
  distributeForMint: boolean;
};

export type DistributeNftInstructionDataArgs = { distributeForMint: boolean };

export function getDistributeNftInstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<DistributeNftInstructionDataArgs, DistributeNftInstructionData> {
  const s = context.serializer;
  return mapSerializer<
    DistributeNftInstructionDataArgs,
    DistributeNftInstructionData,
    DistributeNftInstructionData
  >(
    s.struct<DistributeNftInstructionData>(
      [
        ['discriminator', s.array(s.u8(), { size: 8 })],
        ['distributeForMint', s.bool()],
      ],
      { description: 'DistributeNftInstructionArgs' }
    ),
    (value) =>
      ({
        ...value,
        discriminator: [108, 240, 68, 81, 144, 83, 58, 153],
      } as DistributeNftInstructionData)
  ) as Serializer<
    DistributeNftInstructionDataArgs,
    DistributeNftInstructionData
  >;
}

// Instruction.
export function distributeNft(
  context: Pick<Context, 'serializer' | 'programs' | 'payer'>,
  input: DistributeNftInstructionAccounts & DistributeNftInstructionDataArgs
): WrappedInstruction {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId = context.programs.getPublicKey(
    'mplHydra',
    'hyDQ4Nz1eYyegS6JfenyKwKzYxRsCWCriYSAjtzP4Vg'
  );

  // Resolved accounts.
  const payerAccount = input.payer ?? context.payer;
  const memberAccount = input.member;
  const membershipMintTokenAccountAccount = input.membershipMintTokenAccount;
  const membershipKeyAccount = input.membershipKey;
  const membershipVoucherAccount = input.membershipVoucher;
  const fanoutAccount = input.fanout;
  const holdingAccountAccount = input.holdingAccount;
  const fanoutForMintAccount = input.fanoutForMint;
  const fanoutForMintMembershipVoucherAccount =
    input.fanoutForMintMembershipVoucher;
  const fanoutMintAccount = input.fanoutMint;
  const fanoutMintMemberTokenAccountAccount =
    input.fanoutMintMemberTokenAccount;
  const systemProgramAccount = input.systemProgram ?? {
    ...context.programs.getPublicKey(
      'splSystem',
      '11111111111111111111111111111111'
    ),
    isWritable: false,
  };
  const rentAccount =
    input.rent ?? publicKey('SysvarRent111111111111111111111111111111111');
  const tokenProgramAccount = input.tokenProgram ?? {
    ...context.programs.getPublicKey(
      'splToken',
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
    ),
    isWritable: false,
  };

  // Payer.
  signers.push(payerAccount);
  keys.push({
    pubkey: payerAccount.publicKey,
    isSigner: true,
    isWritable: isWritable(payerAccount, false),
  });

  // Member.
  keys.push({
    pubkey: memberAccount,
    isSigner: false,
    isWritable: isWritable(memberAccount, true),
  });

  // Membership Mint Token Account.
  keys.push({
    pubkey: membershipMintTokenAccountAccount,
    isSigner: false,
    isWritable: isWritable(membershipMintTokenAccountAccount, true),
  });

  // Membership Key.
  keys.push({
    pubkey: membershipKeyAccount,
    isSigner: false,
    isWritable: isWritable(membershipKeyAccount, false),
  });

  // Membership Voucher.
  keys.push({
    pubkey: membershipVoucherAccount,
    isSigner: false,
    isWritable: isWritable(membershipVoucherAccount, true),
  });

  // Fanout.
  keys.push({
    pubkey: fanoutAccount,
    isSigner: false,
    isWritable: isWritable(fanoutAccount, true),
  });

  // Holding Account.
  keys.push({
    pubkey: holdingAccountAccount,
    isSigner: false,
    isWritable: isWritable(holdingAccountAccount, true),
  });

  // Fanout For Mint.
  keys.push({
    pubkey: fanoutForMintAccount,
    isSigner: false,
    isWritable: isWritable(fanoutForMintAccount, true),
  });

  // Fanout For Mint Membership Voucher.
  keys.push({
    pubkey: fanoutForMintMembershipVoucherAccount,
    isSigner: false,
    isWritable: isWritable(fanoutForMintMembershipVoucherAccount, true),
  });

  // Fanout Mint.
  keys.push({
    pubkey: fanoutMintAccount,
    isSigner: false,
    isWritable: isWritable(fanoutMintAccount, false),
  });

  // Fanout Mint Member Token Account.
  keys.push({
    pubkey: fanoutMintMemberTokenAccountAccount,
    isSigner: false,
    isWritable: isWritable(fanoutMintMemberTokenAccountAccount, true),
  });

  // System Program.
  keys.push({
    pubkey: systemProgramAccount,
    isSigner: false,
    isWritable: isWritable(systemProgramAccount, false),
  });

  // Rent.
  keys.push({
    pubkey: rentAccount,
    isSigner: false,
    isWritable: isWritable(rentAccount, false),
  });

  // Token Program.
  keys.push({
    pubkey: tokenProgramAccount,
    isSigner: false,
    isWritable: isWritable(tokenProgramAccount, false),
  });

  // Data.
  const data =
    getDistributeNftInstructionDataSerializer(context).serialize(input);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return {
    instruction: { keys, programId, data },
    signers,
    bytesCreatedOnChain,
  };
}
