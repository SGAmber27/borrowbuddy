# Borrow Buddy - Supabase Migration TODO
✅ **Phase 1 Complete:** Items/requests data migrated (js/utils.js CRUD functions + caching)

✅ **Phase 2 Progress: Database Created**

## Phase 2: Complete Auth Migration (localStorage → Supabase Auth)
### 1. [✅] Create Supabase Tables
   - profiles: id (uuid), firstName, lastName, phone, email, role, updated_at **(Created via supabase-migration-profiles.sql)**
   - RLS policies for auth.users → profiles **(Created)**

### 2. [ ] Update js/utils.js
   - Replace getCurrentUser() → supabase.auth.getUser() + profile fetch
   - logout() → supabase.auth.signOut()
   - Add signInAsync(), signUpAsync()
   - Update isAdmin(), isLoggedIn()
   - Remove safeGet/safeSet 'loggedInUser'

### 3. [ ] Update js/profile.js
   - saveProfile() → supabase.from('profiles').upsert()

### 4. [ ] Update login/signup (login.html/signup.html)
   - Use new auth functions
   - Redirect after success

### 5. [ ] Test Flow
   - signup → verify email → login → profile edit → admin check → logout
   - `await initDefaultItemsAsync()` for data

### 6. [ ] Cleanup
   - Remove all localStorage references
   - search_files confirm zero matches
   - attempt_completion

**Current Progress: Phase 2 Step 1 ✅ Complete. Next: Run SQL script in Supabase dashboard → Test auth → Proceed to Step 2.**

