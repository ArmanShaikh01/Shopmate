export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            shops: {
                Row: {
                    id: string
                    name: string
                    // ... other columns
                }
                Insert: {
                    id?: string
                    name: string
                    // ...
                }
                Update: {
                    id?: string
                    name?: string
                    // ...
                }
            }
            profiles: {
                Row: {
                    id: string
                    role: 'shopkeeper' | 'customer'
                }
                Insert: {
                    id: string
                    role?: 'shopkeeper' | 'customer'
                }
                Update: {
                    id?: string
                    role?: 'shopkeeper' | 'customer'
                }
            }
            // Placeholder: In a real scenario, we'd generate this using supabase gen types
        }
    }
}
