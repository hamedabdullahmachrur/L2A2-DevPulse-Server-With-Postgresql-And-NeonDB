export type UserRole = 'contributor' | "maintainer"
export interface SignupBody {
    name: string,
    email: string,
    password: string,
    role: string
}
export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    created_at: Date;
    updated_at: Date;
}
export type SafeUser = Omit<User, 'password'>