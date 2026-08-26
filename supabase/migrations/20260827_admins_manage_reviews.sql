-- Allow admins to update/delete any review
-- (public read + owner manage policies already exist)
CREATE POLICY "Admins manage reviews"
ON public.reviews
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
