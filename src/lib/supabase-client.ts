import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Candidate {
    id: string;
    name: string;
    email: string;
    linkedin_url?: string;
    skills: string[];
    experience_years: number;
    location: string;
    status: 'new' | 'contacted' | 'responded' | 'interviewed' | 'hired' | 'rejected';
    score: number;
    created_at: string;
    updated_at: string;
}

export interface Company {
    id: string;
    name: string;
    industry: string;
    size: string;
    culture_keywords: string[];
    tech_stack: string[];
    created_at: string;
}

export interface AgentActivity {
    id: string;
    agent_name: string;
    action_type: string;
    target_id?: string;
    result: any;
    cost: number;
    created_at: string;
}

export interface Message {
    id: string;
    candidate_id: string;
    template_id?: string;
    content: string;
    personalization_score: number;
    response_received: boolean;
    sent_at: string;
} 