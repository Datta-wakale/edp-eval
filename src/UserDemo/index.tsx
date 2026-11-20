import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./styles.module.css";

type Field = "firstName" | "lastName" | "email" | "password";
type LoginValues = Record<Field, string>;
type FieldErrors = Partial<Record<Field, string>>;

interface AuthenticatedUser {
    firstName: string;
    lastName: string;
    email: string;
}

const initialValues: LoginValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
};

const namePattern = /^[\p{L}\p{M}][\p{L}\p{M}' -]{0,49}$/u;
const emailPattern =
    /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

function getApiUrl(path: string) {
    const { hostname, protocol } = window.location;
    const codespace = hostname.match(/^(.*)-\d+(\..+)$/);

    if (codespace) {
        return `${protocol}//${codespace[1]}-3001${codespace[2]}/api${path}`;
    }

    if (hostname === "localhost" || hostname === "127.0.0.1") {
        return `${protocol}//${hostname}:3001/api${path}`;
    }

    throw new Error("The demo authentication API is available in Codespaces or localhost.");
}

function isAuthenticatedUser(value: unknown): value is AuthenticatedUser {
    if (!value || typeof value !== "object") {
        return false;
    }

    return (
        "firstName" in value &&
        "lastName" in value &&
        "email" in value &&
        typeof value.firstName === "string" &&
        typeof value.lastName === "string" &&
        typeof value.email === "string"
    );
}

function validateName(value: string, label: string) {
    const name = value.trim();
    return namePattern.test(name) ? "" : `Enter a valid ${label} (letters, spaces, apostrophes, or hyphens).`;
}

function validateEmail(value: string) {
    const email = value.trim();
    return email.length <= 254 && emailPattern.test(email)
        ? ""
        : "Enter a valid email address.";
}

function validatePassword(value: string) {
    return value.length >= 8 &&
        value.length <= 128 &&
        /[A-Za-z]/.test(value) &&
        /\d/.test(value)
        ? ""
        : "Password must be 8-128 characters and include a letter and a number.";
}

function getErrorMessage(body: unknown, fallback: string) {
    if (
        body &&
        typeof body === "object" &&
        "error" in body &&
        typeof body.error === "string"
    ) {
        return body.error;
    }

    return fallback;
}

export default function Login() {
    const [step, setStep] = useState<1 | 2>(1);
    const [values, setValues] = useState<LoginValues>(initialValues);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [apiError, setApiError] = useState("");
    const [checkingSession, setCheckingSession] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [authenticatedUser, setAuthenticatedUser] =
        useState<AuthenticatedUser | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function checkSession() {
            try {
                const response = await fetch(getApiUrl("/session"), {
                    credentials: "include",
                });

                if (response.status === 401) {
                    return;
                }
                if (!response.ok) {
                    throw new Error("Unable to check the login session.");
                }

                const body: unknown = await response.json();
                if (!body || typeof body !== "object" || !("user" in body) || !isAuthenticatedUser(body.user)) {
                    throw new Error("The authentication API returned an invalid session.");
                }
                if (isMounted) {
                    setAuthenticatedUser(body.user);
                }
            } catch {
                if (isMounted) {
                    setApiError("Cannot reach the demo API. Start the project with `npm start`.");
                }
            } finally {
                if (isMounted) {
                    setCheckingSession(false);
                }
            }
        }

        void checkSession();
        return () => {
            isMounted = false;
        };
    }, []);

    function updateValue(field: Field, value: string) {
        setValues((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: "" }));
        setApiError("");
    }

    function validateIdentity(): FieldErrors {
        return {
            firstName: validateName(values.firstName, "first name"),
            lastName: validateName(values.lastName, "last name"),
        };
    }

    function validateCredentials(): FieldErrors {
        return {
            email: validateEmail(values.email),
            password: validatePassword(values.password),
        };
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setApiError("");

        if (step === 1) {
            const nextErrors = validateIdentity();
            setErrors(nextErrors);
            if (Object.values(nextErrors).some(Boolean)) {
                return;
            }
            setStep(2);
            return;
        }

        const nextErrors = validateCredentials();
        setErrors(nextErrors);
        if (Object.values(nextErrors).some(Boolean)) {
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(getApiUrl("/login"), {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: values.firstName.trim(),
                    lastName: values.lastName.trim(),
                    email: values.email.trim(),
                    password: values.password,
                }),
            });
            const body: unknown = await response.json();

            if (!response.ok) {
                setApiError(
                    getErrorMessage(body, "Login failed. Please try again."),
                );
                return;
            }
            if (!body || typeof body !== "object" || !("user" in body) || !isAuthenticatedUser(body.user)) {
                throw new Error("The authentication API returned an invalid response.");
            }

            setAuthenticatedUser(body.user);
            setValues(initialValues);
            setErrors({});
            toast.success("Login successful!");
        } catch (error) {
            setApiError(
                error instanceof Error
                    ? error.message
                    : "Unable to complete login. Please try again.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    async function handleLogout() {
        setSubmitting(true);
        setApiError("");
        try {
            const response = await fetch(getApiUrl("/logout"), {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: "{}",
            });

            if (!response.ok) {
                throw new Error("Logout failed. Please try again.");
            }

            setAuthenticatedUser(null);
            setValues(initialValues);
            setErrors({});
            setStep(1);
            toast.error("Logged out successfully.");
        } catch (error) {
            setApiError(
                error instanceof Error
                    ? error.message
                    : "Unable to complete logout. Please try again.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    function renderFieldError(field: Field) {
        return errors[field] ? (
            <span className={styles.error} id={`${field}-error`} role="alert">
                {errors[field]}
            </span>
        ) : null;
    }

    return (
        <main className={styles.loginPage}>
            <section className={styles.card} aria-labelledby="login-title">
                <div className={styles.cardHeader}>
                    <span className={styles.eyebrow}>ACCOUNT ACCESS</span>
                    <h1 id="login-title" className={styles.title}>
                        {authenticatedUser ? "Welcome back" : "Sign in"}
                    </h1>
                    <p className={styles.subtitle}>
                        {authenticatedUser
                            ? `${authenticatedUser.firstName} ${authenticatedUser.lastName}`
                            : "Enter your details to continue."}
                    </p>
                </div>

                {checkingSession ? (
                    <p className={styles.status} role="status">
                        Checking your session…
                    </p>
                ) : authenticatedUser ? (
                    <div className={styles.authenticated}>
                        <p>You are signed in as {authenticatedUser.email}.</p>
                        <button
                            className={styles.logoutButton}
                            type="button"
                            onClick={handleLogout}
                            disabled={submitting}
                        >
                            {submitting ? "Signing out…" : "Log out"}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={styles.stepper} aria-label={`Step ${step} of 2`}>
                            <span className={step === 1 ? styles.activeStep : styles.completeStep}>
                                1 <span>Your name</span>
                            </span>
                            <span className={styles.stepLine} />
                            <span className={step === 2 ? styles.activeStep : styles.inactiveStep}>
                                2 <span>Credentials</span>
                            </span>
                        </div>

                        <form className={styles.form} onSubmit={handleSubmit} noValidate>
                            {step === 1 ? (
                                <>
                                    <div className={styles.field}>
                                        <label htmlFor="firstName">First name</label>
                                        <input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            autoComplete="given-name"
                                            maxLength={50}
                                            required
                                            value={values.firstName}
                                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                                updateValue("firstName", event.target.value)
                                            }
                                            aria-invalid={Boolean(errors.firstName)}
                                            aria-describedby={errors.firstName ? "firstName-error" : undefined}
                                        />
                                        {renderFieldError("firstName")}
                                    </div>
                                    <div className={styles.field}>
                                        <label htmlFor="lastName">Last name</label>
                                        <input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            autoComplete="family-name"
                                            maxLength={50}
                                            required
                                            value={values.lastName}
                                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                                updateValue("lastName", event.target.value)
                                            }
                                            aria-invalid={Boolean(errors.lastName)}
                                            aria-describedby={errors.lastName ? "lastName-error" : undefined}
                                        />
                                        {renderFieldError("lastName")}
                                    </div>
                                    <button className={styles.primaryButton} type="submit">
                                        Continue
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className={styles.field}>
                                        <label htmlFor="email">Email address</label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            maxLength={254}
                                            required
                                            value={values.email}
                                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                                updateValue("email", event.target.value)
                                            }
                                            aria-invalid={Boolean(errors.email)}
                                            aria-describedby={errors.email ? "email-error" : undefined}
                                        />
                                        {renderFieldError("email")}
                                    </div>
                                    <div className={styles.field}>
                                        <label htmlFor="password">Password</label>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            minLength={8}
                                            maxLength={128}
                                            required
                                            value={values.password}
                                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                                updateValue("password", event.target.value)
                                            }
                                            aria-invalid={Boolean(errors.password)}
                                            aria-describedby={errors.password ? "password-error" : undefined}
                                        />
                                        {renderFieldError("password")}
                                    </div>
                                    <div className={styles.actions}>
                                        <button
                                            className={styles.backButton}
                                            type="button"
                                            onClick={() => setStep(1)}
                                            disabled={submitting}
                                        >
                                            Back
                                        </button>
                                        <button
                                            className={styles.primaryButton}
                                            type="submit"
                                            disabled={submitting}
                                        >
                                            {submitting ? "Signing in…" : "Sign in"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    </>
                )}

                {apiError && (
                    <p className={styles.apiError} role="alert">
                        {apiError}
                    </p>
                )}
            </section>
            <ToastContainer position="top-right" autoClose={3000} />
        </main>
    );
}
