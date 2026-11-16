"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DeprecatedAdminPostsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/dashboard/subjects");
  }, [router]);

  return null;
}
