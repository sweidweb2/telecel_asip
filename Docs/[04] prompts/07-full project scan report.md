Scan the **entire project** and perform a complete technical audit before changing anything.

Review the frontend, backend, database, APIs, authentication/authorization, configuration, dependencies, tests, and project structure.

I want a **full audit report**, not just a list of obvious errors.

Check for:

* What is working correctly
* What is partially implemented
* What is broken
* Broken or incorrect business logic
* Missing functionality
* Missing CRUD operations
* Missing validations (frontend + backend)
* API issues and broken API flows
* Authentication and authorization problems
* Security vulnerabilities
* Input validation/sanitization issues
* SQL/database/security issues
* Incorrect permissions or access control
* Exposed secrets, keys, tokens, or sensitive data
* Error handling problems
* Race conditions or edge cases
* Null/undefined/empty-state problems
* Incorrect state management
* Frontend/backend inconsistencies
* Broken UI flows
* Missing loading/error/empty states
* Performance bottlenecks
* Unnecessary API/database calls
* Missing or incorrect caching
* N+1 queries and inefficient database queries
* Memory/resource issues
* Dependency/package problems
* Outdated or risky dependencies
* Code duplication
* Bad architecture or separation of concerns
* Poor naming/readability/maintainability
* Dead or unused code
* Incorrect types/interfaces/contracts
* Missing indexes/constraints/database rules
* Transaction/integrity problems
* Missing logging/monitoring where needed
* Missing tests
* Weak or incorrect existing tests
* Missing edge-case tests
* Missing frontend/backend validation tests
* Missing authorization/security tests
* Missing integration/API tests

For every issue, report:

1. **Severity:** Critical / High / Medium / Low
2. **Location:** exact file + relevant function/component/line if possible
3. **Problem:** what is wrong
4. **Impact:** what could happen because of it
5. **Recommended fix**
6. **Dependencies:** whether fixing it affects another part of the system

Also identify **things that look correct and should NOT be changed**, so we don't introduce unnecessary changes.

### Final report structure

**1. Executive Summary**

* Overall project health
* Working areas
* Broken areas
* Biggest risks

**2. Critical Issues**
**3. Security Audit**
**4. Functional / Business Logic Issues**
**5. Frontend Issues**
**6. Backend / API Issues**
**7. Database Issues**
**8. Performance Issues**
**9. Architecture / Code Quality**
**10. Validation & Error Handling**
**11. Testing Gaps**
**12. Missing Features / Incomplete Implementations**
**13. Dependency / Configuration Issues**
**14. Edge Cases**
**15. What Is Working Correctly**
**16. Prioritized Fix Plan**

For the prioritized fix plan, group issues into:

* **P0 — Fix immediately**
* **P1 — Fix before production**
* **P2 — Important improvements**
* **P3 — Nice-to-have**

### Important rules

* **Do not modify the project yet.**
* First inspect and understand the whole system.
* Trace important flows end-to-end: **UI → API → controller → service → repository/database → response → UI**.
* Do not assume something works because the code exists; verify the complete flow.
* Do not report theoretical issues without explaining why they apply to this project.
* Look for issues that are not immediately visible from individual files.
* Check how different features interact with each other.
* Check both happy paths and failure/edge cases.
* Be specific: avoid vague statements like "security could be improved."
* If something cannot be verified, explicitly mark it as **"Needs verification"** rather than assuming.
* Do not fix anything until I review the audit report.
