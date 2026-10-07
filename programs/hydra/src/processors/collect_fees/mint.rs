use crate::{
    constants::{PROTOCOL_FEE_AUTHORITY, PROTOCOL_FEE_TREASURY},
    error::{HydraError, OrArithError},
    state::{Fanout, FanoutMint},
    utils::logic::transfer::transfer_from_mint_holding,
};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

#[derive(Accounts)]
pub struct CollectMintFees<'info> {
    #[account(
    mut,
    address = PROTOCOL_FEE_AUTHORITY @ HydraError::InvalidFeeAuthority,
    )]
    pub authority: Signer<'info>,
    #[account(
    seeds = [b"fanout-config", fanout.name.as_bytes()],
    bump = fanout.bump_seed,
    )]
    pub fanout: Account<'info, Fanout>,
    #[account(
    mut,
    has_one = fanout @ HydraError::InvalidFanoutForMint,
    seeds = [b"fanout-config", fanout.key().as_ref(), fanout_for_mint.mint.as_ref()],
    bump = fanout_for_mint.bump_seed,
    )]
    pub fanout_for_mint: Account<'info, FanoutMint>,
    #[account(
    mut,
    address = fanout_for_mint.token_account @ HydraError::InvalidHoldingAccount,
    )]
    pub holding_account: Account<'info, TokenAccount>,
    #[account(
    address = fanout_for_mint.mint @ HydraError::MintDoesNotMatch,
    )]
    pub mint: Account<'info, Mint>,
    #[account(
    address = PROTOCOL_FEE_TREASURY @ HydraError::InvalidFeeTreasury,
    )]
    /// CHECK: Protocol fee treasury
    pub treasury: UncheckedAccount<'info>,
    /// The treasury's associated token account for the mint, created if it doesn't exist yet.
    #[account(
    init_if_needed,
    payer = authority,
    associated_token::mint = mint,
    associated_token::authority = treasury,
    associated_token::token_program = token_program,
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

/// Sends the token protocol fees accrued by a fanout mint to the protocol treasury's associated
/// token account, creating it if needed. Only the protocol fee authority can call it.
pub fn collect_mint_fees(ctx: Context<CollectMintFees>) -> Result<()> {
    let fanout_for_mint = &mut ctx.accounts.fanout_for_mint;
    let fees = fanout_for_mint.accrued_fees;
    if fees == 0 {
        return Ok(());
    }
    if fees > ctx.accounts.holding_account.amount {
        return Err(HydraError::InsufficientBalanceToCollectFees.into());
    }

    // The fees were counted in the snapshot when they arrived, so take them back out of it now
    // that they leave the holding account. Otherwise the next distribution would see a deficit.
    fanout_for_mint.last_snapshot_amount = fanout_for_mint
        .last_snapshot_amount
        .checked_sub(fees)
        .or_arith_error()?;
    fanout_for_mint.accrued_fees = 0;

    let fanout = &ctx.accounts.fanout;
    transfer_from_mint_holding(
        fanout,
        fanout.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.holding_account.to_account_info(),
        ctx.accounts.treasury_token_account.to_account_info(),
        fees,
    )
}
