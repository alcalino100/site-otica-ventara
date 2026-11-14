-- Indicação de armação por formato de rosto.
-- face_shape_fit: avaliação por rosto, ex.: {"oval":"ideal","quadrado":"boa","redondo":"regular","angular":"baixa"}
--   níveis aceitos: ideal | boa | regular | baixa  (rostos: oval, quadrado, redondo, retangular, alongado, angular)
-- face_shape_recommendations: lista dos rostos "ideal" (mantida por compatibilidade).
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS face_shape_fit JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS face_shape_recommendations TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.products.face_shape_fit IS
  'Compatibilidade da armação por formato de rosto: {rosto: ideal|boa|regular|baixa}.';

NOTIFY pgrst, 'reload schema';
