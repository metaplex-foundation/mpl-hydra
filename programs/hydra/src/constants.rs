use anchor_lang::prelude::*;

/// Denominator for basis-point fee rates (10_000 bps = 100%).
pub const BPS_DENOMINATOR: u64 = 10_000;

/// Protocol fee taken from every new inflow before it is shared among members (0.5%).
pub const PROTOCOL_FEE_BPS: u64 = 50;

/// Wallet that receives collected protocol fees (the Metaplex DAO wallet). Native fees are sent
/// here directly; token fees are sent to a token account owned by this wallet.
pub const PROTOCOL_FEE_TREASURY: Pubkey = pubkey!("BHkk3RTd4Ue6JnqXpa9QHTXbn575ycR8hxVmYx4E254k");

/// Signer required to collect protocol fees. Same fee authority as Token Metadata.
pub const PROTOCOL_FEE_AUTHORITY: Pubkey = pubkey!("Levytx9LLPzAtDJJD7q813Zsm8zg9e1pb53mGxTKpD7");
