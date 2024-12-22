import { useEffect } from "react";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Initialisation de Google Analytics
    const handleRouteChange = (url) => {
      window.gtag("config", "G-274LZXS5W8", {
        page_path: url,
      });
    };

    // Chargement du script Google Analytics
    const script1 = document.createElement("script");
    script1.src = "https://www.googletagmanager.com/gtag/js?id=G-D59W60T63Z";
    script1.async = true;
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-D59W60T63Z');
    `;
    document.head.appendChild(script2);

    // Suivi des changements de page
    const handleRouteComplete = (url) => handleRouteChange(url);
    window.addEventListener("routeChangeComplete", handleRouteComplete);

    return () => {
      window.removeEventListener("routeChangeComplete", handleRouteComplete);
    };
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
