import React from "react";
export const metadata = {
  title: "Canin epanoui",
  description:
    "Mettez en relation propriétaires de chiens et maîtres canins qualifiés. Education, promenade éducative, : trouvez le service idéal pour votre chien en toute confiance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta name="description" content={metadata.description} />

        <meta
          property="og:image"
          content="https://caninepanoui.vercel.app/_next/image?url=%2Fimages%2Fblob.png&w=640&q=75"
        />
        <meta property="og:url" content="https://caninepanoui.vercel.app" />
        <meta property="og:type" content="website" />
        <title>{metadata.title}</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
