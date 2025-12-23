export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alertas: {
        Row: {
          contenido_mensaje: string
          conversacion_id: string | null
          created_at: string
          id: string
          mensaje_id: string | null
          moderador_id: string | null
          notas_moderador: string | null
          revisada: boolean | null
          tipo: string
        }
        Insert: {
          contenido_mensaje: string
          conversacion_id?: string | null
          created_at?: string
          id?: string
          mensaje_id?: string | null
          moderador_id?: string | null
          notas_moderador?: string | null
          revisada?: boolean | null
          tipo: string
        }
        Update: {
          contenido_mensaje?: string
          conversacion_id?: string | null
          created_at?: string
          id?: string
          mensaje_id?: string | null
          moderador_id?: string | null
          notas_moderador?: string | null
          revisada?: boolean | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertas_conversacion_id_fkey"
            columns: ["conversacion_id"]
            isOneToOne: false
            referencedRelation: "conversaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_mensaje_id_fkey"
            columns: ["mensaje_id"]
            isOneToOne: false
            referencedRelation: "mensajes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_moderador_id_fkey"
            columns: ["moderador_id"]
            isOneToOne: false
            referencedRelation: "moderadores"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracion: {
        Row: {
          clave: string
          descripcion: string | null
          id: string
          updated_at: string
          valor: Json
        }
        Insert: {
          clave: string
          descripcion?: string | null
          id?: string
          updated_at?: string
          valor: Json
        }
        Update: {
          clave?: string
          descripcion?: string | null
          id?: string
          updated_at?: string
          valor?: Json
        }
        Relationships: []
      }
      contenido_doctrinal: {
        Row: {
          activo: boolean
          categoria: string
          contenido: string
          created_at: string
          id: string
          tags: string[] | null
          titulo: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          categoria: string
          contenido: string
          created_at?: string
          id?: string
          tags?: string[] | null
          titulo: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          categoria?: string
          contenido?: string
          created_at?: string
          id?: string
          tags?: string[] | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversaciones: {
        Row: {
          activa: boolean
          created_at: string
          id: string
          titulo: string | null
          updated_at: string
          usuario_id: string
        }
        Insert: {
          activa?: boolean
          created_at?: string
          id?: string
          titulo?: string | null
          updated_at?: string
          usuario_id: string
        }
        Update: {
          activa?: boolean
          created_at?: string
          id?: string
          titulo?: string | null
          updated_at?: string
          usuario_id?: string
        }
        Relationships: []
      }
      diario_oracion: {
        Row: {
          id: string
          usuario_id: string
          titulo: string | null
          contenido: string
          respondida: boolean | null
          fecha_respuesta: string | null
          created_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          titulo?: string | null
          contenido: string
          respondida?: boolean | null
          fecha_respuesta?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          titulo?: string | null
          contenido?: string
          respondida?: boolean | null
          fecha_respuesta?: string | null
          created_at?: string
        }
        Relationships: []
      }
      entrenamiento: {
        Row: {
          id: string
          categoria: string | null
          pregunta: string
          respuesta: string
          embedding: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          categoria?: string | null
          pregunta: string
          respuesta: string
          embedding?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          categoria?: string | null
          pregunta?: string
          respuesta?: string
          embedding?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      estadisticas: {
        Row: {
          alertas_activadas: number | null
          conversaciones_total: number | null
          created_at: string
          fecha: string
          id: string
          mensajes_total: number | null
          temas_consultados: Json | null
        }
        Insert: {
          alertas_activadas?: number | null
          conversaciones_total?: number | null
          created_at?: string
          fecha?: string
          id?: string
          mensajes_total?: number | null
          temas_consultados?: Json | null
        }
        Update: {
          alertas_activadas?: number | null
          conversaciones_total?: number | null
          created_at?: string
          fecha?: string
          id?: string
          mensajes_total?: number | null
          temas_consultados?: Json | null
        }
        Relationships: []
      }
      mensajes: {
        Row: {
          contenido: string
          contiene_alerta: boolean | null
          conversacion_id: string | null
          created_at: string
          es_usuario: boolean
          id: string
          tipo_alerta: string | null
        }
        Insert: {
          contenido: string
          contiene_alerta?: boolean | null
          conversacion_id?: string | null
          created_at?: string
          es_usuario: boolean
          id?: string
          tipo_alerta?: string | null
        }
        Update: {
          contenido?: string
          contiene_alerta?: boolean | null
          conversacion_id?: string | null
          created_at?: string
          es_usuario?: boolean
          id?: string
          tipo_alerta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensajes_conversacion_id_fkey"
            columns: ["conversacion_id"]
            isOneToOne: false
            referencedRelation: "conversaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      moderadores: {
        Row: {
          activo: boolean
          created_at: string
          email: string
          id: string
          nombre: string
          rol: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          email: string
          id?: string
          nombre: string
          rol?: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          email?: string
          id?: string
          nombre?: string
          rol?: string
          updated_at?: string
        }
        Relationships: []
      }
      perfiles: {
        Row: {
          id: string
          rol: string | null
          created_at: string
          email: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          rol?: string | null
          created_at?: string
          email?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          rol?: string | null
          created_at?: string
          email?: string | null
          avatar_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
