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
      alocacoes_talhao: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          id: string
          maquinario_id: string | null
          status: string | null
          talhao_id: string
          trabalhador_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          descricao?: string | null
          id?: string
          maquinario_id?: string | null
          status?: string | null
          talhao_id: string
          trabalhador_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          id?: string
          maquinario_id?: string | null
          status?: string | null
          talhao_id?: string
          trabalhador_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alocacoes_talhao_maquinario_id_fkey"
            columns: ["maquinario_id"]
            isOneToOne: false
            referencedRelation: "maquinarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alocacoes_talhao_talhao_id_fkey"
            columns: ["talhao_id"]
            isOneToOne: false
            referencedRelation: "talhoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alocacoes_talhao_trabalhador_id_fkey"
            columns: ["trabalhador_id"]
            isOneToOne: false
            referencedRelation: "trabalhadores"
            referencedColumns: ["id"]
          },
        ]
      }
      atividades: {
        Row: {
          created_at: string
          descricao: string
          entidade_id: string
          entidade_tipo: string
          id: string
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descricao: string
          entidade_id: string
          entidade_tipo: string
          id?: string
          tipo: string
          user_id: string
        }
        Update: {
          created_at?: string
          descricao?: string
          entidade_id?: string
          entidade_tipo?: string
          id?: string
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      fazendas: {
        Row: {
          area_total: number | null
          created_at: string
          data_aquisicao: string | null
          descricao: string | null
          id: string
          localizacao: string | null
          nome: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area_total?: number | null
          created_at?: string
          data_aquisicao?: string | null
          descricao?: string | null
          id?: string
          localizacao?: string | null
          nome: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area_total?: number | null
          created_at?: string
          data_aquisicao?: string | null
          descricao?: string | null
          id?: string
          localizacao?: string | null
          nome?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      maquinarios: {
        Row: {
          ano: number | null
          created_at: string
          fabricante: string | null
          fazenda_id: string
          id: string
          modelo: string | null
          nome: string
          notas: string | null
          numero_serie: string | null
          proxima_manutencao: string | null
          status: string | null
          tipo: string
          ultima_manutencao: string | null
          updated_at: string
        }
        Insert: {
          ano?: number | null
          created_at?: string
          fabricante?: string | null
          fazenda_id: string
          id?: string
          modelo?: string | null
          nome: string
          notas?: string | null
          numero_serie?: string | null
          proxima_manutencao?: string | null
          status?: string | null
          tipo: string
          ultima_manutencao?: string | null
          updated_at?: string
        }
        Update: {
          ano?: number | null
          created_at?: string
          fabricante?: string | null
          fazenda_id?: string
          id?: string
          modelo?: string | null
          nome?: string
          notas?: string | null
          numero_serie?: string | null
          proxima_manutencao?: string | null
          status?: string | null
          tipo?: string
          ultima_manutencao?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maquinarios_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cargo: string | null
          created_at: string
          id: string
          nome: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          id: string
          nome?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          id?: string
          nome?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      talhoes: {
        Row: {
          area_hectare: number
          coordenadas: string | null
          created_at: string
          cultivo_atual: string | null
          data_plantio: string | null
          fazenda_id: string
          id: string
          nome: string
          previsao_colheita: string | null
          sistema_irrigacao: string | null
          tipo_solo: string | null
          updated_at: string
        }
        Insert: {
          area_hectare: number
          coordenadas?: string | null
          created_at?: string
          cultivo_atual?: string | null
          data_plantio?: string | null
          fazenda_id: string
          id?: string
          nome: string
          previsao_colheita?: string | null
          sistema_irrigacao?: string | null
          tipo_solo?: string | null
          updated_at?: string
        }
        Update: {
          area_hectare?: number
          coordenadas?: string | null
          created_at?: string
          cultivo_atual?: string | null
          data_plantio?: string | null
          fazenda_id?: string
          id?: string
          nome?: string
          previsao_colheita?: string | null
          sistema_irrigacao?: string | null
          tipo_solo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "talhoes_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
        ]
      }
      trabalhadores: {
        Row: {
          cargo: string
          contato: string | null
          created_at: string
          data_contratacao: string | null
          fazenda_id: string
          id: string
          nome: string
          notas: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          cargo: string
          contato?: string | null
          created_at?: string
          data_contratacao?: string | null
          fazenda_id: string
          id?: string
          nome: string
          notas?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          cargo?: string
          contato?: string | null
          created_at?: string
          data_contratacao?: string | null
          fazenda_id?: string
          id?: string
          nome?: string
          notas?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trabalhadores_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
