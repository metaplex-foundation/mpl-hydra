use crate::{
    error::{HydraError, OrArithError},
    state::{Fanout, FanoutMembershipMintVoucher, FanoutMembershipVoucher, FanoutMint},
};
use anchor_lang::prelude::*;

pub fn calculate_inflow_change(total_inflow: u64, last_inflow: u64) -> Result<u64> {
    let diff: u64 = total_inflow.checked_sub(last_inflow).or_arith_error()?;
    Ok(diff)
}

pub fn calculate_dist_amount(
    member_shares: u64,
    inflow_diff: u64,
    total_shares: u64,
) -> Result<u64> {
    let member_shares = member_shares as u128;
    let total_shares = total_shares as u128;
    let inflow_diff = inflow_diff as u128;
    let dist_amount = member_shares
        .checked_mul(inflow_diff)
        .or_arith_error()?
        .checked_div(total_shares)
        .or_arith_error()?;
    Ok(dist_amount as u64)
}

pub fn update_fanout_for_add(fanout: &mut Account<Fanout>, shares: u64) -> Result<()> {
    let less_shares = fanout
        .total_available_shares
        .checked_sub(shares)
        .ok_or(HydraError::InsufficientShares)?;
    fanout.total_members = fanout.total_members.checked_add(1).or_arith_error()?;
    fanout.total_available_shares = less_shares;
    Ok(())
}

pub fn update_fanout_for_remove(fanout: &mut Account<Fanout>) -> Result<()> {
    fanout.total_members = fanout.total_members.checked_sub(1).or_arith_error()?;
    Ok(())
}

pub fn update_inflow_for_mint(
    fanout: &mut Account<Fanout>,
    fanout_for_mint: &mut FanoutMint,
    current_snapshot: u64,
) -> Result<()> {
    let diff = current_snapshot
        .checked_sub(fanout_for_mint.last_snapshot_amount)
        .or_arith_error()?;
    fanout_for_mint.total_inflow = fanout_for_mint
        .total_inflow
        .checked_add(diff)
        .or_arith_error()?;
    if fanout.total_staked_shares.is_some() && fanout.total_staked_shares.unwrap() > 0 {
        let tss = fanout.total_staked_shares.unwrap();
        let shares_diff = (fanout.total_shares as u64)
            .checked_sub(tss)
            .or_arith_error()?;
        let unstaked_correction = (diff as u128)
            .checked_mul(shares_diff as u128)
            .or_arith_error()?
            .checked_div(tss as u128)
            .or_arith_error()? as u64;
        fanout_for_mint.total_inflow = fanout_for_mint
            .total_inflow
            .checked_add(unstaked_correction)
            .or_arith_error()?;
    }
    fanout_for_mint.last_snapshot_amount = current_snapshot;
    Ok(())
}

pub fn update_inflow(fanout: &mut Fanout, current_snapshot: u64) -> Result<()> {
    let diff = current_snapshot
        .checked_sub(fanout.last_snapshot_amount)
        .or_arith_error()?;
    fanout.total_inflow = fanout.total_inflow.checked_add(diff).or_arith_error()?;
    if fanout.total_staked_shares.is_some() && fanout.total_staked_shares.unwrap() > 0 {
        let tss = fanout.total_staked_shares.unwrap();
        let shares_diff = (fanout.total_shares as u64)
            .checked_sub(tss)
            .or_arith_error()?;
        let unstaked_correction = (diff as u128)
            .checked_mul(shares_diff as u128)
            .or_arith_error()?
            .checked_div(tss as u128)
            .or_arith_error()? as u64;
        fanout.total_inflow = fanout
            .total_inflow
            .checked_add(unstaked_correction)
            .or_arith_error()?;
    }
    fanout.last_snapshot_amount = current_snapshot;
    Ok(())
}

pub fn update_snapshot(
    fanout: &mut Account<Fanout>,
    fanout_voucher: &mut Account<FanoutMembershipVoucher>,
    distribution_amount: u64,
) -> Result<()> {
    fanout_voucher.last_inflow = fanout.total_inflow;
    fanout.last_snapshot_amount = fanout
        .last_snapshot_amount
        .checked_sub(distribution_amount)
        .or_arith_error()?;
    Ok(())
}

pub fn update_snapshot_for_mint(
    fanout_mint: &mut FanoutMint,
    fanout_mint_voucher: &mut FanoutMembershipMintVoucher,
    distribution_amount: u64,
) -> Result<()> {
    fanout_mint_voucher.last_inflow = fanout_mint.total_inflow;
    fanout_mint.last_snapshot_amount = fanout_mint
        .last_snapshot_amount
        .checked_sub(distribution_amount)
        .or_arith_error()?;
    Ok(())
}

pub fn current_lamports(
    rent: &Sysvar<Rent>,
    size: usize,
    holding_account_lamports: u64,
) -> Result<u64> {
    let subtract_size = rent.minimum_balance(size).max(1);
    holding_account_lamports
        .checked_sub(subtract_size)
        .ok_or_else(|| HydraError::NumericalOverflow.into())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::MembershipModel;

    fn anchor_error_code(err: &error::Error) -> Option<u32> {
        match err {
            error::Error::AnchorError(e) => Some(e.error_code_number),
            _ => None,
        }
    }

    fn fanout(total_available_shares: u64) -> Fanout {
        Fanout {
            name: "test".to_string(),
            total_shares: 100,
            total_available_shares,
            membership_model: MembershipModel::Token,
            ..Fanout::default()
        }
    }

    /// `update_fanout_for_add` takes an `Account<Fanout>`, so stage a real account buffer.
    fn fanout_account_data(fanout: &Fanout) -> Vec<u8> {
        let mut data = Vec::new();
        fanout.try_serialize(&mut data).unwrap();
        data
    }

    #[test]
    fn test_update_fanout_for_add_over_allocation_is_insufficient_shares() {
        let key = Pubkey::new_unique();
        let owner = crate::ID;
        let lamports = &mut 1_000_000u64;
        let mut data = fanout_account_data(&fanout(10));
        let info = AccountInfo::new(&key, false, true, lamports, &mut data, &owner, false, 0);
        let mut account: Account<Fanout> = Account::try_from(&info).unwrap();

        let err = update_fanout_for_add(&mut account, 11).unwrap_err();

        assert_eq!(
            anchor_error_code(&err),
            Some(u32::from(HydraError::InsufficientShares))
        );
        // The instruction aborts, so nothing about the member count changed.
        assert_eq!(account.total_members, 0);
        assert_eq!(account.total_available_shares, 10);
    }

    #[test]
    fn test_update_fanout_for_add_happy_path() {
        let key = Pubkey::new_unique();
        let owner = crate::ID;
        let lamports = &mut 1_000_000u64;
        let mut data = fanout_account_data(&fanout(10));
        let info = AccountInfo::new(&key, false, true, lamports, &mut data, &owner, false, 0);
        let mut account: Account<Fanout> = Account::try_from(&info).unwrap();

        update_fanout_for_add(&mut account, 4).unwrap();

        assert_eq!(account.total_available_shares, 6);
        assert_eq!(account.total_members, 1);
    }

    #[test]
    fn test_update_inflow_applies_unstaked_correction() {
        let mut fanout = fanout(0);
        fanout.total_shares = 10;
        fanout.total_staked_shares = Some(5);
        fanout.total_inflow = 1000;

        update_inflow(&mut fanout, 100).unwrap();

        // diff 100, shares_diff 5, correction 100 * 5 / 5 = 100
        assert_eq!(fanout.total_inflow, 1200);
        assert_eq!(fanout.last_snapshot_amount, 100);
    }

    #[test]
    fn test_update_inflow_unstaked_correction_overflow_is_an_error() {
        let mut fanout = fanout(0);
        fanout.total_shares = 3;
        fanout.total_staked_shares = Some(1);
        fanout.total_inflow = u64::MAX - 100;

        let err = update_inflow(&mut fanout, 100).unwrap_err();

        assert_eq!(
            anchor_error_code(&err),
            Some(u32::from(HydraError::BadArtithmetic))
        );
    }

    #[test]
    fn test_update_inflow_for_mint_unstaked_correction_overflow_is_an_error() {
        let key = Pubkey::new_unique();
        let owner = crate::ID;
        let lamports = &mut 1_000_000u64;
        let mut fanout = fanout(0);
        fanout.total_shares = 3;
        fanout.total_staked_shares = Some(1);
        let mut data = fanout_account_data(&fanout);
        let info = AccountInfo::new(&key, false, true, lamports, &mut data, &owner, false, 0);
        let mut account: Account<Fanout> = Account::try_from(&info).unwrap();
        let mut fanout_for_mint = FanoutMint {
            total_inflow: u64::MAX - 100,
            ..FanoutMint::default()
        };

        let err = update_inflow_for_mint(&mut account, &mut fanout_for_mint, 100).unwrap_err();

        assert_eq!(
            anchor_error_code(&err),
            Some(u32::from(HydraError::BadArtithmetic))
        );
    }
}
