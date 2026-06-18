# Security Policy

## On-chain privacy rule (graded)
Never store personal or sensitive data on-chain. Store only: `keccak256(file)` hashes,
IPFS CIDs, addresses, status flags, timestamps, and events. The real artifact stays off-chain.

## Threat model (per prototype)
See `docs/audit-module.md` for the slice-4 threat model (fake issuer, unauthorized transfer,
reentrancy, replay, front-running) and the mitigations implemented in the contracts.

## Reporting an issue in this reference repo
Open a private security advisory or contact the Tech Lead (member1). Do not file public issues
for suspected key-management or access-control flaws.
