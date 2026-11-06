
---
title: User Registration
description: Registration form implementation, validation, and API integration using React and TypeScript in Docusaurus.
---

# User Registration Form

## Overview

The User Registration Form allows new users to create an account by providing their personal details and password.

This form is implemented using **React, TypeScript, and the React `useState` hook**. It includes client-side validation to ensure that the entered information meets the required conditions before submitting the registration request to the backend API.

The registration component is embedded below so that you can test its behavior directly from this documentation page.

## Objectives

After exploring this example, you will understand how to:

- Manage form inputs using React state.
- Handle multiple input fields with a single event handler.
- Validate user input before submission.
- Display individual error messages for each field.
- Verify that the password and confirmation password match.
- Submit valid registration data to a backend API.
- Handle successful registration and API errors.

## Registration Form

The following component renders the registration form.

import Register from '@site/src/components/Register';

<Register />

## Form Fields

The registration form contains the following fields:

| Field | Description | Validation |
|---|---|---|
| Username | Name of the user | Required |
| Email | User's email address | Required and valid email format |
| Phone | User's phone number | Required and exactly 10 digits |
| Password | Account password | Required and at least 6 characters |
| Confirm Password | Confirms the entered password | Required and must match the password |

## Form State Management

The component uses the React `useState` hook to store the values entered into the form.

The initial state is defined as follows:

```tsx
const [user, setUser] = useState<User>({
    Uname: "",
    email: "",
    phone: "",
    password: "",
    cnfmPassword: "",
});
```

Each property represents an input field. When a user enters a value, the state is updated without replacing the other fields.

### Handling Input Changes

A single event handler manages all input fields:

```tsx
const userData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setUser((prev) => ({
        ...prev,
        [name]: value,
    }));
};
```

The `name` attribute identifies which property should be updated, while `value` contains the current input value.

The spread operator (`...prev`) preserves the other properties in the state object.

## Form Validation

Before submitting the form, the component validates every field and collects any validation errors in an object.

For example:

```tsx
const newErrors: UserErrors = {};

if (!user.Uname.trim()) {
    newErrors.Uname = "Username cannot be empty";
}

if (!user.email.trim()) {
    newErrors.email = "Email cannot be empty";
}
```

The component uses the `UserErrors` type to associate each field with its own error message.

```tsx
type UserErrors = Partial<Record<keyof User, string>>;
```

### Password Confirmation

The confirmation password is checked against the original password.

```tsx
if (!user.cnfmPassword) {
    newErrors.cnfmPassword = "Please confirm your password";
} else if (user.password !== user.cnfmPassword) {
    newErrors.cnfmPassword = "Both passwords should match";
}
```

This ensures that registration cannot proceed when the confirmation field is empty or the passwords differ.

## Preventing Invalid Submissions

After validating all fields, the component updates the error state:

```tsx
setError(newErrors);
```

It then checks whether any errors exist:

```tsx
if (Object.keys(newErrors).length > 0) {
    return;
}
```

If the error object contains one or more properties, the function returns immediately and the API request is not executed.

If no validation errors exist, the registration process continues.

## API Integration

The registration component imports the API function from the project source:

```tsx
import { RegisterUser } from '@site/src/RegisterApi';
```

Once validation succeeds, the confirmation password is removed before sending the request:

```tsx
const { cnfmPassword, ...registerData } = user;

await RegisterUser(registerData);
```

The API receives the username, email, phone number, and password. The confirmation password is used only for frontend validation and is not included in the request.

The request is wrapped in a `try/catch` block to handle API failures and display appropriate feedback.

## Testing Checklist

Use the embedded form above to test the following scenarios.

- [ ] Submit the form with every field empty.
- [ ] Enter an invalid email address.
- [ ] Enter a phone number containing fewer than 10 digits.
- [ ] Enter a password shorter than 6 characters.
- [ ] Enter different values in the password and confirmation fields.
- [ ] Submit the form with all fields valid.
- [ ] Verify that the API receives the correct registration data.
- [ ] Verify that success and error messages are displayed appropriately.

## Important Notes

- Client-side validation improves the user experience but does not replace backend validation.
- Passwords should be securely hashed on the server before being stored.
- The backend should validate all submitted values independently.
- The registration API should return meaningful responses for successful requests and failures.
- The `Register` component must be exported as the default export from the file being imported.

## Summary

This example demonstrates how to integrate a reusable React registration component into Docusaurus documentation using MDX. It combines controlled inputs, TypeScript types, field-level validation, password confirmation, and asynchronous API integration in one form.
