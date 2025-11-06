export type InputType = 'comment' | 'appLink';

export interface RequestComentariosScraping{ 
  playstore_url: string,
  max_reviews: number,
  max_rating: number,
  criterios_busqueda: "recientes" | "relevantes",
  multiclass_model: 'beto' | 'robertuito'
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

// Interface para la generación de PDF
export interface PDFGenerationRequest {
    app_id: string;
    fecha_generacion: string;
    total_comentarios_analizados: number;
    requisitos: Requisito[];
    resumen: Resumen;
}
