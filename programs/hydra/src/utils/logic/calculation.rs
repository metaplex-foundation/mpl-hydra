use crate::{
    constants::{BPS_DENOMINATOR, PROTOCOL_FEE_BPS},
    error::{HydraError, OrArithError},
    state::{Fanout, FanoutMembershipMintVoucher, FanoutMembershipVoucher, FanoutMint},
};
use anchor_lang::prelude::*;

pub fn calculate_inflow_change(total_inflow: u64, last_inflow: u64) -> Result<u64> {
    let diff: u64 = total_inflow.checked_sub(last_inflow).or_arith_error()?;
    Ok(diff)
}

/// Splits a new inflow into the part shared among members and the protocol fee.
/// Returns `(net, fee)`.
pub fn split_protocol_fee(inflow: u64) -> Result<(u64, u64)> {
    let fee = (inflow as u128)
        .checked_mul(PROTOCOL_FEE_BPS as u128)
        .or_arith_error()?
        .checked_div(BPS_DENOMINATOR as u128)
        .or_arith_error()? as u64;
    let net = inflow.checked_sub(fee).or_arith_error()?;
    Ok((net, fee))
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
    // The fee stays in the holding account but is never added to the inflow members share.
    let (diff, fee) = split_protocol_fee(diff)?;
    fanout_for_mint.accrued_fees = fanout_for_mint
        .accrued_fees
        .checked_add(fee)
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
    // The fee stays in the holding account but is never added to the inflow members share.
    let (diff, fee) = split_protocol_fee(diff)?;
    fanout.accrued_fees = fanout.accrued_fees.checked_add(fee).or_arith_error()?;
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

        update_inflow(&mut fanout, 1_000).unwrap();

        // diff 1000, fee 5, net 995, shares_diff 5, correction 995 * 5 / 5 = 995
        assert_eq!(fanout.total_inflow, 2_990);
        assert_eq!(fanout.accrued_fees, 5);
        assert_eq!(fanout.last_snapshot_amount, 1_000);
    }

    #[test]
    fn test_split_protocol_fee() {
        assert_eq!(PROTOCOL_FEE_BPS, 50, "expectations below assume a 0.5% fee");
        assert_eq!(split_protocol_fee(0).unwrap(), (0, 0));
        assert_eq!(split_protocol_fee(199).unwrap(), (199, 0));
        assert_eq!(split_protocol_fee(1_000).unwrap(), (995, 5));
        assert_eq!(split_protocol_fee(1_050).unwrap(), (1_045, 5));
        let (net, fee) = split_protocol_fee(u64::MAX).unwrap();
        assert_eq!(net + fee, u64::MAX);
    }

    #[test]
    fn test_update_inflow_takes_fee_once_per_inflow() {
        let mut fanout = fanout(0);
        fanout.total_staked_shares = None;

        update_inflow(&mut fanout, 1_000).unwrap();
        assert_eq!(fanout.total_inflow, 995);
        assert_eq!(fanout.accrued_fees, 5);
        assert_eq!(fanout.last_snapshot_amount, 1_000);

        // Same balance again: no new inflow, so no new fee.
        update_inflow(&mut fanout, 1_000).unwrap();
        assert_eq!(fanout.total_inflow, 995);
        assert_eq!(fanout.accrued_fees, 5);

        // Only the new 500 is charged.
        update_inflow(&mut fanout, 1_500).unwrap();
        assert_eq!(fanout.total_inflow, 1_493);
        assert_eq!(fanout.accrued_fees, 7);
    }

    #[test]
    fn test_full_distribution_leaves_exactly_the_fees_in_the_snapshot() {
        let key = Pubkey::new_unique();
        let owner = crate::ID;
        let lamports = &mut 1_000_000u64;
        let mut f = fanout(0);
        f.total_shares = 100;
        f.total_staked_shares = None;
        let mut data = fanout_account_data(&f);
        let info = AccountInfo::new(&key, false, true, lamports, &mut data, &owner, false, 0);
        let mut account: Account<Fanout> = Account::try_from(&info).unwrap();

        update_inflow(&mut account, 10_000).unwrap();
        // Members with 60 and 40 shares claim everything they are owed.
        for shares in [60u64, 40] {
            let dist = calculate_dist_amount(shares, account.total_inflow, 100).unwrap();
            account.last_snapshot_amount -= dist;
        }

        assert_eq!(account.accrued_fees, 50);
        assert_eq!(account.last_snapshot_amount, account.accrued_fees);
    }

    #[test]
    fn test_update_inflow_for_mint_accrues_fee() {
        let key = Pubkey::new_unique();
        let owner = crate::ID;
        let lamports = &mut 1_000_000u64;
        let mut f = fanout(0);
        f.total_staked_shares = None;
        let mut data = fanout_account_data(&f);
        let info = AccountInfo::new(&key, false, true, lamports, &mut data, &owner, false, 0);
        let mut account: Account<Fanout> = Account::try_from(&info).unwrap();
        let mut fanout_for_mint = FanoutMint {
            total_inflow: 50,
            last_snapshot_amount: 50,
            accrued_fees: 3,
            ..FanoutMint::default()
        };

        update_inflow_for_mint(&mut account, &mut fanout_for_mint, 2_050).unwrap();

        assert_eq!(fanout_for_mint.total_inflow, 50 + 1_990);
        assert_eq!(fanout_for_mint.accrued_fees, 3 + 10);
        assert_eq!(fanout_for_mint.last_snapshot_amount, 2_050);
    }

    #[test]
    fn test_pre_upgrade_accounts_deserialize_with_zero_fees() {
        // Serialize with the new layout, then cut the trailing field off to mimic an account
        // written before `accrued_fees` existed, padded with zeros to its allocated size.
        let mut f = fanout(0);
        f.total_inflow = 42;
        let mut data = fanout_account_data(&f);
        data.truncate(data.len() - 8);
        data.resize(300, 0);
        let decoded = Fanout::try_deserialize(&mut data.as_slice()).unwrap();
        assert_eq!(decoded.total_inflow, 42);
        assert_eq!(decoded.accrued_fees, 0);

        let fm = FanoutMint {
            total_inflow: 7,
            ..FanoutMint::default()
        };
        let mut data = Vec::new();
        fm.try_serialize(&mut data).unwrap();
        data.truncate(data.len() - 8);
        data.resize(200, 0);
        let decoded = FanoutMint::try_deserialize(&mut data.as_slice()).unwrap();
        assert_eq!(decoded.total_inflow, 7);
        assert_eq!(decoded.accrued_fees, 0);
    }

    #[test]
    fn test_max_size_fanout_fits_allocation() {
        // A fanout's name is a PDA seed, so it is at most 32 bytes.
        let f = Fanout {
            name: "x".repeat(32),
            membership_mint: Some(Pubkey::new_unique()),
            total_staked_shares: Some(u64::MAX),
            accrued_fees: u64::MAX,
            ..Fanout::default()
        };
        assert!(fanout_account_data(&f).len() <= crate::state::FANOUT_ACCOUNT_SIZE);
        let mut data = Vec::new();
        FanoutMint::default().try_serialize(&mut data).unwrap();
        assert!(data.len() <= 200);
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
