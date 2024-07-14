use anchor_lang::prelude::*;
declare_id!("5j4KSp5cfLnt2puNbQJtepfe3Cjpcyi6Gd8cC5rs9ThL");

#[program]
mod whitelist_sale {
    use anchor_lang::solana_program::entrypoint::ProgramResult;

    use super::*;

    pub fn initialize(ctx: Context<Initialize>, token_price: u64, purchase_limit: u64) -> ProgramResult {
        let sale = &mut ctx.accounts.sale;
        sale.token_price = token_price;
        sale.purchase_limit = purchase_limit;
        sale.whitelist = vec![];
        Ok(())
    }

    pub fn add_to_whitelist(ctx: Context<AddToWhitelist>, address: String) -> ProgramResult {
        let sale = &mut ctx.accounts.sale;
        sale.whitelist.push(address);
        Ok(())
    }

    pub fn purchase_tokens(ctx: Context<PurchaseTokens>, address: String, amount: u64) -> ProgramResult {
        let mut sale = ctx.accounts.sale.clone();
    
        // Check if the address is whitelisted
        if !sale.whitelist.contains(&address) {
            return Err(ErrorCode::NotWhitelisted.into());
        }
    
        // Check and update the purchases
        let mut found = false;
        for (addr, count) in sale.purchases.iter_mut() {
            if *addr == address {
                found = true;
                if *count + amount > sale.purchase_limit {
                    return Err(ErrorCode::PurchaseLimitExceeded.into());
                }
                *count += amount;
                break; // Exit the loop once updated
            }
        }
    
        if !found {
            return Err(ErrorCode::NotWhitelisted.into());
        }
    
        // Update the original account with the modified `sale`
        ctx.accounts.sale = sale;
    
        Ok(())
    }
}

const MAX_PURCHASES: usize = 10; // Example: Adjust as per your requirement

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 128)]
    pub sale: Account<'info, Sale>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddToWhitelist<'info> {
    #[account(mut)]
    pub sale: Account<'info, Sale>,
}

#[derive(Accounts)]
pub struct PurchaseTokens<'info> {
    #[account(mut)]
    pub sale: Account<'info, Sale>,
}

#[account]
pub struct Sale {
    pub token_price: u64,
    pub purchase_limit: u64,
    pub whitelist: Vec<String>,
    #[account(init = [(String::new(), 0); MAX_PURCHASES])]
    pub purchases: Vec<(String, u64)>,
}

#[error]
pub enum ErrorCode {
    NotWhitelisted,
    PurchaseLimitExceeded,
}

impl From<ErrorCode> for ProgramError {
    fn from(err: ErrorCode) -> Self {
        match err {
            ErrorCode::NotWhitelisted => ProgramError::Custom(1),
            ErrorCode::PurchaseLimitExceeded => ProgramError::Custom(2),
        }
    }
}

