export interface ResponseComentarioUnico {
    success:      boolean;
    es_relevante: boolean;
    mensaje:      string;
    comentario:   string;
    calificacion: number;
    categoria:    string;
    confianza:    number;
    requisito:    Requisito | null;
    error:        null;
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

export interface RequestComentarioUnico {
    comentario: string;
    clasificacion?: number;
    multiclass_model: 'beto' | 'robertuito';
}
