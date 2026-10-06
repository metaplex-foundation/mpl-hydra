use crate::{
    constants::PROTOCOL_FEE_TREASURY,
    error::{HydraError, OrArithError},
    state::{Fanout, HOLDING_ACCOUNT_SIZE},
    utils::logic::transfer::transfer_native,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CollectFees<'info> {
    #[account(
    mut,
    seeds = [b"fanout-config", fanout.name.as_bytes()],
    bump = fanout.bump_seed,
    )]
    pub fanout: Account<'info, Fanout>,
    #[account(
    mut,
    address = fanout.account_key @ HydraError::InvalidHoldingAccount,
    owner = crate::ID @ HydraError::IncorrectOwner,
    )]
    /// CHECK: Native holding account of the fanout
    pub holding_account: UncheckedAccount<'info>,
    #[account(
    mut,
    address = PROTOCOL_FEE_TREASURY @ HydraError::InvalidFeeTreasury,
    )]
    /// CHECK: Protocol fee treasury
    pub treasury: UncheckedAccount<'info>,
}

/// Sends the native protocol fees accrued by a fanout to the protocol treasury. Permissionless,
/// since the fees can only ever go to the treasury.
pub fn collect_fees(ctx: Context<CollectFees>) -> Result<()> {
    let fanout = &mut ctx.accounts.fanout;
    let fees = fanout.accrued_fees;
    if fees == 0 {
        return Ok(());
    }

    let holding_account = ctx.accounts.holding_account.to_account_info();
    let holding_lamports = holding_account.lamports();
    let rent_minimum = Rent::get()?.minimum_balance(HOLDING_ACCOUNT_SIZE).max(1);
    let available = holding_lamports.saturating_sub(rent_minimum);
    if fees > available {
        return Err(HydraError::InsufficientBalanceToCollectFees.into());
    }

    // The fees were counted in the snapshot when they arrived, so take them back out of it now
    // that they leave the holding account. Otherwise the next distribution would see a deficit.
    fanout.last_snapshot_amount = fanout
        .last_snapshot_amount
        .checked_sub(fees)
        .or_arith_error()?;
    fanout.accrued_fees = 0;

    transfer_native(
        holding_account,
        ctx.accounts.treasury.to_account_info(),
        holding_lamports,
        fees,
    )
}
