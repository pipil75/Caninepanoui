import { useEffect } from "react";
import { GoogleAnalytics } from "nextjs-google-analytics";
import { useEffect } from "react";
import { useRouter } from "next/router";

const GA_TRACKING_ID = "G-274LZXS5W8"; // Votre vrai ID Google Analytics

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Initialisation de Google Analytics
    const handleRouteChange = (url) => {
      window.gtag("config", GA_TRACKING_ID, {
        page_path: url,
      });
    };

    // Chargement des scripts Google Analytics
    const script1 = document.createElement("script");
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    script1.async = true;
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_TRACKING_ID}');
    `;
    document.head.appendChild(script2);

    // Suivi des changements de route avec Next.js Router
    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return <Component {...pageProps} />;
}

export default MyApp;
