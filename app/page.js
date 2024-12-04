import MediaCard from "./connexion/page";
import MediaInscription from "./inscription/page";

import "./global.css";
export default function Home() {
  return (
    <main height="100%">
      <div className="body">
        <MediaCard>
          <MediaInscription />
        </MediaCard>
      </div>
    </main>
  );
}
