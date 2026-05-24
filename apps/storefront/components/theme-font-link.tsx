import { googleFontsStylesheetUrl } from "@nexora/themes";

type Props = {
  fontFamily: string;
};

export function ThemeFontLink({ fontFamily }: Props) {
  const href = googleFontsStylesheetUrl(fontFamily);
  if (!href) return null;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="stylesheet" href={href} />
    </>
  );
}
