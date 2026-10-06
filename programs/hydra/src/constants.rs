use anchor_lang::prelude::*;

/// Denominator for basis-point fee rates (10_000 bps = 100%).
pub const BPS_DENOMINATOR: u64 = 10_000;

/// Protocol fee taken from every new inflow before it is shared among members.
// TODO: placeholder rate (1%), set the real protocol fee before deploying.
pub const PROTOCOL_FEE_BPS: u64 = 100;

/// Wallet that receives collected protocol fees. Native fees are sent here directly; token fees
/// are sent to a token account owned by this wallet.
// TODO: placeholder address with no known private key, replace with the real treasury before
// deploying.
pub const PROTOCOL_FEE_TREASURY: Pubkey = pubkey!("HydraFeeTreasury111111111111111111111111111");
