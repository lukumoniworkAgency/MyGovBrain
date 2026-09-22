export type Database = {
  public: {
    Tables: {
      languages: {
        Row: { id: string; code: string; name: string; native_name: string; direction: string; status: string; sort_order: number; created_at: string; updated_at: string };
        Insert: Partial<Database["public"]["Tables"]["languages"]["Row"]> & Pick<Database["public"]["Tables"]["languages"]["Row"], "code" | "name" | "native_name">;
        Update: Partial<Database["public"]["Tables"]["languages"]["Row"]>;
      };
    };
  };
};
