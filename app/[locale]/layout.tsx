import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { SiteShell } from "@/components/site-shell";

export default async function LocaleLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <SiteShell>{children}</SiteShell>
    </NextIntlClientProvider>
  );
}
