import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, hasSupabase } from "./supabase";
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStaff, setStaff] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [aal, setAal] = useState("aal1");
  const [rolesLoading, setRolesLoading] = useState(false);
  const [checkedToken, setCheckedToken] = useState<string | null>(null);
  useEffect(() => {
    if (!hasSupabase) {
      setLoading(false);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
        setLoading(false);
      }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      if (active) {
        setSession(s);
        setLoading(false);
      }
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    let active = true;
    setStaff(false);
    setRole(null);
    setAal("aal1");
    setRolesLoading(false);
    if (!session) return;
    setRolesLoading(true);
    Promise.all([
      supabase
        .from("staff_members")
        .select("user_id,role,active")
        .eq("user_id", session.user.id)
        .maybeSingle(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    ])
      .then(([staff, assurance]) => {
        if (active) {
          setStaff(!!staff.data?.active);
          setRole(staff.data?.active ? staff.data.role : null);
          setAal(assurance.data?.currentLevel || "aal1");
        }
      })
      .catch(() => {
        /* Role checks fail closed; the server still verifies every action. */
      })
      .finally(() => {
        if (active) {
          setCheckedToken(session.access_token);
          setRolesLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [session?.access_token, session?.user.id]);
  return {
    session,
    user: session?.user ?? null,
    isStaff,
    role,
    isAdmin: isStaff && aal === "aal2",
    aal,
    loading: loading || rolesLoading || (!!session && checkedToken !== session.access_token),
    signOut: () => supabase.auth.signOut(),
  };
}
