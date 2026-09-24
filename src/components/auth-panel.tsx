"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

type AuthMode = "signin" | "signup" | "reset-password" | "update-password";

interface AuthPanelProps {
  nextPath: string;
  /** Initial tab. Pass "update-password" when arriving from a recovery link. */
  initialMode?: AuthMode;
}

const PASSWORD_MIN_LENGTH = 8;

const modeCopy: Record<
  Exclude<AuthMode, "update-password">,
  { title: string; subtitle: string; submit: string; success: string }
> = {
  signin: {
    title: "Sign in",
    subtitle: "Sign in with your email and password",
    submit: "Sign in",
    success: "You are signed in",
  },
  signup: {
    title: "Create account",
    subtitle: "Create an account with your email and a password",
    submit: "Create account",
    success:
      "Account created. Check your email to confirm your account, then sign in.",
  },
  "reset-password": {
    title: "Reset password",
    subtitle: "Enter your email and we will send a password reset link",
    submit: "Send reset link",
    success: "Check your email for the password reset link",
  },
};

export function AuthPanel({ nextPath, initialMode }: AuthPanelProps) {
  const {
    user,
    email,
    isAdmin,
    signInWithPassword,
    signUpWithPassword,
    updatePassword,
    signInWithEmail,
    signUpWithEmail,
    resetPasswordForEmail,
    signOut,
    loading,
    isCheckingAdmin,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode ?? "signin");
  const [formEmail, setFormEmail] = useState(email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info",
  );
  const [submitting, setSubmitting] = useState(false);

  const setStatusMessage = (
    msg: string,
    type: "success" | "error" | "info",
  ) => {
    setMessage(msg);
    setMessageType(type);
  };

  const validateEmail = (): string | null => {
    if (!formEmail.trim()) return "Please enter your email address";
    if (!formEmail.includes("@")) return "Please enter a valid email address";
    return null;
  };

  const validatePasswords = (): string | null => {
    if (!password) return "Please enter a password";
    if (password.length < PASSWORD_MIN_LENGTH) {
      return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      if (mode === "signin") {
        const emailError = validateEmail();
        if (emailError) return setStatusMessage(emailError, "error");
        if (!password)
          return setStatusMessage("Please enter your password", "error");

        setSubmitting(true);
        const result = await signInWithPassword(formEmail, password);
        if (result.error) {
          setStatusMessage(result.error, "error");
        } else {
          setStatusMessage(modeCopy.signin.success, "success");
          setPassword("");
          setConfirmPassword("");
        }
        return;
      }

      if (mode === "signup") {
        const emailError = validateEmail();
        if (emailError) return setStatusMessage(emailError, "error");
        const passwordError = validatePasswords();
        if (passwordError) return setStatusMessage(passwordError, "error");

        setSubmitting(true);
        const result =
          nextPath === "/my-services"
            ? await signUpWithPassword(formEmail, password)
            : await signUpWithPassword(formEmail, password, nextPath);
        if (result.error) {
          setStatusMessage(result.error, "error");
        } else {
          setStatusMessage(
            result.needsConfirmation
              ? "Account created. Check your email to confirm it, then return here to sign in."
              : modeCopy.signup.success,
            "success",
          );
          setPassword("");
          setConfirmPassword("");
        }
        return;
      }

      if (mode === "reset-password") {
        const emailError = validateEmail();
        if (emailError) return setStatusMessage(emailError, "error");

        setSubmitting(true);
        const result = await resetPasswordForEmail(formEmail, nextPath);
        if (result.error) {
          setStatusMessage(result.error, "error");
        } else {
          setStatusMessage(modeCopy["reset-password"].success, "success");
          setFormEmail("");
        }
        return;
      }

      // update-password (recovery link)
      const passwordError = validatePasswords();
      if (passwordError) return setStatusMessage(passwordError, "error");

      setSubmitting(true);
      const result = await updatePassword(password);
      if (result.error) {
        setStatusMessage(result.error, "error");
      } else {
        setStatusMessage(
          "Password updated. You can now sign in with your new password.",
          "success",
        );
        setPassword("");
        setConfirmPassword("");
        setMode("signin");
      }
    } catch {
      setStatusMessage(
        "An unexpected error occurred. Please try again.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /** Optional email-link flow kept alongside password auth. */
  const handleEmailLink = async () => {
    const emailError = validateEmail();
    if (emailError) return setStatusMessage(emailError, "error");

    setSubmitting(true);
    setMessage("");
    try {
      const result =
        mode === "signup"
          ? await signUpWithEmail(formEmail, nextPath)
          : await signInWithEmail(formEmail, nextPath);
      if (result.error) {
        setStatusMessage(result.error, "error");
      } else {
        setStatusMessage(
          mode === "signup"
            ? "Check your email to confirm your account"
            : "Check your email for the sign-in link",
          "success",
        );
        setFormEmail("");
      }
    } catch {
      setStatusMessage(
        "An unexpected error occurred. Please try again.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || isCheckingAdmin) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-slate-600">Loading authentication...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-600">Signed in as</p>
            <p className="mt-1 font-medium text-slate-900">{user.email}</p>
            {isAdmin && (
              <p className="mt-1 text-xs font-medium tracking-wide text-teal-700 uppercase">
                Administrator
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={signOut}
            className="min-h-11 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-teal-700 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Sign out
          </button>
        </div>
        <div className="mt-6 rounded-lg bg-teal-50 p-4">
          <p className="text-sm text-teal-800">
            You are signed in. Your progress will be saved automatically.
          </p>
          <a
            href={nextPath}
            className="mt-3 inline-flex min-h-11 items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Continue
          </a>
        </div>
      </div>
    );
  }

  const showTabs = mode !== "update-password";
  const isPasswordMode = mode === "signup" || mode === "update-password";
  const copy =
    mode === "update-password"
      ? {
          title: "Set a new password",
          subtitle: "Choose a new password for your account",
          submit: "Update password",
        }
      : modeCopy[mode];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      {showTabs && (
        <div
          className="mb-6 flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1"
          role="tablist"
        >
          {(["signin", "signup", "reset-password"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={mode === tab}
              onClick={() => {
                setMode(tab);
                setMessage("");
              }}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${mode === tab ? "bg-white text-teal-800 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              {tab === "signin"
                ? "Sign in"
                : tab === "signup"
                  ? "Create account"
                  : "Reset password"}
            </button>
          ))}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {copy.title}
        </h1>
        <p className="mt-2 text-slate-600">{copy.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode !== "update-password" && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">
              Email address
            </span>
            <input
              type="email"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
        )}
        {mode !== "reset-password" && (
          <>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">
                {mode === "update-password" ? "New password" : "Password"}
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
              />
            </label>
            {isPasswordMode && (
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Confirm password
                </span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
              </label>
            )}
            {mode === "signin" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setMode("reset-password");
                    setMessage("");
                  }}
                  className="min-h-11 text-sm font-medium text-teal-700 hover:text-teal-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </>
        )}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Working..." : copy.submit}
        </Button>
      </form>

      {(mode === "signin" || mode === "signup") && (
        <div className="mt-4">
          <div className="relative my-4 text-center">
            <span className="relative z-10 bg-white px-2 text-xs tracking-wide text-slate-500 uppercase">
              or
            </span>
            <span
              className="absolute inset-x-0 top-1/2 h-px bg-slate-200"
              aria-hidden="true"
            />
          </div>
          <button
            type="button"
            onClick={handleEmailLink}
            disabled={submitting}
            className="min-h-11 w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-teal-700 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:pointer-events-none disabled:opacity-50"
          >
            {mode === "signup"
              ? "Send a sign-up link instead"
              : "Email me a sign-in link instead"}
          </button>
        </div>
      )}

      {message && (
        <p
          role={messageType === "error" ? "alert" : "status"}
          className={`mt-4 rounded-md px-4 py-3 text-sm ${
            messageType === "error"
              ? "bg-rose-50 text-rose-800"
              : messageType === "success"
                ? "bg-teal-50 text-teal-800"
                : "bg-slate-50 text-slate-700"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
