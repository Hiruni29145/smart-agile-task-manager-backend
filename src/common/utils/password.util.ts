import * as bcrypt from 'bcrypt';

const DEFAULT_SALT_ROUNDS = 10;

/**
 * Hash a password with bcrypt
 * @param password - Plain text password
 * @param saltRounds - Number of salt rounds (optional, defaults to 10)
 */
export async function hashPassword(
    password: string,
    saltRounds?: number | string,
): Promise<string> {
    let rounds: number;

    if (typeof saltRounds === 'string') {
        rounds = Number.parseInt(saltRounds, 10);
    } else if (typeof saltRounds === 'number') {
        rounds = saltRounds;
    } else {
        rounds = DEFAULT_SALT_ROUNDS;
    }

    if (isNaN(rounds) || rounds < 1 || rounds > 31) {
        rounds = DEFAULT_SALT_ROUNDS;
    }

    return bcrypt.hash(password, rounds);
}

export async function comparePassword(
    password: string,
    hashedPassword: string,
): Promise<boolean> {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        return false;
    }
}

export function isPasswordStrong(password: string): boolean {
    const strongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
}
