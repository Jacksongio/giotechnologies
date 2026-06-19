"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import giordano1 from "../../giordano_images/giordano1.jpg";
import giordano2 from "../../giordano_images/giordano2.png";
import giordano3 from "../../giordano_images/giordano3.png";
import giordano4 from "../../giordano_images/giordano4.jpg";
import giordano5 from "../../giordano_images/giordanos5.jpg";

const giordanoPhotos = [giordano1, giordano2, giordano3, giordano4, giordano5];

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"signIn" | "signUp" | "forgot" | "reset">(
    "signIn",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const codeInputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const CODE_LENGTH = 6;
  const codeDigits = code.padEnd(CODE_LENGTH).slice(0, CODE_LENGTH).split("");

  function handleCodeChange(index: number, value: string) {
    const digits = value.replace(/\D/g, "");
    const chars = code.padEnd(CODE_LENGTH).slice(0, CODE_LENGTH).split("");

    if (!digits) {
      chars[index] = " ";
      setCode(chars.join("").trimEnd());
      return;
    }

    let cursor = index;
    for (const d of digits) {
      if (cursor >= CODE_LENGTH) break;
      chars[cursor] = d;
      cursor++;
    }
    setCode(chars.join("").trimEnd());
    codeInputsRef.current[Math.min(cursor, CODE_LENGTH - 1)]?.focus();
  }

  function handleCodeKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace" && !codeDigits[index].trim() && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      codeInputsRef.current[index + 1]?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      if (mode === "forgot") {
        await signIn("password", { email, flow: "reset" });
        setMode("reset");
        setInfo(
          "We sent a reset code to your email. Enter it below along with a new password.",
        );
        return;
      }

      if (mode === "reset") {
        const cleanCode = code.replace(/\s/g, "");
        if (cleanCode.length !== CODE_LENGTH) {
          setError("Enter the full 6-digit code from your email.");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Those passwords don't match. Please re-enter them.");
          setLoading(false);
          return;
        }
        await signIn("password", {
          email,
          code: cleanCode,
          newPassword: password,
          flow: "reset-verification",
        });
        return;
      }

      if (mode === "signUp" && password !== confirmPassword) {
        setError("Those passwords don't match. Please re-enter them.");
        setLoading(false);
        return;
      }

      await signIn("password", {
        email,
        password,
        name: mode === "signUp" ? name : undefined,
        flow: mode,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : "";
      const isNetworkError =
        message.includes("failed to fetch") ||
        message.includes("networkerror") ||
        message.includes("load failed");

      if (isNetworkError) {
        setError(
          "We couldn't reach the server. Check your internet connection and try again.",
        );
      } else if (mode === "signIn") {
        setError(
          "That email and password don't match. Double-check them, or create an account if you're new here.",
        );
      } else if (mode === "signUp") {
        setError(
          "We couldn't create your account. This email may already be registered. Try signing in instead, and make sure your password is at least 8 characters.",
        );
      } else if (mode === "forgot") {
        setError(
          "We couldn't send a reset code. Double-check your email address and try again.",
        );
      } else {
        setError(
          "That code didn't work. Make sure it matches the one we emailed you, and that your new password is at least 8 characters.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resending || resendCooldown > 0) return;
    setError("");
    setInfo("");
    setResending(true);
    try {
      await signIn("password", { email, flow: "reset" });
      setCode("");
      codeInputsRef.current[0]?.focus();
      setInfo("We sent a fresh code to your email.");
      setResendCooldown(30);
    } catch {
      setError("We couldn't resend the code. Please try again in a moment.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - cinematic photo collage */}
      <div className="relative hidden w-1/2 overflow-hidden bg-foreground lg:block xl:w-[55%]">
        {/* Background image */}
        <Image
          src={giordano3}
          alt=""
          fill
          priority
          className="object-cover opacity-60"
        />
        <div className="grain absolute inset-0" />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/40 via-transparent to-foreground/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-foreground/40" />

        {/* Content */}
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          {/* Spacer to keep the content anchored to the bottom */}
          <div />

          {/* Bottom text */}
          <div className="max-w-lg">
            <h2 className="text-balance font-serif text-4xl leading-[1.1] text-background xl:text-5xl">
              The little moments,{" "}
              <span className="italic text-background/80">
                gathered together.
              </span>
            </h2>
            <p className="mt-5 max-w-sm text-pretty text-sm leading-relaxed text-background/60">
              Birthdays, beach days, holidays, and all the in-between days worth
              pressing record for.
            </p>

            {/* Photo strip */}
            <div className="mt-8 flex gap-3">
              {giordanoPhotos
                .filter((src) => src !== giordano3)
                .map((src, i) => (
                <div
                  key={i}
                  className="relative h-16 w-16 overflow-hidden rounded-xl xl:h-20 xl:w-20"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover opacity-80"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex w-full flex-col lg:w-1/2 xl:w-[45%]">
        {/* Form area */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 sm:px-12 lg:px-16">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="mb-12">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.4em] text-primary">
                Est. 1999
              </p>
              <h1 className="mt-3 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
                The Giordanos
              </h1>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
                {mode === "signIn"
                  ? "Welcome back. Sign in to browse the family film library."
                  : mode === "signUp"
                    ? "Join the family archive. Create your account to get started."
                    : mode === "forgot"
                      ? "Forgot your password? Enter your email and we'll send you a reset code."
                      : "Check your email for the reset code, then choose a new password."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {mode === "signUp" && (
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="name"
                    className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="rounded-2xl border border-border bg-card px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="Your name"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-2xl border border-border bg-card px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="you@family.com"
                />
              </div>

              {mode === "reset" && (
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="code-0"
                    className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground"
                  >
                    Reset code
                  </label>
                  <div className="flex justify-between gap-2">
                    {codeDigits.map((digit, i) => (
                      <input
                        key={i}
                        id={`code-${i}`}
                        ref={(el) => {
                          codeInputsRef.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        autoComplete={i === 0 ? "one-time-code" : "off"}
                        maxLength={1}
                        value={digit.trim()}
                        onChange={(e) => handleCodeChange(i, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(i, e)}
                        onFocus={(e) => e.target.select()}
                        className="h-14 w-full min-w-0 rounded-2xl border border-border bg-card text-center font-serif text-2xl text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    ))}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground/70">
                      Didn&apos;t get it?
                    </span>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending || resendCooldown > 0}
                      className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-primary transition-colors hover:text-primary/80 disabled:cursor-not-allowed disabled:text-muted-foreground/50"
                    >
                      {resending
                        ? "Sending..."
                        : resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : "Resend code"}
                    </button>
                  </div>
                </div>
              )}

              {mode !== "forgot" && (
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="password"
                    className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground"
                  >
                    {mode === "reset" ? "New password" : "Password"}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full rounded-2xl border border-border bg-card px-5 py-3.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {mode === "signIn" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setError("");
                        setInfo("");
                      }}
                      className="self-end font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
              )}

              {(mode === "reset" || mode === "signUp") && (
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="confirmPassword"
                    className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground"
                  >
                    {mode === "reset"
                      ? "Confirm new password"
                      : "Confirm password"}
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="rounded-2xl border border-border bg-card px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="Re-enter your password"
                  />
                </div>
              )}

              {info && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                  <p className="text-sm text-foreground">{info}</p>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group mt-3 flex items-center justify-center gap-2.5 rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground transition-all hover:gap-3 hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  "One moment..."
                ) : (
                  <>
                    {mode === "signIn"
                      ? "Sign in"
                      : mode === "signUp"
                        ? "Create account"
                        : mode === "forgot"
                          ? "Send reset code"
                          : "Reset password"}
                    <span
                      aria-hidden
                      className="transition-transform group-hover:translate-x-0.5"
                    >
                      &rarr;
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-muted-foreground/60">
                {mode === "signIn"
                  ? "New here?"
                  : mode === "signUp"
                    ? "Already a member?"
                    : "Remember it?"}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <button
              type="button"
              onClick={() => {
                setMode(mode === "signIn" ? "signUp" : "signIn");
                setError("");
                setInfo("");
              }}
              className="w-full rounded-full border border-border py-3.5 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              {mode === "signIn" ? "Create an account" : "Sign in instead"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-6 text-center sm:px-12 lg:px-16">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-muted-foreground/50">
            Made with love, kept forever
          </p>
        </div>
      </div>
    </div>
  );
}
