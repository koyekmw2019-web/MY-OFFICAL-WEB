declare const Netlify: { env: { get(name: string): string | undefined } };
export const env = (name: string) => Netlify.env.get(name);
