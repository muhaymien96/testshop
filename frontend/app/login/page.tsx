import React, { Suspense } from "react";
import LoginFormClient from "../../components/LoginFormClient";

export default function LoginPage() {
  return (
    <section className="max-w-md mx-auto py-12">
      <Suspense fallback={<div>Loading form…</div>}>
        {/* LoginFormClient is a client component using useSearchParams/useRouter */}
        <LoginFormClient />
      </Suspense>
    </section>
  );
}
