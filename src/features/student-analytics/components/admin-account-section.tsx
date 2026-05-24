"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/toast";
import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import type { UserProfile } from "@/services/user.service";
import type { Student } from "@/types/student";
import { getStudentClassLabel } from "@/types/student";

type AdminAccountSectionProps = {
  student: Student;
};

export function AdminAccountSection({ student }: AdminAccountSectionProps) {
  const { toast } = useToast();
  const authUid = student.authUserId ?? student.uid ?? student.id;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authUid) return;
    const db = requireFirestore();
    const unsub = onSnapshot(doc(db, COLLECTIONS.users, authUid), (snap) => {
      setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
      setLoading(false);
    });
    return () => unsub();
  }, [authUid]);

  const toggleStatus = async () => {
    if (!authUid) return;
    setSaving(true);
    try {
      const db = requireFirestore();
      const next = profile?.status === "inactive" ? "active" : "inactive";
      await updateDoc(doc(db, COLLECTIONS.users, authUid), { status: next });
      toast({
        title: `Account ${next === "active" ? "activated" : "deactivated"}.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Failed to update account.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {loading ? (
          <LoadingSpinner label="Loading account" />
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              <p>
                <span className="text-muted-foreground">Email: </span>
                {student.email || profile?.email || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Role: </span>
                {profile?.role ?? "student"}
              </p>
              <p>
                <span className="text-muted-foreground">Status: </span>
                <Badge
                  variant={profile?.status === "inactive" ? "secondary" : "success"}
                >
                  {profile?.status ?? "active"}
                </Badge>
              </p>
              <p>
                <span className="text-muted-foreground">Current class: </span>
                {getStudentClassLabel(student)}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void toggleStatus()}
              isLoading={saving}
            >
              {profile?.status === "inactive"
                ? "Activate account"
                : "Deactivate account"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
