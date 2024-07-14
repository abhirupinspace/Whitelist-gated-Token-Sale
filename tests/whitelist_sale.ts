import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WhitelistSale } from "../target/types/whitelist_sale";
import { assert } from "chai";

describe("whitelist_sale", () => {
  
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.WhitelistSale as Program<WhitelistSale>;

  let saleAccount: anchor.web3.Keypair;
  let user: anchor.web3.Keypair;

  before(async () => {
    saleAccount = anchor.web3.Keypair.generate();
    user = anchor.web3.Keypair.generate();
  });

  it("Is initialized!", async () => {
    const tx = await program.methods.initialize()
      .accounts({
        saleAccount: saleAccount.publicKey,
        user: anchor.AnchorProvider.env().wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([saleAccount])
      .rpc();
    console.log("Your transaction signature", tx);

    // Fetch the account and check initial state
    const account = await program.account.saleAccount.fetch(saleAccount.publicKey);
    assert.ok(account.whitelist.length === 0, "Whitelist should be empty initially");
    assert.ok(account.staticPrice === 0, "Static price should be 0 initially");
    assert.ok(account.purchaseLimit === 0, "Purchase limit should be 0 initially");
    assert.ok(account.totalSold === 0, "Total sold should be 0 initially");
  });

  it("Adds to the whitelist", async () => {
    const tx = await program.methods.addToWhitelist(user.publicKey)
      .accounts({
        saleAccount: saleAccount.publicKey,
        user: anchor.AnchorProvider.env().wallet.publicKey,
      })
      .rpc();
    console.log("Your transaction signature", tx);

    // Fetch the account and check the whitelist
    const account = await program.account.saleAccount.fetch(saleAccount.publicKey);
    assert.ok(account.whitelist.includes(user.publicKey), "User should be whitelisted");
  });

  it("Allows whitelisted user to purchase tokens", async () => {
    const amount = 10;

    const tx = await program.methods.purchase(new anchor.BN(amount))
      .accounts({
        saleAccount: saleAccount.publicKey,
        user: user.publicKey,
      })
      .signers([user])
      .rpc();
    console.log("Your transaction signature", tx);

    // Fetch the account and check the total sold
    const account = await program.account.saleAccount.fetch(saleAccount.publicKey);
    assert.ok(account.totalSold === amount, "Total sold should be updated");
  });

  it("Prevents non-whitelisted user from purchasing tokens", async () => {
    const nonWhitelistedUser = anchor.web3.Keypair.generate();
    const amount = 10;

    try {
      const tx = await program.methods.purchase(new anchor.BN(amount))
        .accounts({
          saleAccount: saleAccount.publicKey,
          user: nonWhitelistedUser.publicKey,
        })
        .signers([nonWhitelistedUser])
        .rpc();
      console.log("Your transaction signature", tx);
    } catch (err) {
      console.log("Expected error:", err);
    }

    // Fetch the account and ensure total sold is unchanged
    const account = await program.account.saleAccount.fetch(saleAccount.publicKey);
    assert.ok(account.totalSold === 10, "Total sold should remain unchanged");
  });

  it("Respects purchase limits per wallet", async () => {
    const maxPurchase = 15;
    const additionalPurchase = 10;

    // First purchase
    const tx1 = await program.methods.purchase(new anchor.BN(maxPurchase))
      .accounts({
        saleAccount: saleAccount.publicKey,
        user: user.publicKey,
      })
      .signers([user])
      .rpc();
    console.log("Your transaction signature", tx1);

    // Attempt to purchase beyond the limit
    try {
      const tx2 = await program.methods.purchase(new anchor.BN(additionalPurchase))
        .accounts({
          saleAccount: saleAccount.publicKey,
          user: user.publicKey,
        })
        .signers([user])
        .rpc();
      console.log("Your transaction signature", tx2);
    } catch (err) {
      console.log("Expected error:", err);
    }

    // Fetch the account and ensure total sold is maxPurchase
    const account = await program.account.saleAccount.fetch(saleAccount.publicKey);
    assert.ok(account.totalSold === maxPurchase, "Total sold should not exceed max purchase limit");
  });
});
