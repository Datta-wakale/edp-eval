
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { RegisterUser } from "@site/src/RegisterApi";
import styles from "./styles.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


interface User {
    Uname: string;
    email: string;
    phone: string;
    password: string;
    cnfmPassword: string;
}

type UserErrors = Partial<Record<keyof User, string>>;

export default function Register() {
    const [user, setUser] = useState<User>({
        Uname: "",
        email: "",
        phone: "",
        password: "",
        cnfmPassword: "",
    });

    const [error, setError] = useState<UserErrors>({});
    const [success, setSuccess] = useState("");
    const [apiError, setApiError] = useState("");
    const [loading, setLoading] = useState(false);

    // Handle input changes
    const userData = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setUser((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError((prev) => ({
            ...prev,
            [name]: "",
        }));

        setSuccess("");
        setApiError("");
    };

    // Validate and register the user
    const registerUser = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors: UserErrors = {};

        if (!user.Uname.trim()) {
            newErrors.Uname = "Username cannot be empty";
        }

        if (!user.email.trim()) {
            newErrors.email = "Email cannot be empty";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)
        ) {
            newErrors.email = "Enter a valid email address";
        }

        if (!user.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\d{10}$/.test(user.phone)) {
            newErrors.phone = "Enter a valid 10-digit phone number";
        }

        if (!user.password) {
            newErrors.password = "Password is required";
        } else if (user.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!user.cnfmPassword) {
            newErrors.cnfmPassword = "Please confirm your password";
        } else if (user.password !== user.cnfmPassword) {
            newErrors.cnfmPassword = "Passwords do not match";
        }

        setError(newErrors);
        setSuccess("");
        setApiError("");

        // Stop when validation errors exist
        if (Object.keys(newErrors).length > 0) {
            return;
        }

        try {
            setLoading(true);

            // Do not send confirm password to the API
            const { cnfmPassword, ...registerData } = user;

            await RegisterUser(registerData);
            toast.success("Registration successful!");
            // setSuccess("Registration successful!");

            setUser({
                Uname: "",
                email: "",
                phone: "",
                password: "",
                cnfmPassword: "",
            });

            setError({});
        } catch (err) {
            setApiError(
                err instanceof Error
                    ? err.message
                    : "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`container ${styles.formcontainer}`}>
            <div className={styles.formcard}>
                <div className={styles.formheader}>
                    <h1 className={styles.formtitle}>Create Account</h1>
                    <p className={styles.formsubtitle}>
                        Fill in your details to register.
                    </p>
                </div>

                <form onSubmit={registerUser} noValidate>
                    <div className={styles.formgroup}>
                        <label
                            className="margin-bottom--xs"
                            htmlFor="Uname"
                        >
                            Username
                        </label>
                        <input
                            className={`input ${styles.forminput} ${
                                error.Uname ? styles.inputerror : ""
                            }`}
                            type="text"
                            id="Uname"
                            name="Uname"
                            placeholder="Enter your username"
                            value={user.Uname}
                            onChange={userData}
                            aria-invalid={!!error.Uname}
                            aria-describedby={
                                error.Uname ? "Uname-error" : undefined
                            }
                        />
                        {error.Uname && (
                            <p
                                id="Uname-error"
                                className={styles.errormessage}
                                role="alert"
                            >
                                {error.Uname}
                            </p>
                        )}
                    </div>

                    <div className={styles.formgroup}>
                        <label
                            className="margin-bottom--xs"
                            htmlFor="email"
                        >
                            Email Address
                        </label>
                        <input
                            className={`input ${styles.forminput} ${
                                error.email ? styles.inputerror : ""
                            }`}
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            value={user.email}
                            onChange={userData}
                            aria-invalid={!!error.email}
                            aria-describedby={
                                error.email ? "email-error" : undefined
                            }
                        />
                        {error.email && (
                            <p
                                id="email-error"
                                className={styles.errormessage}
                                role="alert"
                            >
                                {error.email}
                            </p>
                        )}
                    </div>

                    <div className={styles.formgroup}>
                        <label
                            className="margin-bottom--xs"
                            htmlFor="phone"
                        >
                            Phone Number
                        </label>
                        <input
                            className={`input ${styles.forminput} ${
                                error.phone ? styles.inputerror : ""
                            }`}
                            type="tel"
                            id="phone"
                            name="phone"
                            placeholder="Enter your 10-digit phone number"
                            value={user.phone}
                            onChange={userData}
                            aria-invalid={!!error.phone}
                            aria-describedby={
                                error.phone ? "phone-error" : undefined
                            }
                        />
                        {error.phone && (
                            <p
                                id="phone-error"
                                className={styles.errormessage}
                                role="alert"
                            >
                                {error.phone}
                            </p>
                        )}
                    </div>

                    <div className={styles.formgroup}>
                        <label
                            className="margin-bottom--xs"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <input
                            className={`input ${styles.forminput} ${
                                error.password ? styles.inputerror : ""
                            }`}
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            value={user.password}
                            onChange={userData}
                            aria-invalid={!!error.password}
                            aria-describedby={
                                error.password ? "password-error" : undefined
                            }
                        />
                        {error.password && (
                            <p
                                id="password-error"
                                className={styles.errormessage}
                                role="alert"
                            >
                                {error.password}
                            </p>
                        )}
                    </div>

                    <div className={styles.formgroup}>
                        <label
                            className="margin-bottom--xs"
                            htmlFor="cnfmPassword"
                        >
                            Confirm Password
                        </label>
                        <input
                            className={`input ${styles.forminput} ${
                                error.cnfmPassword ? styles.inputerror : ""
                            }`}
                            type="password"
                            id="cnfmPassword"
                            name="cnfmPassword"
                            placeholder="Re-enter your password"
                            value={user.cnfmPassword}
                            onChange={userData}
                            aria-invalid={!!error.cnfmPassword}
                            aria-describedby={
                                error.cnfmPassword
                                    ? "cnfmPassword-error"
                                    : undefined
                            }
                        />
                        {error.cnfmPassword && (
                            <p
                                id="cnfmPassword-error"
                                className={styles.errormessage}
                                role="alert"
                            >
                                {error.cnfmPassword}
                            </p>
                        )}
                    </div>

                    {apiError && (
                        <div className={styles.alertError} role="alert">
                            {apiError}
                        </div>
                    )}

                    {success && (
                        <div className={styles.alertSuccess} role="status">
                            {success}
                        </div>
                    )}

                    <button
                        className={`button button--primary button--block ${styles.submitbutton}`}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Create Account"}
                    </button>
                </form>
            </div>
        </div>
    );
}
