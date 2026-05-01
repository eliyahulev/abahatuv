// Email allowlist for the super-admin view. Client-side gating only — Firestore
// security rules must also grant the admin email read access to the entire
// users collection, e.g.:
//
//   match /users/{userId} {
//     allow read: if request.auth != null &&
//       (request.auth.uid == userId ||
//        request.auth.token.email == 'eliyahu.lev@gmail.com');
//     allow write: if request.auth != null && request.auth.uid == userId;
//   }
export const ADMIN_EMAILS = ['eliyahu.lev@gmail.com']

export function isAdmin(user) {
  return !!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())
}
