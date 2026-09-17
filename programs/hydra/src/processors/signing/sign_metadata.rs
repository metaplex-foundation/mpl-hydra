use crate::{error::HydraError, state::Fanout, utils::validation::assert_owned_by};
use anchor_lang::prelude::*;

use anchor_lang::solana_program::program::invoke_signed;
use mpl_token_metadata::{instructions::SignMetadata as SignMetadataIx, types::Key as MetadataKey};

#[derive(Accounts)]
pub struct SignMetadata<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
    seeds = [b"fanout-config", fanout.name.as_bytes()],
    has_one = authority,
    bump
    )]
    pub fanout: Account<'info, Fanout>,
    #[account(
    constraint = fanout.account_key == holding_account.key(),
    seeds = [b"fanout-native-account", fanout.key().as_ref()],
    bump
    )]
    /// CHECK: Checked in Program
    pub holding_account: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Checked in Program
    pub metadata: UncheckedAccount<'info>,
    #[account(address = mpl_token_metadata::ID)]
    /// CHECK: Checked in Program
    pub token_metadata_program: UncheckedAccount<'info>,
}

pub fn sign_metadata(ctx: Context<SignMetadata>) -> Result<()> {
    let metadata = ctx.accounts.metadata.to_account_info();
    let holding_account = &ctx.accounts.holding_account;
    assert_owned_by(&metadata, &mpl_token_metadata::ID)?;
    let meta_data = metadata.try_borrow_data()?;
    if meta_data.is_empty() || meta_data[0] != MetadataKey::MetadataV1 as u8 {
        return Err(HydraError::InvalidMetadata.into());
    }
    drop(meta_data);
    let ix = SignMetadataIx {
        metadata: metadata.key(),
        creator: holding_account.key(),
    }
    .instruction();
    invoke_signed(
        &ix,
        &[metadata.to_owned(), holding_account.to_account_info()],
        &[&[
            "fanout-native-account".as_bytes(),
            ctx.accounts.fanout.key().as_ref(),
            &[ctx.bumps.holding_account],
        ]],
    )
    .map_err(|e| {
        error::Error::ProgramError(Box::new(ProgramErrorWithOrigin {
            program_error: e,
            error_origin: None,
            compared_values: None,
        }))
    })?;
    Ok(())
}
