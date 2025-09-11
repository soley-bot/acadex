\-- WARNING: This schema is for context only and is not meant to be run.

\-- Table order and constraints may not be valid for execution.

CREATE TABLE public.adaptive\_quiz\_settings (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  quiz\_id uuid UNIQUE,

  enabled boolean DEFAULT false,

  difficulty\_adjustment boolean DEFAULT true,

  min\_questions integer DEFAULT 5,

  max\_questions integer DEFAULT 20,

  target\_accuracy numeric DEFAULT 0.7,

  stopping\_criteria jsonb DEFAULT '{"confidence": 0.95, "standard\_error": 0.3}'::jsonb,

  item\_selection\_algorithm character varying DEFAULT 'maximum\_information'::character varying,

  theta\_estimation\_method character varying DEFAULT 'maximum\_likelihood'::character varying,

  metadata jsonb DEFAULT '{}'::jsonb,

  created\_at timestamp with time zone DEFAULT now(),

  updated\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT adaptive\_quiz\_settings\_pkey PRIMARY KEY (id),

  CONSTRAINT adaptive\_quiz\_settings\_quiz\_id\_fkey FOREIGN KEY (quiz\_id) REFERENCES public.quizzes(id)

);

CREATE TABLE public.admin\_activity\_logs (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  admin\_user\_id uuid NOT NULL,

  action text NOT NULL,

  resource\_type text NOT NULL,

  resource\_id uuid NOT NULL,

  old\_values jsonb,

  new\_values jsonb,

  ip\_address inet,

  user\_agent text,

  created\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT admin\_activity\_logs\_pkey PRIMARY KEY (id),

  CONSTRAINT admin\_activity\_logs\_admin\_user\_id\_fkey FOREIGN KEY (admin\_user\_id) REFERENCES public.users(id)

);

CREATE TABLE public.badges (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  name character varying NOT NULL UNIQUE,

  description text,

  icon\_url character varying,

  criteria jsonb NOT NULL,

  points integer DEFAULT 0,

  rarity USER-DEFINED DEFAULT 'common'::badge\_rarity,

  category character varying,

  is\_active boolean DEFAULT true,

  auto\_award boolean DEFAULT true,

  metadata jsonb DEFAULT '{}'::jsonb,

  created\_at timestamp with time zone DEFAULT now(),

  updated\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT badges\_pkey PRIMARY KEY (id)

);

CREATE TABLE public.categories (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  name character varying NOT NULL UNIQUE,

  description text,

  color character varying DEFAULT '\#6366f1'::character varying,

  icon character varying,

  type character varying DEFAULT 'general'::character varying CHECK (type::text \= ANY (ARRAY\['general'::character varying, 'quiz'::character varying, 'course'::character varying\]::text\[\])),

  is\_active boolean DEFAULT true,

  created\_at timestamp with time zone DEFAULT now(),

  updated\_at timestamp with time zone DEFAULT now(),

  created\_by uuid,

  CONSTRAINT categories\_pkey PRIMARY KEY (id),

  CONSTRAINT categories\_created\_by\_fkey FOREIGN KEY (created\_by) REFERENCES auth.users(id)

);

CREATE TABLE public.certificates (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  user\_id uuid NOT NULL,

  course\_id uuid NOT NULL,

  certificate\_number text NOT NULL UNIQUE,

  issued\_at timestamp with time zone DEFAULT now(),

  expires\_at timestamp with time zone,

  pdf\_url text,

  is\_valid boolean DEFAULT true,

  CONSTRAINT certificates\_pkey PRIMARY KEY (id),

  CONSTRAINT certificates\_course\_id\_fkey FOREIGN KEY (course\_id) REFERENCES public.courses(id),

  CONSTRAINT certificates\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES public.users(id)

);

CREATE TABLE public.content\_reviews (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  content\_type character varying NOT NULL,

  content\_id uuid,

  title character varying NOT NULL,

  description text,

  generated\_by\_ai boolean DEFAULT true,

  ai\_model character varying,

  generation\_prompt text,

  raw\_ai\_response text,

  review\_status character varying DEFAULT 'pending'::character varying,

  priority character varying DEFAULT 'medium'::character varying,

  ai\_confidence\_score numeric DEFAULT 0.00,

  quality\_score numeric,

  validation\_issues jsonb DEFAULT '\[\]'::jsonb,

  reviewer\_notes text,

  auto\_corrected boolean DEFAULT false,

  corrected\_content text,

  language character varying DEFAULT 'english'::character varying,

  subject character varying,

  difficulty character varying,

  estimated\_review\_time integer DEFAULT 10,

  actual\_review\_time integer,

  created\_by uuid,

  reviewed\_by uuid,

  created\_at timestamp with time zone DEFAULT now(),

  updated\_at timestamp with time zone DEFAULT now(),

  reviewed\_at timestamp with time zone,

  approved\_at timestamp with time zone,

  CONSTRAINT content\_reviews\_pkey PRIMARY KEY (id),

  CONSTRAINT content\_reviews\_reviewed\_by\_fkey FOREIGN KEY (reviewed\_by) REFERENCES auth.users(id),

  CONSTRAINT content\_reviews\_created\_by\_fkey FOREIGN KEY (created\_by) REFERENCES auth.users(id)

);

CREATE TABLE public.course\_lessons (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  module\_id uuid NOT NULL,

  title text NOT NULL,

  description text,

  content text,

  video\_url text,

  duration\_minutes integer DEFAULT 0,

  order\_index integer NOT NULL,

  is\_published boolean DEFAULT false,

  is\_free\_preview boolean DEFAULT false,

  created\_at timestamp with time zone DEFAULT now(),

  updated\_at timestamp with time zone DEFAULT now(),

  duration character varying,

  is\_preview boolean DEFAULT false,

  course\_id uuid NOT NULL,

  quiz\_id uuid,

  CONSTRAINT course\_lessons\_pkey PRIMARY KEY (id),

  CONSTRAINT course\_lessons\_module\_id\_fkey FOREIGN KEY (module\_id) REFERENCES public.course\_modules(id),

  CONSTRAINT course\_lessons\_quiz\_id\_fkey FOREIGN KEY (quiz\_id) REFERENCES public.quizzes(id),

  CONSTRAINT course\_lessons\_course\_id\_fkey FOREIGN KEY (course\_id) REFERENCES public.courses(id)

);

CREATE TABLE public.course\_modules (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  course\_id uuid NOT NULL,

  title text NOT NULL,

  description text,

  order\_index integer NOT NULL,

  is\_published boolean DEFAULT false,

  created\_at timestamp with time zone DEFAULT now(),

  updated\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT course\_modules\_pkey PRIMARY KEY (id),

  CONSTRAINT course\_modules\_course\_id\_fkey FOREIGN KEY (course\_id) REFERENCES public.courses(id)

);

CREATE TABLE public.course\_resources (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  course\_id uuid,

  lesson\_id uuid,

  title text NOT NULL,

  description text,

  file\_url text NOT NULL,

  file\_type text NOT NULL,

  file\_size\_bytes bigint,

  is\_downloadable boolean DEFAULT true,

  created\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT course\_resources\_pkey PRIMARY KEY (id),

  CONSTRAINT course\_resources\_course\_id\_fkey FOREIGN KEY (course\_id) REFERENCES public.courses(id),

  CONSTRAINT course\_resources\_lesson\_id\_fkey FOREIGN KEY (lesson\_id) REFERENCES public.course\_lessons(id)

);

CREATE TABLE public.course\_reviews (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  course\_id uuid NOT NULL,

  user\_id uuid NOT NULL,

  rating integer NOT NULL CHECK (rating \>= 1 AND rating \<= 5),

  review\_text text,

  is\_verified\_purchase boolean DEFAULT false,

  is\_featured boolean DEFAULT false,

  created\_at timestamp with time zone DEFAULT now(),

  updated\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT course\_reviews\_pkey PRIMARY KEY (id),

  CONSTRAINT course\_reviews\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES public.users(id),

  CONSTRAINT course\_reviews\_course\_id\_fkey FOREIGN KEY (course\_id) REFERENCES public.courses(id)

);

CREATE TABLE public.courses (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  title text NOT NULL,

  description text NOT NULL,

  instructor\_id uuid NOT NULL,

  instructor\_name text NOT NULL,

  category text NOT NULL,

  level text DEFAULT 'beginner'::text CHECK (level \= ANY (ARRAY\['beginner'::text, 'intermediate'::text, 'advanced'::text\])),

  price numeric NOT NULL DEFAULT 0,

  duration text NOT NULL,

  image\_url text,

  rating numeric DEFAULT 0 CHECK (rating \>= 0::numeric AND rating \<= 5::numeric),

  student\_count integer DEFAULT 0,

  is\_published boolean DEFAULT false,

  created\_at timestamp with time zone DEFAULT now(),

  updated\_at timestamp with time zone DEFAULT now(),

  thumbnail\_url text,

  video\_preview\_url text,

  tags ARRAY,

  prerequisites ARRAY,

  learning\_objectives ARRAY,

  status text DEFAULT 'draft'::text CHECK (status \= ANY (ARRAY\['draft'::text, 'review'::text, 'published'::text, 'archived'::text\])),

  published\_at timestamp with time zone,

  archived\_at timestamp with time zone,

  original\_price numeric DEFAULT 0,

  discount\_percentage integer DEFAULT 0 CHECK (discount\_percentage \>= 0 AND discount\_percentage \<= 100),

  is\_free boolean DEFAULT false,

  learning\_outcomes ARRAY,

  certificate\_enabled boolean DEFAULT false,

  estimated\_completion\_time character varying,

  difficulty\_rating integer DEFAULT 1 CHECK (difficulty\_rating \>= 1 AND difficulty\_rating \<= 5),

  CONSTRAINT courses\_pkey PRIMARY KEY (id),

  CONSTRAINT courses\_instructor\_id\_fkey FOREIGN KEY (instructor\_id) REFERENCES public.users(id)

);

CREATE TABLE public.enrollments (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  user\_id uuid NOT NULL,

  course\_id uuid NOT NULL,

  progress integer DEFAULT 0 CHECK (progress \>= 0 AND progress \<= 100),

  completed\_at timestamp with time zone,

  enrolled\_at timestamp with time zone DEFAULT now(),

  last\_accessed\_at timestamp with time zone,

  current\_lesson\_id uuid,

  total\_watch\_time\_minutes integer DEFAULT 0,

  certificate\_issued\_at timestamp with time zone,

  CONSTRAINT enrollments\_pkey PRIMARY KEY (id),

  CONSTRAINT enrollments\_course\_id\_fkey FOREIGN KEY (course\_id) REFERENCES public.courses(id),

  CONSTRAINT enrollments\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES public.users(id),

  CONSTRAINT enrollments\_current\_lesson\_id\_fkey FOREIGN KEY (current\_lesson\_id) REFERENCES public.course\_lessons(id)

);

CREATE TABLE public.leaderboard\_entries (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  leaderboard\_id uuid,

  user\_id uuid,

  score numeric NOT NULL,

  additional\_data jsonb DEFAULT '{}'::jsonb,

  rank\_position integer,

  created\_at timestamp with time zone DEFAULT now(),

  updated\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT leaderboard\_entries\_pkey PRIMARY KEY (id),

  CONSTRAINT leaderboard\_entries\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES auth.users(id),

  CONSTRAINT leaderboard\_entries\_leaderboard\_id\_fkey FOREIGN KEY (leaderboard\_id) REFERENCES public.leaderboards(id)

);

CREATE TABLE public.leaderboards (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  name character varying NOT NULL,

  description text,

  quiz\_id uuid,

  category\_id uuid,

  learning\_path\_id uuid,

  leaderboard\_type character varying DEFAULT 'score'::character varying,

  time\_period character varying DEFAULT 'all\_time'::character varying,

  max\_entries integer DEFAULT 100,

  is\_public boolean DEFAULT true,

  reset\_frequency character varying,

  last\_reset timestamp with time zone,

  metadata jsonb DEFAULT '{}'::jsonb,

  created\_at timestamp with time zone DEFAULT now(),

  updated\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT leaderboards\_pkey PRIMARY KEY (id),

  CONSTRAINT leaderboards\_learning\_path\_id\_fkey FOREIGN KEY (learning\_path\_id) REFERENCES public.learning\_paths(id),

  CONSTRAINT leaderboards\_quiz\_id\_fkey FOREIGN KEY (quiz\_id) REFERENCES public.quizzes(id),

  CONSTRAINT leaderboards\_category\_id\_fkey FOREIGN KEY (category\_id) REFERENCES public.quiz\_categories(id)

);

CREATE TABLE public.learning\_path\_progress (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  user\_id uuid,

  learning\_path\_id uuid,

  current\_quiz\_index integer DEFAULT 0,

  completed\_quizzes ARRAY DEFAULT '{}'::uuid\[\],

  progress\_percentage numeric DEFAULT 0,

  started\_at timestamp with time zone DEFAULT now(),

  completed\_at timestamp with time zone,

  last\_activity\_at timestamp with time zone DEFAULT now(),

  metadata jsonb DEFAULT '{}'::jsonb,

  CONSTRAINT learning\_path\_progress\_pkey PRIMARY KEY (id),

  CONSTRAINT learning\_path\_progress\_learning\_path\_id\_fkey FOREIGN KEY (learning\_path\_id) REFERENCES public.learning\_paths(id),

  CONSTRAINT learning\_path\_progress\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES auth.users(id)

);

CREATE TABLE public.learning\_paths (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  name character varying NOT NULL,

  description text,

  quiz\_ids ARRAY DEFAULT '{}'::uuid\[\],

  prerequisites ARRAY DEFAULT '{}'::uuid\[\],

  completion\_criteria jsonb DEFAULT '{"min\_score": 70, "pass\_rate": 0.8}'::jsonb,

  estimated\_hours numeric,

  difficulty\_level character varying DEFAULT 'beginner'::character varying,

  category\_id uuid,

  is\_public boolean DEFAULT false,

  created\_by uuid,

  tags ARRAY DEFAULT '{}'::text\[\],

  metadata jsonb DEFAULT '{}'::jsonb,

  created\_at timestamp with time zone DEFAULT now(),

  updated\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT learning\_paths\_pkey PRIMARY KEY (id),

  CONSTRAINT learning\_paths\_category\_id\_fkey FOREIGN KEY (category\_id) REFERENCES public.quiz\_categories(id),

  CONSTRAINT learning\_paths\_created\_by\_fkey FOREIGN KEY (created\_by) REFERENCES auth.users(id)

);

CREATE TABLE public.lesson\_progress (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  user\_id uuid NOT NULL,

  lesson\_id uuid NOT NULL,

  is\_completed boolean DEFAULT false,

  watch\_time\_minutes integer DEFAULT 0,

  last\_position\_seconds integer DEFAULT 0,

  completed\_at timestamp with time zone,

  started\_at timestamp with time zone DEFAULT now(),

  updated\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT lesson\_progress\_pkey PRIMARY KEY (id),

  CONSTRAINT lesson\_progress\_lesson\_id\_fkey FOREIGN KEY (lesson\_id) REFERENCES public.course\_lessons(id),

  CONSTRAINT lesson\_progress\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES public.users(id)

);

CREATE TABLE public.media\_library (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  filename character varying NOT NULL,

  original\_name character varying,

  file\_path character varying NOT NULL,

  file\_type character varying,

  file\_size integer,

  mime\_type character varying,

  alt\_text character varying,

  tags ARRAY DEFAULT '{}'::text\[\],

  is\_public boolean DEFAULT false,

  folder\_path character varying DEFAULT ''::character varying,

  thumbnail\_url character varying,

  metadata jsonb DEFAULT '{}'::jsonb,

  created\_by uuid,

  created\_at timestamp with time zone DEFAULT now(),

  updated\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT media\_library\_pkey PRIMARY KEY (id),

  CONSTRAINT media\_library\_created\_by\_fkey FOREIGN KEY (created\_by) REFERENCES auth.users(id)

);

CREATE TABLE public.notifications (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  user\_id uuid NOT NULL,

  title text NOT NULL,

  message text NOT NULL,

  type text NOT NULL CHECK (type \= ANY (ARRAY\['enrollment'::text, 'assignment'::text, 'achievement'::text, 'announcement'::text, 'reminder'::text\])),

  is\_read boolean DEFAULT false,

  action\_url text,

  created\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT notifications\_pkey PRIMARY KEY (id),

  CONSTRAINT notifications\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES public.users(id)

);

CREATE TABLE public.order\_items (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  order\_id uuid NOT NULL,

  course\_id uuid NOT NULL,

  price\_paid numeric NOT NULL,

  created\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT order\_items\_pkey PRIMARY KEY (id),

  CONSTRAINT order\_items\_order\_id\_fkey FOREIGN KEY (order\_id) REFERENCES public.orders(id),

  CONSTRAINT order\_items\_course\_id\_fkey FOREIGN KEY (course\_id) REFERENCES public.courses(id)

);

CREATE TABLE public.orders (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  user\_id uuid NOT NULL,

  total\_amount numeric NOT NULL,

  currency text DEFAULT 'USD'::text,

  status text DEFAULT 'pending'::text CHECK (status \= ANY (ARRAY\['pending'::text, 'completed'::text, 'failed'::text, 'cancelled'::text, 'refunded'::text\])),

  payment\_method text,

  payment\_intent\_id text,

  created\_at timestamp with time zone DEFAULT now(),

  updated\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT orders\_pkey PRIMARY KEY (id),

  CONSTRAINT orders\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES public.users(id)

);

CREATE TABLE public.question\_analytics (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  question\_id uuid UNIQUE,

  total\_attempts integer DEFAULT 0,

  correct\_attempts integer DEFAULT 0,

  average\_time\_seconds numeric DEFAULT 0,

  difficulty\_rating numeric DEFAULT 0,

  discrimination\_index numeric DEFAULT 0,

  last\_updated timestamp with time zone DEFAULT now(),

  metadata jsonb DEFAULT '{}'::jsonb,

  CONSTRAINT question\_analytics\_pkey PRIMARY KEY (id),

  CONSTRAINT question\_analytics\_question\_id\_fkey FOREIGN KEY (question\_id) REFERENCES public.quiz\_questions(id)

);

CREATE TABLE public.question\_attempts (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  quiz\_attempt\_id uuid,

  question\_id uuid,

  user\_answer jsonb,

  is\_correct boolean,

  points\_earned numeric DEFAULT 0,

  points\_possible numeric DEFAULT 1,

  time\_spent\_seconds integer DEFAULT 0,

  attempts\_count integer DEFAULT 1,

  flagged boolean DEFAULT false,

  confidence\_level integer CHECK (confidence\_level \>= 1 AND confidence\_level \<= 5),

  feedback\_shown boolean DEFAULT false,

  hint\_used boolean DEFAULT false,

  metadata jsonb DEFAULT '{}'::jsonb,

  created\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT question\_attempts\_pkey PRIMARY KEY (id),

  CONSTRAINT question\_attempts\_quiz\_attempt\_id\_fkey FOREIGN KEY (quiz\_attempt\_id) REFERENCES public.quiz\_attempts(id),

  CONSTRAINT question\_attempts\_question\_id\_fkey FOREIGN KEY (question\_id) REFERENCES public.quiz\_questions(id)

);

CREATE TABLE public.question\_media (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  question\_id uuid,

  media\_id uuid,

  media\_role USER-DEFINED DEFAULT 'question'::media\_role,

  display\_order integer DEFAULT 0,

  is\_required boolean DEFAULT false,

  metadata jsonb DEFAULT '{}'::jsonb,

  created\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT question\_media\_pkey PRIMARY KEY (id),

  CONSTRAINT question\_media\_question\_id\_fkey FOREIGN KEY (question\_id) REFERENCES public.quiz\_questions(id),

  CONSTRAINT question\_media\_media\_id\_fkey FOREIGN KEY (media\_id) REFERENCES public.media\_library(id)

);

CREATE TABLE public.questions (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  quiz\_id uuid NOT NULL,

  question\_text text NOT NULL,

  question\_type text DEFAULT 'multiple\_choice'::text CHECK (question\_type \= ANY (ARRAY\['multiple\_choice'::text, 'true\_false'::text, 'fill\_blank'::text\])),

  options jsonb,

  correct\_answer text NOT NULL,

  explanation text,

  points integer DEFAULT 1,

  created\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT questions\_pkey PRIMARY KEY (id)

);

CREATE TABLE public.quiz\_attempts (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  user\_id uuid NOT NULL,

  quiz\_id uuid NOT NULL,

  score integer NOT NULL DEFAULT 0,

  total\_questions integer NOT NULL,

  time\_taken\_seconds integer NOT NULL DEFAULT 0,

  answers jsonb NOT NULL,

  completed\_at timestamp with time zone DEFAULT now(),

  passed boolean DEFAULT false,

  percentage\_score numeric,

  attempt\_number integer DEFAULT 1,

  created\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT quiz\_attempts\_pkey PRIMARY KEY (id),

  CONSTRAINT quiz\_attempts\_quiz\_id\_fkey FOREIGN KEY (quiz\_id) REFERENCES public.quizzes(id),

  CONSTRAINT quiz\_attempts\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES public.users(id)

);

CREATE TABLE public.quiz\_categories (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  name character varying NOT NULL UNIQUE,

  description text,

  color character varying DEFAULT '\#3B82F6'::character varying,

  icon character varying,

  parent\_id uuid,

  sort\_order integer DEFAULT 0,

  is\_active boolean DEFAULT true,

  metadata jsonb DEFAULT '{}'::jsonb,

  created\_at timestamp with time zone DEFAULT now(),

  updated\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT quiz\_categories\_pkey PRIMARY KEY (id),

  CONSTRAINT quiz\_categories\_parent\_id\_fkey FOREIGN KEY (parent\_id) REFERENCES public.quiz\_categories(id)

);

CREATE TABLE public.quiz\_feedback (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  quiz\_id uuid,

  user\_id uuid,

  rating integer CHECK (rating \>= 1 AND rating \<= 5),

  comment text,

  is\_public boolean DEFAULT true,

  is\_verified boolean DEFAULT false,

  helpful\_count integer DEFAULT 0,

  reply\_to\_id uuid,

  metadata jsonb DEFAULT '{}'::jsonb,

  created\_at timestamp with time zone DEFAULT now(),

  updated\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT quiz\_feedback\_pkey PRIMARY KEY (id),

  CONSTRAINT quiz\_feedback\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES auth.users(id),

  CONSTRAINT quiz\_feedback\_quiz\_id\_fkey FOREIGN KEY (quiz\_id) REFERENCES public.quizzes(id),

  CONSTRAINT quiz\_feedback\_reply\_to\_id\_fkey FOREIGN KEY (reply\_to\_id) REFERENCES public.quiz\_feedback(id)

);

CREATE TABLE public.quiz\_group\_members (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  group\_id uuid,

  user\_id uuid,

  role character varying DEFAULT 'member'::character varying,

  joined\_at timestamp with time zone DEFAULT now(),

  is\_active boolean DEFAULT true,

  metadata jsonb DEFAULT '{}'::jsonb,

  CONSTRAINT quiz\_group\_members\_pkey PRIMARY KEY (id),

  CONSTRAINT quiz\_group\_members\_group\_id\_fkey FOREIGN KEY (group\_id) REFERENCES public.quiz\_groups(id),

  CONSTRAINT quiz\_group\_members\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES auth.users(id)

);

CREATE TABLE public.quiz\_groups (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  name character varying NOT NULL,

  description text,

  created\_by uuid,

  is\_public boolean DEFAULT false,

  join\_code character varying UNIQUE,

  max\_members integer DEFAULT 50,

  settings jsonb DEFAULT '{}'::jsonb,

  created\_at timestamp with time zone DEFAULT now(),

  updated\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT quiz\_groups\_pkey PRIMARY KEY (id),

  CONSTRAINT quiz\_groups\_created\_by\_fkey FOREIGN KEY (created\_by) REFERENCES auth.users(id)

);

CREATE TABLE public.quiz\_permissions (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  quiz\_id uuid,

  user\_id uuid,

  permission\_level USER-DEFINED DEFAULT 'view'::permission\_level,

  granted\_by uuid,

  granted\_at timestamp with time zone DEFAULT now(),

  expires\_at timestamp with time zone,

  is\_active boolean DEFAULT true,

  metadata jsonb DEFAULT '{}'::jsonb,

  CONSTRAINT quiz\_permissions\_pkey PRIMARY KEY (id),

  CONSTRAINT quiz\_permissions\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES auth.users(id),

  CONSTRAINT quiz\_permissions\_quiz\_id\_fkey FOREIGN KEY (quiz\_id) REFERENCES public.quizzes(id),

  CONSTRAINT quiz\_permissions\_granted\_by\_fkey FOREIGN KEY (granted\_by) REFERENCES auth.users(id)

);

CREATE TABLE public.quiz\_questions (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  quiz\_id uuid NOT NULL,

  question text NOT NULL,

  options jsonb NOT NULL,

  correct\_answer integer NOT NULL,

  explanation text,

  order\_index integer NOT NULL,

  points integer DEFAULT 1,

  difficulty\_level text DEFAULT 'medium'::text CHECK (difficulty\_level \= ANY (ARRAY\['easy'::text, 'medium'::text, 'hard'::text\])),

  image\_url text,

  audio\_url text,

  video\_url text,

  question\_type text DEFAULT 'multiple\_choice'::text CHECK (question\_type \= ANY (ARRAY\['multiple\_choice'::text, 'single\_choice'::text, 'true\_false'::text, 'fill\_blank'::text, 'essay'::text, 'matching'::text, 'ordering'::text\])),

  correct\_answer\_text text,

  tags ARRAY DEFAULT '{}'::text\[\],

  time\_limit\_seconds integer,

  required boolean DEFAULT true,

  randomize\_options boolean DEFAULT false,

  partial\_credit boolean DEFAULT false,

  feedback\_correct text,

  feedback\_incorrect text,

  hint text,

  question\_metadata jsonb DEFAULT '{}'::jsonb,

  conditional\_logic jsonb,

  weight numeric DEFAULT 1.0,

  auto\_grade boolean DEFAULT true,

  rubric jsonb,

  correct\_answer\_json jsonb,

  CONSTRAINT quiz\_questions\_pkey PRIMARY KEY (id),

  CONSTRAINT quiz\_questions\_quiz\_id\_fkey FOREIGN KEY (quiz\_id) REFERENCES public.quizzes(id)

);

CREATE TABLE public.quiz\_sessions (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  quiz\_attempt\_id uuid,

  user\_id uuid,

  quiz\_id uuid,

  session\_data jsonb DEFAULT '{}'::jsonb,

  started\_at timestamp with time zone DEFAULT now(),

  last\_activity\_at timestamp with time zone DEFAULT now(),

  ended\_at timestamp with time zone,

  is\_active boolean DEFAULT true,

  user\_agent text,

  ip\_address inet,

  browser\_info jsonb DEFAULT '{}'::jsonb,

  CONSTRAINT quiz\_sessions\_pkey PRIMARY KEY (id),

  CONSTRAINT quiz\_sessions\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES auth.users(id),

  CONSTRAINT quiz\_sessions\_quiz\_attempt\_id\_fkey FOREIGN KEY (quiz\_attempt\_id) REFERENCES public.quiz\_attempts(id),

  CONSTRAINT quiz\_sessions\_quiz\_id\_fkey FOREIGN KEY (quiz\_id) REFERENCES public.quizzes(id)

);

CREATE TABLE public.quiz\_templates (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  name character varying NOT NULL,

  description text,

  template\_data jsonb NOT NULL,

  category\_id uuid,

  created\_by uuid,

  is\_public boolean DEFAULT false,

  usage\_count integer DEFAULT 0,

  rating numeric DEFAULT 0,

  tags ARRAY DEFAULT '{}'::text\[\],

  thumbnail\_url character varying,

  metadata jsonb DEFAULT '{}'::jsonb,

  created\_at timestamp with time zone DEFAULT now(),

  updated\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT quiz\_templates\_pkey PRIMARY KEY (id),

  CONSTRAINT quiz\_templates\_created\_by\_fkey FOREIGN KEY (created\_by) REFERENCES auth.users(id),

  CONSTRAINT quiz\_templates\_category\_id\_fkey FOREIGN KEY (category\_id) REFERENCES public.quiz\_categories(id)

);

CREATE TABLE public.quizzes (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  title text NOT NULL,

  description text NOT NULL,

  category text NOT NULL,

  difficulty text DEFAULT 'beginner'::text CHECK (difficulty \= ANY (ARRAY\['beginner'::text, 'intermediate'::text, 'advanced'::text\])),

  duration\_minutes integer NOT NULL DEFAULT 10,

  total\_questions integer DEFAULT 0,

  is\_published boolean DEFAULT false,

  created\_at timestamp with time zone DEFAULT now(),

  updated\_at timestamp with time zone DEFAULT now(),

  course\_id uuid,

  lesson\_id uuid,

  passing\_score integer DEFAULT 70 CHECK (passing\_score \>= 0 AND passing\_score \<= 100),

  max\_attempts integer DEFAULT 0,

  time\_limit\_minutes integer,

  image\_url text,

  shuffle\_questions boolean DEFAULT false,

  shuffle\_options boolean DEFAULT false,

  show\_results\_immediately boolean DEFAULT true,

  allow\_review boolean DEFAULT true,

  allow\_backtrack boolean DEFAULT true,

  randomize\_questions boolean DEFAULT false,

  questions\_per\_page integer DEFAULT 1,

  show\_progress boolean DEFAULT true,

  auto\_submit boolean DEFAULT false,

  instructions text,

  tags ARRAY DEFAULT '{}'::text\[\],

  estimated\_time\_minutes integer,

  retake\_policy jsonb DEFAULT '{"allowed": true, "max\_attempts": 0, "cooldown\_hours": 0}'::jsonb,

  grading\_policy jsonb DEFAULT '{"method": "highest", "partial\_credit": false, "show\_correct\_answers": true}'::jsonb,

  availability\_window jsonb DEFAULT '{"end\_date": null, "timezone": "UTC", "start\_date": null}'::jsonb,

  proctoring\_settings jsonb DEFAULT '{"webcam": false, "enabled": false, "screen\_lock": false, "time\_warnings": \[300, 60\]}'::jsonb,

  certificate\_template\_id uuid,

  analytics\_enabled boolean DEFAULT true,

  public\_results boolean DEFAULT false,

  allow\_anonymous boolean DEFAULT false,

  attempts\_count integer DEFAULT 0,

  average\_score numeric DEFAULT 0,

  CONSTRAINT quizzes\_pkey PRIMARY KEY (id),

  CONSTRAINT quizzes\_lesson\_id\_fkey FOREIGN KEY (lesson\_id) REFERENCES public.course\_lessons(id),

  CONSTRAINT quizzes\_course\_id\_fkey FOREIGN KEY (course\_id) REFERENCES public.courses(id)

);

CREATE TABLE public.user\_badges (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  user\_id uuid,

  badge\_id uuid,

  earned\_at timestamp with time zone DEFAULT now(),

  quiz\_attempt\_id uuid,

  learning\_path\_id uuid,

  progress\_data jsonb DEFAULT '{}'::jsonb,

  is\_featured boolean DEFAULT false,

  metadata jsonb DEFAULT '{}'::jsonb,

  CONSTRAINT user\_badges\_pkey PRIMARY KEY (id),

  CONSTRAINT user\_badges\_learning\_path\_id\_fkey FOREIGN KEY (learning\_path\_id) REFERENCES public.learning\_paths(id),

  CONSTRAINT user\_badges\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES auth.users(id),

  CONSTRAINT user\_badges\_badge\_id\_fkey FOREIGN KEY (badge\_id) REFERENCES public.badges(id),

  CONSTRAINT user\_badges\_quiz\_attempt\_id\_fkey FOREIGN KEY (quiz\_attempt\_id) REFERENCES public.quiz\_attempts(id)

);

CREATE TABLE public.user\_stats (

  id uuid NOT NULL DEFAULT gen\_random\_uuid(),

  user\_id uuid UNIQUE,

  total\_points integer DEFAULT 0,

  current\_streak integer DEFAULT 0,

  longest\_streak integer DEFAULT 0,

  quizzes\_completed integer DEFAULT 0,

  questions\_answered integer DEFAULT 0,

  correct\_answers integer DEFAULT 0,

  total\_time\_spent\_minutes integer DEFAULT 0,

  achievements\_count integer DEFAULT 0,

  last\_activity\_date date DEFAULT CURRENT\_DATE,

  level\_id uuid,

  experience\_points integer DEFAULT 0,

  metadata jsonb DEFAULT '{}'::jsonb,

  created\_at timestamp with time zone DEFAULT now(),

  updated\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT user\_stats\_pkey PRIMARY KEY (id),

  CONSTRAINT user\_stats\_user\_id\_fkey FOREIGN KEY (user\_id) REFERENCES auth.users(id)

);

CREATE TABLE public.users (

  id uuid NOT NULL,

  email text NOT NULL UNIQUE,

  name text NOT NULL,

  avatar\_url text,

  role text DEFAULT 'student'::text CHECK (role \= ANY (ARRAY\['student'::text, 'instructor'::text, 'admin'::text\])),

  created\_at timestamp with time zone DEFAULT now(),

  updated\_at timestamp with time zone DEFAULT now(),

  CONSTRAINT users\_pkey PRIMARY KEY (id)

);

