# Whitelist-Gated Token Sale Program

## Overview
This repository contains a smart contract implemented using Anchor to facilitate a whitelist-gated token sale on the Solana blockchain. The program ensures that only whitelisted addresses can participate in the sale, with a static token price and a purchase limit per wallet address.

## Requirements
- Rust
- Anchor CLI
- Solana CLI tools

## Installation

### Clone the repository
```bash
git clone https://github.com/abhirupinspace/Whitelist-gated-Token-Sale
cd <directory>
```
# Install Anchor CLI
```bash
cargo install --git https://github.com/project-serum/anchor --tag v0.17.0 anchor-cli --locked
```
# Deployment
Deploy the smart contract to Solana mainnet or testnet:
```bash
anchor build
anchor deploy
```
## Interacting with the Contract
Add addresses to the whitelist
```bash
anchor run add-to-whitelist --keypair <path_to_your_keypair>
```
Purchase tokens from the sale:
```bash
anchor run purchase --keypair <path_to_your_keypair> --amount <number_of_tokens>
```
## Troubleshooting
Ensure all dependencies are installed correctly.
Check Solana local cluster status if tests or deployment fail.
