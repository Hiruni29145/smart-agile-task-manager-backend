/**
 * Generates a URL-friendly slug from a title string.
 * @param title - The title to convert to a slug
 * @returns A lowercase, hyphenated slug
 */
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Generates a unique slug by appending a counter if the base slug already exists.
 * @param title - The title to convert to a slug
 * @param checkExists - Function to check if a slug exists in the database
 * @returns A unique slug
 */
export async function generateUniqueSlug(
    title: string,
    checkExists: (slug: string) => Promise<boolean>,
): Promise<string> {
    let slug = generateSlug(title);
    let count = 1;
    const originalSlug = slug;

    while (await checkExists(slug)) {
        slug = `${originalSlug}-${count}`;
        count++;
    }

    return slug;
}
