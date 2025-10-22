export interface RequestComentariosScraping{ 
  playstore_url: string,
  max_reviews: number,
  max_rating: number
}
export interface ResponseComentariosScraping {
    success:       boolean;
    app_id:        string;
    total_reviews: number;
    reviews?:       Review[];
    stats:         Stats;
    requirements:  Requirements;
}

export interface Requirements {
    requisitos:   Requisito[];
    resumen:      Resumen;
    error:        string;
    raw_response: string;
}

export interface Requisito {
    id:                       string;
    categoria:                string;
    requisito:                string;
    prioridad:                string;
    justificacion:            string;
    criterios_aceptacion:     string[];
    comentarios_relacionados: number;
}

export interface Resumen {
    total_requisitos: number;
    por_categoria:    Stats;
    prioridad_alta:   number;
    prioridad_media:  number;
    prioridad_baja:   number;
}

export interface Stats {
    additionalProp1: AdditionalProp1;
}

export interface AdditionalProp1 {
}

export interface Review {
    id_original:  string;
    comentario:   string;
    calificacion: number;
    fecha:        string;
    usuario:      string;
    categoria:    string;
    confianza:    number;
}
