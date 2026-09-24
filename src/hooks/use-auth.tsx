"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  createSupabaseBrowserClient,
  type User,
  type Session,
} from "@/lib/supabase/browser";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  email: string | null;
  isAdmin: boolean;
  isCheckingAdmin: boolean;
  signInWithEmail: (
    email: string,
    redirectTo?: string,
  ) => Promise<{ error?: string }>;
  signUpWithEmail: (
    email: string,
    redirectTo?: string,
  ) => Promise<{ error?: string }>;
  signInWithPassword: (
    email: string,
    password: string,
  ) => Promise<{ error?: string }>;
  signUpWithPassword: (
    email: string,
    password: string,
    redirectTo?: string,
  ) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
  verifyOtp: (email: string, token: string) => Promise<{ error?: string }>;
  resetPasswordForEmail: (
    email: string,
    redirectTo?: string,
  ) => Promise<{ error?: string }>;
  updateUser: (attributes: {
    email?: string;
    phone?: string;
  }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createSupabaseBrowserClient();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  // Loading only starts true when Supabase is actually configured, so no
  // synchronous setState is needed inside the auth effect.
  const [loading, setLoading] = useState(Boolean(supabase));
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  // Email-link signup does not use a user-chosen password, so a random one is
  // generated per account. The user never sees or types it; sign-in happens
  // through the emailed link / OTP.
  const generateRandomPassword = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `pwd-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
  };

  // Declared before the auth effect so the effect depends on a stable value.
  const checkAdminStatus = useCallback(
    async (userId: string | undefined): Promise<boolean> => {
      if (!supabase || !userId) {
        return false;
      }
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error checking admin status:", error);
          return false;
        }

        return data?.role === "admin" || data?.role === "super_admin";
      } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
    },
    [supabase],
  );

  useEffect(() => {
    if (!supabase) return;

    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setEmail(initialSession?.user?.email ?? null);

        if (initialSession?.user) {
          setIsCheckingAdmin(true);
          const adminStatus = await checkAdminStatus(initialSession.user.id);
          setIsAdmin(adminStatus);
        }

        const { data: listener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setEmail(session?.user?.email ?? null);

            if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
              setIsCheckingAdmin(true);
              const adminStatus = await checkAdminStatus(session?.user?.id);
              setIsAdmin(adminStatus);
              setIsCheckingAdmin(false);
            }
            if (event === "SIGNED_OUT") {
              setIsAdmin(false);
              setIsCheckingAdmin(false);
            }
          },
        );

        setLoading(false);
        return () => listener.subscription.unsubscribe();
      } catch (error) {
        console.error("Auth initialization error:", error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, [supabase, checkAdminStatus]);

  const signInWithEmail = async (
    email: string,
    redirectTo?: string,
  ): Promise<{ error?: string }> => {
    if (!supabase) return { error: "Authentication is not configured" };
    if (!email || !email.includes("@")) {
      return { error: "Please enter a valid email address" };
    }
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const nextPath =
      redirectTo && redirectTo.startsWith("/") ? redirectTo : "/my-services";
    const redirectUrl = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl },
    });
    return error
      ? {
          error:
            "We could not send a sign-in link right now. Please try again.",
        }
      : {};
  };

  const signUpWithEmail = async (
    email: string,
    redirectTo?: string,
  ): Promise<{ error?: string }> => {
    if (!supabase) return { error: "Authentication is not configured" };
    if (!email || !email.includes("@")) {
      return { error: "Please enter a valid email address" };
    }
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const nextPath =
      redirectTo && redirectTo.startsWith("/") ? redirectTo : "/my-services";
    const redirectUrl = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { error } = await supabase.auth.signUp({
      email,
      password: generateRandomPassword(),
      options: { emailRedirectTo: redirectUrl },
    });
    return error ? { error: `Account creation failed: ${error.message}` } : {};
  };

  // Password-based sign in (primary flow; does not depend on email templates).
  const signInWithPassword = async (
    email: string,
    password: string,
  ): Promise<{ error?: string }> => {
    if (!supabase) return { error: "Authentication is not configured" };
    if (!email || !email.includes("@")) {
      return { error: "Please enter a valid email address" };
    }
    if (!password) {
      return { error: "Please enter your password" };
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          return { error: "Incorrect email or password. Please try again." };
        }
        if (error.message.includes("Email not confirmed")) {
          return {
            error:
              "Please confirm your email first. Check your inbox for the confirmation link.",
          };
        }
        return {
          error: "We could not sign you in right now. Please try again.",
        };
      }
      return {};
    } catch {
      return { error: "We could not sign you in right now. Please try again." };
    }
  };

  // Password-based sign up. Returns needsConfirmation when the project has
  // email confirmation enabled (the user must click the emailed link before
  // they can sign in with their password).
  const signUpWithPassword = async (
    email: string,
    password: string,
    redirectTo?: string,
  ): Promise<{ error?: string; needsConfirmation?: boolean }> => {
    if (!supabase) return { error: "Authentication is not configured" };
    if (!email || !email.includes("@")) {
      return { error: "Please enter a valid email address" };
    }
    if (password.length < 8) {
      return { error: "Password must be at least 8 characters long." };
    }
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const nextPath =
        redirectTo && redirectTo.startsWith("/") ? redirectTo : "/auth";
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });
      if (error) {
        if (
          error.message.includes("already registered") ||
          error.message.includes("already been registered")
        ) {
          return {
            error:
              "An account with this email already exists. Try signing in instead.",
          };
        }
        if (error.message.includes("Email rate limit")) {
          return {
            error:
              "Too many sign-up emails were requested. Please wait a few minutes and try again.",
          };
        }
        if (error.message.includes("Password")) {
          return {
            error: "Choose a stronger password with at least 8 characters.",
          };
        }
        if (
          error.message.includes("Error sending confirmation email") ||
          error.message.includes("Email not sent")
        ) {
          return {
            error:
              "Your account could not be created because Supabase could not send the confirmation email. Please contact support or try again after email delivery is configured.",
          };
        }
        return {
          error:
            "Account creation failed. Please try again or contact support.",
        };
      }
      return { needsConfirmation: !data.session };
    } catch {
      return {
        error: "We could not create your account right now. Please try again.",
      };
    }
  };

  // Set a new password for the signed-in session (used by the password
  // recovery flow after the user clicks the emailed reset link).
  const updatePassword = async (
    newPassword: string,
  ): Promise<{ error?: string }> => {
    if (!supabase) return { error: "Authentication is not configured" };
    if (newPassword.length < 8) {
      return { error: "Password must be at least 8 characters long." };
    }
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        if (error.message.includes("same password")) {
          return {
            error: "Please choose a password different from your current one.",
          };
        }
        return {
          error: "We could not update your password. Please try again.",
        };
      }
      return {};
    } catch {
      return { error: "We could not update your password. Please try again." };
    }
  };

  const verifyOtp = async (
    email: string,
    token: string,
  ): Promise<{ error?: string }> => {
    if (!supabase) return { error: "Authentication is not configured" };
    if (!email || !token) {
      return { error: "Please enter the code we emailed you." };
    }
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    return error
      ? { error: "That code is invalid or expired. Please try again." }
      : {};
  };

  const resetPasswordForEmail = async (
    email: string,
    redirectTo?: string,
  ): Promise<{ error?: string }> => {
    if (!supabase) return { error: "Authentication is not configured" };
    if (!email || !email.includes("@")) {
      return { error: "Please enter a valid email address" };
    }
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const nextPath =
      redirectTo && redirectTo.startsWith("/")
        ? redirectTo
        : "/auth?mode=update-password";
    const redirectUrl = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return error
      ? {
          error:
            "We could not send a password reset email right now. Please try again.",
        }
      : {};
  };

  const updateUser = async (attributes: {
    email?: string;
    phone?: string;
  }): Promise<{ error?: string }> => {
    if (!supabase || !user) return { error: "Not authenticated" };
    try {
      const updates: Record<string, string> = {};
      if (attributes.email && attributes.email !== user.email) {
        updates.email = attributes.email;
      }
      if (attributes.phone) {
        updates.phone = attributes.phone;
      }

      const { error } = await supabase.auth.updateUser(updates);
      if (error) {
        return { error: "Failed to update profile. Please try again." };
      }

      if (attributes.phone) {
        await supabase.from("profiles").upsert({
          id: user.id,
          phone: attributes.phone,
        });
      }

      return {};
    } catch {
      return { error: "Failed to update profile. Please try again." };
    }
  };

  const signOut = async (): Promise<void> => {
    if (!supabase) return;
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) {
        console.error("Sign out error:", error);
        return;
      }
      setSession(null);
      setUser(null);
      setEmail(null);
      setIsAdmin(false);
      setIsCheckingAdmin(false);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (!supabase) return;
    try {
      const {
        data: { session: newSession },
      } = await supabase.auth.getSession();
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setEmail(newSession?.user?.email ?? null);
      if (newSession?.user) {
        setIsCheckingAdmin(true);
        const adminStatus = await checkAdminStatus(newSession.user.id);
        setIsAdmin(adminStatus);
        setIsCheckingAdmin(false);
      }
    } catch (error) {
      console.error("Refresh user error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        email,
        isAdmin,
        isCheckingAdmin,
        signInWithEmail,
        signUpWithEmail,
        signInWithPassword,
        signUpWithPassword,
        updatePassword,
        verifyOtp,
        resetPasswordForEmail,
        updateUser,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useIsAuthenticated(): boolean {
  const { user, loading } = useAuth();
  return !loading && !!user;
}

export function useRequireAuth(redirectTo?: string): boolean {
  const { user, loading } = useAuth();
  // `redirectTo` is kept for API compatibility with existing callers.
  void redirectTo;
  // Derived directly from auth state instead of an effect that syncs state
  // into state (avoids cascading renders).
  return !loading && !user;
}
