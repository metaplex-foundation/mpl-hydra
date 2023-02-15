import { WrappedInstruction } from '@metaplex-foundation/umi-core';
import { findFanoutNativeAccountPda } from '../hooked';
import { findFanoutPda } from '../generated';
import {
  getInitInstructionDataSerializer,
  init as baseInit,
  InitInstructionAccounts,
  InitInstructionData,
  InitInstructionArgs,
} from '../generated/instructions/init';

export {
  InitInstructionAccounts,
  InitInstructionData,
  InitInstructionArgs,
  getInitInstructionDataSerializer,
};

// Inputs.
export type InitInstructionInput = Omit<
  Parameters<typeof baseInit>[1],
  'bumpSeed' | 'nativeAccountBumpSeed'
> & {
  bumpSeed?: number;
  nativeAccountBumpSeed?: number;
};

export const init = (
  context: Parameters<typeof baseInit>[0],
  input: InitInstructionInput
): WrappedInstruction => {
  const defaultFanout = findFanoutPda(context, { name: input.name });
  const defaultHoldingAccount = findFanoutNativeAccountPda(context, {
    fanout: input.fanout ?? defaultFanout,
  });

  return baseInit(context, {
    ...input,
    fanout: input.fanout ?? defaultFanout,
    holdingAccount: input.holdingAccount ?? defaultHoldingAccount,
    bumpSeed: input.bumpSeed ?? defaultFanout.bump,
    nativeAccountBumpSeed:
      input.nativeAccountBumpSeed ?? defaultHoldingAccount.bump,
  });
};
