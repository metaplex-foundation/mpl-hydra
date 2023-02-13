/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Program, ProgramError } from '@metaplex-foundation/umi-core';

type ProgramErrorConstructor = new (
  program: Program,
  cause?: Error
) => ProgramError;
const codeToErrorMap: Map<number, ProgramErrorConstructor> = new Map();
const nameToErrorMap: Map<string, ProgramErrorConstructor> = new Map();

/** BadArtithmetic: 'Encountered an arithmetic error' */
export class BadArtithmeticError extends ProgramError {
  readonly name: string = 'BadArtithmetic';

  readonly code: number = 0x1770; // 6000

  constructor(program: Program, cause?: Error) {
    super('Encountered an arithmetic error', program, cause);
  }
}
codeToErrorMap.set(0x1770, BadArtithmeticError);
nameToErrorMap.set('BadArtithmetic', BadArtithmeticError);

/** InvalidAuthority: 'Invalid authority' */
export class InvalidAuthorityError extends ProgramError {
  readonly name: string = 'InvalidAuthority';

  readonly code: number = 0x1771; // 6001

  constructor(program: Program, cause?: Error) {
    super('Invalid authority', program, cause);
  }
}
codeToErrorMap.set(0x1771, InvalidAuthorityError);
nameToErrorMap.set('InvalidAuthority', InvalidAuthorityError);

/** InsufficientShares: 'Not Enough Available Shares' */
export class InsufficientSharesError extends ProgramError {
  readonly name: string = 'InsufficientShares';

  readonly code: number = 0x1772; // 6002

  constructor(program: Program, cause?: Error) {
    super('Not Enough Available Shares', program, cause);
  }
}
codeToErrorMap.set(0x1772, InsufficientSharesError);
nameToErrorMap.set('InsufficientShares', InsufficientSharesError);

/** SharesArentAtMax: 'All available shares must be assigned to a member' */
export class SharesArentAtMaxError extends ProgramError {
  readonly name: string = 'SharesArentAtMax';

  readonly code: number = 0x1773; // 6003

  constructor(program: Program, cause?: Error) {
    super('All available shares must be assigned to a member', program, cause);
  }
}
codeToErrorMap.set(0x1773, SharesArentAtMaxError);
nameToErrorMap.set('SharesArentAtMax', SharesArentAtMaxError);

/** NewMintAccountRequired: 'A New mint account must be provided' */
export class NewMintAccountRequiredError extends ProgramError {
  readonly name: string = 'NewMintAccountRequired';

  readonly code: number = 0x1774; // 6004

  constructor(program: Program, cause?: Error) {
    super('A New mint account must be provided', program, cause);
  }
}
codeToErrorMap.set(0x1774, NewMintAccountRequiredError);
nameToErrorMap.set('NewMintAccountRequired', NewMintAccountRequiredError);

/** MintAccountRequired: 'A Token type Fanout requires a Membership Mint' */
export class MintAccountRequiredError extends ProgramError {
  readonly name: string = 'MintAccountRequired';

  readonly code: number = 0x1775; // 6005

  constructor(program: Program, cause?: Error) {
    super('A Token type Fanout requires a Membership Mint', program, cause);
  }
}
codeToErrorMap.set(0x1775, MintAccountRequiredError);
nameToErrorMap.set('MintAccountRequired', MintAccountRequiredError);

/** InvalidMembershipModel: 'Invalid Membership Model' */
export class InvalidMembershipModelError extends ProgramError {
  readonly name: string = 'InvalidMembershipModel';

  readonly code: number = 0x1776; // 6006

  constructor(program: Program, cause?: Error) {
    super('Invalid Membership Model', program, cause);
  }
}
codeToErrorMap.set(0x1776, InvalidMembershipModelError);
nameToErrorMap.set('InvalidMembershipModel', InvalidMembershipModelError);

/** InvalidMembershipVoucher: 'Invalid Membership Voucher' */
export class InvalidMembershipVoucherError extends ProgramError {
  readonly name: string = 'InvalidMembershipVoucher';

  readonly code: number = 0x1777; // 6007

  constructor(program: Program, cause?: Error) {
    super('Invalid Membership Voucher', program, cause);
  }
}
codeToErrorMap.set(0x1777, InvalidMembershipVoucherError);
nameToErrorMap.set('InvalidMembershipVoucher', InvalidMembershipVoucherError);

/** MintDoesNotMatch: 'Invalid Mint for the config' */
export class MintDoesNotMatchError extends ProgramError {
  readonly name: string = 'MintDoesNotMatch';

  readonly code: number = 0x1778; // 6008

  constructor(program: Program, cause?: Error) {
    super('Invalid Mint for the config', program, cause);
  }
}
codeToErrorMap.set(0x1778, MintDoesNotMatchError);
nameToErrorMap.set('MintDoesNotMatch', MintDoesNotMatchError);

/** InvalidHoldingAccount: 'Holding account does not match the config' */
export class InvalidHoldingAccountError extends ProgramError {
  readonly name: string = 'InvalidHoldingAccount';

  readonly code: number = 0x1779; // 6009

  constructor(program: Program, cause?: Error) {
    super('Holding account does not match the config', program, cause);
  }
}
codeToErrorMap.set(0x1779, InvalidHoldingAccountError);
nameToErrorMap.set('InvalidHoldingAccount', InvalidHoldingAccountError);

/** HoldingAccountMustBeAnATA: 'A Mint holding account must be an ata for the mint owned by the config' */
export class HoldingAccountMustBeAnATAError extends ProgramError {
  readonly name: string = 'HoldingAccountMustBeAnATA';

  readonly code: number = 0x177a; // 6010

  constructor(program: Program, cause?: Error) {
    super(
      'A Mint holding account must be an ata for the mint owned by the config',
      program,
      cause
    );
  }
}
codeToErrorMap.set(0x177a, HoldingAccountMustBeAnATAError);
nameToErrorMap.set('HoldingAccountMustBeAnATA', HoldingAccountMustBeAnATAError);

/** DerivedKeyInvalid: '' */
export class DerivedKeyInvalidError extends ProgramError {
  readonly name: string = 'DerivedKeyInvalid';

  readonly code: number = 0x177b; // 6011

  constructor(program: Program, cause?: Error) {
    super('', program, cause);
  }
}
codeToErrorMap.set(0x177b, DerivedKeyInvalidError);
nameToErrorMap.set('DerivedKeyInvalid', DerivedKeyInvalidError);

/** IncorrectOwner: '' */
export class IncorrectOwnerError extends ProgramError {
  readonly name: string = 'IncorrectOwner';

  readonly code: number = 0x177c; // 6012

  constructor(program: Program, cause?: Error) {
    super('', program, cause);
  }
}
codeToErrorMap.set(0x177c, IncorrectOwnerError);
nameToErrorMap.set('IncorrectOwner', IncorrectOwnerError);

/** WalletDoesNotOwnMembershipToken: 'Wallet Does not Own Membership Token' */
export class WalletDoesNotOwnMembershipTokenError extends ProgramError {
  readonly name: string = 'WalletDoesNotOwnMembershipToken';

  readonly code: number = 0x177d; // 6013

  constructor(program: Program, cause?: Error) {
    super('Wallet Does not Own Membership Token', program, cause);
  }
}
codeToErrorMap.set(0x177d, WalletDoesNotOwnMembershipTokenError);
nameToErrorMap.set(
  'WalletDoesNotOwnMembershipToken',
  WalletDoesNotOwnMembershipTokenError
);

/** InvalidMetadata: 'The Metadata specified is not valid Token Metadata' */
export class InvalidMetadataError extends ProgramError {
  readonly name: string = 'InvalidMetadata';

  readonly code: number = 0x177e; // 6014

  constructor(program: Program, cause?: Error) {
    super('The Metadata specified is not valid Token Metadata', program, cause);
  }
}
codeToErrorMap.set(0x177e, InvalidMetadataError);
nameToErrorMap.set('InvalidMetadata', InvalidMetadataError);

/** NumericalOverflow: '' */
export class NumericalOverflowError extends ProgramError {
  readonly name: string = 'NumericalOverflow';

  readonly code: number = 0x177f; // 6015

  constructor(program: Program, cause?: Error) {
    super('', program, cause);
  }
}
codeToErrorMap.set(0x177f, NumericalOverflowError);
nameToErrorMap.set('NumericalOverflow', NumericalOverflowError);

/** InsufficientBalanceToDistribute: 'Not enough new balance to distribute' */
export class InsufficientBalanceToDistributeError extends ProgramError {
  readonly name: string = 'InsufficientBalanceToDistribute';

  readonly code: number = 0x1780; // 6016

  constructor(program: Program, cause?: Error) {
    super('Not enough new balance to distribute', program, cause);
  }
}
codeToErrorMap.set(0x1780, InsufficientBalanceToDistributeError);
nameToErrorMap.set(
  'InsufficientBalanceToDistribute',
  InsufficientBalanceToDistributeError
);

/** InvalidFanoutForMint: '' */
export class InvalidFanoutForMintError extends ProgramError {
  readonly name: string = 'InvalidFanoutForMint';

  readonly code: number = 0x1781; // 6017

  constructor(program: Program, cause?: Error) {
    super('', program, cause);
  }
}
codeToErrorMap.set(0x1781, InvalidFanoutForMintError);
nameToErrorMap.set('InvalidFanoutForMint', InvalidFanoutForMintError);

/** MustDistribute: 'This operation must be the instruction right after a distrobution on the same accounts.' */
export class MustDistributeError extends ProgramError {
  readonly name: string = 'MustDistribute';

  readonly code: number = 0x1782; // 6018

  constructor(program: Program, cause?: Error) {
    super(
      'This operation must be the instruction right after a distrobution on the same accounts.',
      program,
      cause
    );
  }
}
codeToErrorMap.set(0x1782, MustDistributeError);
nameToErrorMap.set('MustDistribute', MustDistributeError);

/** InvalidStakeAta: '' */
export class InvalidStakeAtaError extends ProgramError {
  readonly name: string = 'InvalidStakeAta';

  readonly code: number = 0x1783; // 6019

  constructor(program: Program, cause?: Error) {
    super('', program, cause);
  }
}
codeToErrorMap.set(0x1783, InvalidStakeAtaError);
nameToErrorMap.set('InvalidStakeAta', InvalidStakeAtaError);

/** CannotTransferToSelf: '' */
export class CannotTransferToSelfError extends ProgramError {
  readonly name: string = 'CannotTransferToSelf';

  readonly code: number = 0x1784; // 6020

  constructor(program: Program, cause?: Error) {
    super('', program, cause);
  }
}
codeToErrorMap.set(0x1784, CannotTransferToSelfError);
nameToErrorMap.set('CannotTransferToSelf', CannotTransferToSelfError);

/** TransferNotSupported: 'Transfer is not supported on this membership model' */
export class TransferNotSupportedError extends ProgramError {
  readonly name: string = 'TransferNotSupported';

  readonly code: number = 0x1785; // 6021

  constructor(program: Program, cause?: Error) {
    super('Transfer is not supported on this membership model', program, cause);
  }
}
codeToErrorMap.set(0x1785, TransferNotSupportedError);
nameToErrorMap.set('TransferNotSupported', TransferNotSupportedError);

/** RemoveNotSupported: 'Remove is not supported on this membership model' */
export class RemoveNotSupportedError extends ProgramError {
  readonly name: string = 'RemoveNotSupported';

  readonly code: number = 0x1786; // 6022

  constructor(program: Program, cause?: Error) {
    super('Remove is not supported on this membership model', program, cause);
  }
}
codeToErrorMap.set(0x1786, RemoveNotSupportedError);
nameToErrorMap.set('RemoveNotSupported', RemoveNotSupportedError);

/** RemoveSharesMustBeZero: 'Before you remove a wallet or NFT member please transfer the shares to another member' */
export class RemoveSharesMustBeZeroError extends ProgramError {
  readonly name: string = 'RemoveSharesMustBeZero';

  readonly code: number = 0x1787; // 6023

  constructor(program: Program, cause?: Error) {
    super(
      'Before you remove a wallet or NFT member please transfer the shares to another member',
      program,
      cause
    );
  }
}
codeToErrorMap.set(0x1787, RemoveSharesMustBeZeroError);
nameToErrorMap.set('RemoveSharesMustBeZero', RemoveSharesMustBeZeroError);

/** InvalidCloseAccountDestination: 'Sending Sol to a SPL token destination will render the sol unusable' */
export class InvalidCloseAccountDestinationError extends ProgramError {
  readonly name: string = 'InvalidCloseAccountDestination';

  readonly code: number = 0x1788; // 6024

  constructor(program: Program, cause?: Error) {
    super(
      'Sending Sol to a SPL token destination will render the sol unusable',
      program,
      cause
    );
  }
}
codeToErrorMap.set(0x1788, InvalidCloseAccountDestinationError);
nameToErrorMap.set(
  'InvalidCloseAccountDestination',
  InvalidCloseAccountDestinationError
);

/**
 * Attempts to resolve a custom program error from the provided error code.
 * @category Errors
 */
export function getMplHydraErrorFromCode(
  code: number,
  program: Program,
  cause?: Error
): ProgramError | null {
  const constructor = codeToErrorMap.get(code);
  return constructor ? new constructor(program, cause) : null;
}

/**
 * Attempts to resolve a custom program error from the provided error name, i.e. 'Unauthorized'.
 * @category Errors
 */
export function getMplHydraErrorFromName(
  name: string,
  program: Program,
  cause?: Error
): ProgramError | null {
  const constructor = nameToErrorMap.get(name);
  return constructor ? new constructor(program, cause) : null;
}