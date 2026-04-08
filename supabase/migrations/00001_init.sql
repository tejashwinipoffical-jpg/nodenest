-- Schema for CodeDuel Arena (Custom Table Auth Mode)

-- Profiles Table (Standalone)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    password TEXT, -- Custom Table Auth (No Email Check)
    avatar TEXT DEFAULT '👤',
    rating INTEGER DEFAULT 1200,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    preferred_language TEXT DEFAULT 'javascript',
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Problems Table
CREATE TABLE public.problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    topic TEXT NOT NULL,
    statement TEXT NOT NULL,
    input_format TEXT,
    output_format TEXT,
    constraints_text TEXT,
    examples JSONB, -- Array of { input, output, explanation }
    hidden_test_cases JSONB, -- Array of { input, expected_output }
    supported_languages JSONB DEFAULT '["javascript", "python"]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Duel Rooms Table
CREATE TABLE public.duel_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code TEXT UNIQUE,
    status TEXT DEFAULT 'waiting', -- waiting, active, finished
    problem_id UUID REFERENCES public.problems(id),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Match Results Table
CREATE TABLE public.match_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.duel_rooms(id),
    winner_id UUID REFERENCES public.profiles(id),
    loser_id UUID REFERENCES public.profiles(id),
    winner_score INTEGER,
    loser_score INTEGER,
    win_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Open Mode)
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles can be created by anyone" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Profiles can be updated by anyone" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Problems are viewable by everyone" ON public.problems FOR SELECT USING (true);
CREATE POLICY "Duel rooms are viewable by everyone" ON public.duel_rooms FOR SELECT USING (true);
CREATE POLICY "Match results are viewable by everyone" ON public.match_results FOR SELECT USING (true);

-- Insert Mock Problem for fallback mode
INSERT INTO public.problems (title, difficulty, topic, statement, input_format, output_format, constraints_text, examples, hidden_test_cases)
VALUES (
    'Reverse a String Array',
    'Easy',
    'Arrays',
    'Write a function that takes an array of strings and returns a new array with the strings in reverse order.',
    'An array of strings `arr`.',
    'An array of strings.',
    'Array length between 1 and 1000.',
    '[{"input": "[\"apple\", \"banana\", \"cherry\"]", "output": "[\"cherry\", \"banana\", \"apple\"]", "explanation": "The order of items is reversed."}]'::jsonb,
    '[{"input": "[\"a\", \"b\"]", "expected_output": "[\"b\", \"a\"]"}, {"input": "[]", "expected_output": "[]"}]'::jsonb
);
