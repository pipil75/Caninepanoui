import Script from "next/script";

function MyApp({ Component, pageProps }) {
  return (
    <>
      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=G-D59W60T63Z`}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-D59W60T63Z');
        `}
      </Script>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
