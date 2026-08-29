# Security Specification & Threat Model

## Data Invariants
1. **User Identity Isolation**: A user can only create or update their own user profile document at `/users/{userId}` where `userId == request.auth.uid`.
2. **Access Requests Integrity**: Any authenticated or visitor client can submit access requests with validated string limits and valid email format.
3. **Default Deny**: All unmapped collections and wildcard paths default to strictly `allow read, write: if false;`.

## The "Dirty Dozen" Threat Scenarios
1. **User Profile Hijacking**: Attempting to write to `/users/victim_uid` with `request.auth.uid == 'attacker_uid'`. -> Expected: PERMISSION_DENIED.
2. **Access Request Payload Overload**: Injecting a 2MB string into `propertyName` or `fullName`. -> Expected: PERMISSION_DENIED.
3. **Invalid Document ID Attack**: Targeting a path with malicious characters like `/users/../../etc`. -> Expected: PERMISSION_DENIED.
4. **Unauthenticated Profile Modification**: Calling update on `/users/{userId}` without a valid Auth token. -> Expected: PERMISSION_DENIED.
5. **Role Escalation via Shadow Fields**: Injecting arbitrary extra fields into user documents. -> Expected: PERMISSION_DENIED.
6. **Cross-Tenant Reading**: Unauthenticated list scans of `/users`. -> Expected: PERMISSION_DENIED.
7. **Ghost Collection Writes**: Attempting to write to arbitrary non-existent collections. -> Expected: PERMISSION_DENIED.
8. **Delete User Document as Non-Owner**: Attempting to delete another staff member's profile. -> Expected: PERMISSION_DENIED.
9. **Corrupt Email Format in User Profile**: Sending invalid email string. -> Expected: PERMISSION_DENIED.
10. **Tampering with Immutable ID**: Updating user document with an `id` mismatching `request.auth.uid`. -> Expected: PERMISSION_DENIED.
11. **Negative string length bypass**: Attempting zero or out-of-range payload bounds. -> Expected: PERMISSION_DENIED.
12. **Denial of Wallet Read Bombing**: Attempting unindexed unbounded queries. -> Expected: PERMISSION_DENIED.
