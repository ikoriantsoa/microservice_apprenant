export interface ICreateWebinaire {
  keycloak_id_auteur: string;
  titre: string;
  categorie: string;
  type: string;
  niveau: string;
  image: string;
  source: string;
}

export interface TCreateWebinaire {
  keycloak_id_auteur: string;
  titre: string;
  categorie: string;
  type: string;
  niveau: string;
  image: Express.Multer.File;
  source: Express.Multer.File;
}
