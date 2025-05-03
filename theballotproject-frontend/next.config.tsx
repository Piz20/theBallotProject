import { GetServerSideProps } from "next";
import fs from "fs";
import path from "path";

interface HomeProps {
  homeContent: string;
}

const HomePage = ({ homeContent }: HomeProps) => {
  return (
    <div dangerouslySetInnerHTML={{ __html: homeContent }} />
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  // Récupérer le chemin du fichier home.html
  const filePath = path.join(process.cwd(), "public", "home.html");
  
  // Vérifier si le fichier existe
  if (!fs.existsSync(filePath)) {
    return {
      notFound: true, // Si le fichier n'existe pas, retourner une page 404
    };
  }

  // Lire le contenu du fichier
  const homeContent = fs.readFileSync(filePath, "utf-8");

  return {
    props: {
      homeContent,
    },
  };
};

export default HomePage;
