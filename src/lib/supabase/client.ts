import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  let client: ReturnType<typeof createBrowserClient> | null = null;

  return new Proxy({} as ReturnType<typeof createBrowserClient>, {
    get(_, prop) {
      if (!client) {
        client = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
      }
      return Reflect.get(client, prop, client);
    },
  });
};
