use crate::{
    error::HydraError,
    state::{Fanout, MembershipModel},
};
use anchor_lang::{
    prelude::*,
    solana_program::{instruction::Instruction, program_memory::sol_memcmp, pubkey::PUBKEY_BYTES},
};
use anchor_spl::token::TokenAccount;
use mpl_token_metadata::{accounts::Metadata, types::Key as MetadataKey};

pub fn cmp_pubkeys(a: &Pubkey, b: &Pubkey) -> bool {
    sol_memcmp(a.as_ref(), b.as_ref(), PUBKEY_BYTES) == 0
}

pub fn assert_derivation(
    program_id: &Pubkey,
    account: &AccountInfo,
    path: &[&[u8]],
    error: Option<error::Error>,
) -> Result<u8> {
    let (key, bump) = Pubkey::find_program_address(path, program_id);
    if !cmp_pubkeys(&key, account.key) {
        if let Some(err) = error {
            msg!("Derivation {:?}", err);
            return Err(err);
        }
        msg!("DerivedKeyInvalid");
        return Err(HydraError::DerivedKeyInvalid.into());
    }
    Ok(bump)
}

pub fn assert_owned_by(account: &AccountInfo, owner: &Pubkey) -> Result<()> {
    if !cmp_pubkeys(account.owner, owner) {
        Err(HydraError::IncorrectOwner.into())
    } else {
        Ok(())
    }
}

pub fn assert_membership_model(fanout: &Account<Fanout>, model: MembershipModel) -> Result<()> {
    if fanout.membership_model != model {
        return Err(HydraError::InvalidMembershipModel.into());
    }
    Ok(())
}

pub fn assert_ata(
    account: &AccountInfo,
    target: &Pubkey,
    mint: &Pubkey,
    err: Option<error::Error>,
) -> Result<u8> {
    assert_derivation(
        &anchor_spl::associated_token::ID,
        &account.to_account_info(),
        &[
            target.as_ref(),
            anchor_spl::token::ID.as_ref(),
            mint.as_ref(),
        ],
        err,
    )
}

pub fn assert_shares_distributed(fanout: &Account<Fanout>) -> Result<()> {
    if fanout.total_available_shares != 0 {
        return Err(HydraError::SharesArentAtMax.into());
    }
    Ok(())
}

pub fn assert_holding(
    owner: &AccountInfo,
    token_account: &Account<TokenAccount>,
    mint_info: &AccountInfo,
) -> Result<()> {
    assert_owned_by(mint_info, &spl_token::id())?;
    let token_account_info = token_account.to_account_info();
    assert_owned_by(&token_account_info, &spl_token::id())?;
    if !cmp_pubkeys(&token_account.owner, owner.key) {
        return Err(HydraError::IncorrectOwner.into());
    }
    if token_account.amount < 1 {
        return Err(HydraError::WalletDoesNotOwnMembershipToken.into());
    }
    if !cmp_pubkeys(&token_account.mint, &mint_info.key()) {
        return Err(HydraError::MintDoesNotMatch.into());
    }
    Ok(())
}

pub fn assert_distributed(
    ix: Instruction,
    subject: &Pubkey,
    fanout: &Pubkey,
    membership_voucher: &Pubkey,
    membership_model: MembershipModel,
) -> Result<()> {
    if !cmp_pubkeys(&ix.program_id, &crate::id()) {
        return Err(HydraError::MustDistribute.into());
    }
    // Anchor discriminator plus the positions of `member`, `membership_voucher` and
    // `fanout` in each distribute instruction's account list. The indices come from the
    // `#[derive(Accounts)]` field order in `processors/distribute/*.rs`, as reflected in
    // `idls/hydra.json`:
    //   process_distribute_wallet / process_distribute_token:
    //     0 payer, 1 member, 2 membership_voucher, 3 fanout, ...
    //   process_distribute_nft:
    //     0 payer, 1 member, 2 membership_mint_token_account, 3 membership_key,
    //     4 membership_voucher, 5 fanout, ...
    let (instruction_id, member_index, voucher_index, fanout_index) = match membership_model {
        MembershipModel::Wallet => ([252, 168, 167, 66, 40, 201, 182, 163], 1, 2, 3),
        MembershipModel::NFT => ([108, 240, 68, 81, 144, 83, 58, 153], 1, 4, 5),
        MembershipModel::Token => ([126, 105, 46, 135, 28, 36, 117, 212], 1, 2, 3),
    };
    // The preceding instruction is attacker controlled: it only has to target this
    // program id to reach the comparisons below, so bounds-check before indexing.
    if ix.data.len() < 8 || ix.accounts.len() <= fanout_index {
        return Err(HydraError::MustDistribute.into());
    }
    if sol_memcmp(instruction_id.as_ref(), ix.data[0..8].as_ref(), 8) != 0 {
        return Err(HydraError::MustDistribute.into());
    }
    // Bind the distribution to this member *and* to this fanout/voucher, so a settled
    // distribution in a different fanout cannot satisfy the check for this one.
    if !cmp_pubkeys(subject, &ix.accounts[member_index].pubkey)
        || !cmp_pubkeys(membership_voucher, &ix.accounts[voucher_index].pubkey)
        || !cmp_pubkeys(fanout, &ix.accounts[fanout_index].pubkey)
    {
        return Err(HydraError::MustDistribute.into());
    }
    Ok(())
}

pub fn assert_valid_metadata(
    metadata_account: &AccountInfo,
    mint: &AccountInfo,
) -> Result<Metadata> {
    let data = &metadata_account.data.borrow_mut();
    if data.is_empty() || data[0] != MetadataKey::MetadataV1 as u8 {
        return Err(HydraError::InvalidMetadata.into());
    }
    let meta = Metadata::safe_deserialize(data.as_ref())?;
    if !cmp_pubkeys(&meta.mint, mint.key) {
        return Err(HydraError::InvalidMetadata.into());
    }
    Ok(meta)
}

pub fn assert_owned_by_one(account: &AccountInfo, owners: Vec<&Pubkey>) -> Result<()> {
    for o in owners {
        let res = assert_owned_by(account, o);
        if res.is_ok() {
            return res;
        }
    }
    Err(HydraError::IncorrectOwner.into())
}

#[cfg(test)]
mod tests {
    // Note this useful idiom: importing names from outer (for mod tests) scope.
    use super::*;
    use anchor_lang::solana_program::instruction::AccountMeta;

    #[test]
    fn test_multi_owner_check() {
        let owner = Pubkey::new_unique();
        let owner1 = Pubkey::new_unique();
        let owner2 = Pubkey::new_unique();
        let ad = Pubkey::new_unique();
        let actual_owner = Pubkey::new_unique();
        let lam = &mut 10000;
        let a = AccountInfo::new(&ad, false, false, lam, &mut [0; 0], &actual_owner, false, 0);

        let e = assert_owned_by_one(&a, vec![&owner, &owner2, &owner1]);

        assert!(e.is_err());

        let e = assert_owned_by_one(&a, vec![&owner, &actual_owner, &owner1]);

        assert!(e.is_ok());
    }

    const DISTRIBUTE_TOKEN_DISCRIMINATOR: [u8; 8] = [126, 105, 46, 135, 28, 36, 117, 212];
    const DISTRIBUTE_NFT_DISCRIMINATOR: [u8; 8] = [108, 240, 68, 81, 144, 83, 58, 153];

    fn distribute_ix(discriminator: &[u8], accounts: &[Pubkey]) -> Instruction {
        Instruction {
            program_id: crate::id(),
            accounts: accounts
                .iter()
                .map(|key| AccountMeta::new(*key, false))
                .collect(),
            data: discriminator.to_vec(),
        }
    }

    #[test]
    fn test_assert_distributed_token_binds_fanout_and_voucher() {
        let payer = Pubkey::new_unique();
        let member = Pubkey::new_unique();
        let voucher = Pubkey::new_unique();
        let fanout = Pubkey::new_unique();
        let other = Pubkey::new_unique();
        let ix = distribute_ix(
            &DISTRIBUTE_TOKEN_DISCRIMINATOR,
            &[payer, member, voucher, fanout],
        );

        assert!(assert_distributed(
            ix.clone(),
            &member,
            &fanout,
            &voucher,
            MembershipModel::Token
        )
        .is_ok());
        // A distribution settled for the same member in a different fanout must not count.
        assert!(assert_distributed(
            ix.clone(),
            &member,
            &other,
            &voucher,
            MembershipModel::Token
        )
        .is_err());
        assert!(
            assert_distributed(ix.clone(), &member, &fanout, &other, MembershipModel::Token)
                .is_err()
        );
        assert!(assert_distributed(ix, &other, &fanout, &voucher, MembershipModel::Token).is_err());
    }

    #[test]
    fn test_assert_distributed_nft_account_indices() {
        let payer = Pubkey::new_unique();
        let member = Pubkey::new_unique();
        let membership_mint_token_account = Pubkey::new_unique();
        let membership_key = Pubkey::new_unique();
        let voucher = Pubkey::new_unique();
        let fanout = Pubkey::new_unique();
        let ix = distribute_ix(
            &DISTRIBUTE_NFT_DISCRIMINATOR,
            &[
                payer,
                member,
                membership_mint_token_account,
                membership_key,
                voucher,
                fanout,
            ],
        );

        assert!(assert_distributed(ix, &member, &fanout, &voucher, MembershipModel::NFT).is_ok());
    }

    #[test]
    fn test_assert_distributed_rejects_truncated_instruction() {
        let member = Pubkey::new_unique();
        let voucher = Pubkey::new_unique();
        let fanout = Pubkey::new_unique();

        // Fewer than eight data bytes used to panic on `ix.data[0..8]`.
        let short_data = Instruction {
            program_id: crate::id(),
            accounts: vec![
                AccountMeta::new(Pubkey::new_unique(), false),
                AccountMeta::new(member, false),
                AccountMeta::new(voucher, false),
                AccountMeta::new(fanout, false),
            ],
            data: vec![0; 4],
        };
        assert!(assert_distributed(
            short_data,
            &member,
            &fanout,
            &voucher,
            MembershipModel::Token
        )
        .is_err());

        // Too few accounts used to panic on `ix.accounts[1]`.
        let short_accounts = distribute_ix(&DISTRIBUTE_TOKEN_DISCRIMINATOR, &[]);
        assert!(assert_distributed(
            short_accounts,
            &member,
            &fanout,
            &voucher,
            MembershipModel::Token
        )
        .is_err());
    }
}
