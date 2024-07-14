# Whitelist-Gated Token Sale Program

## Overview
This repository contains a smart contract implemented using Anchor to facilitate a whitelist-gated token sale on the Solana blockchain. The program ensures that only whitelisted addresses can participate in the sale, with a static token price and a purchase limit per wallet address.

## Requirements
- Rust
- Anchor CLI
- Solana Tool Suite (Solana CLI tools)

## Installation

### Clone the repository
```bash
git clone <repository_url>
cd <repository_directory>
```
# Install Anchor CLI
cargo install --git https://github.com/project-serum/anchor --tag v0.17.0 anchor-cli --locked
