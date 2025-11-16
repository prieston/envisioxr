-- Fix organization slugs that were incorrectly generated
-- The original migration applied REGEXP_REPLACE before LOWER(), causing uppercase letters to be removed
-- This migration fixes all personal organization slugs by regenerating them correctly
DO $$
DECLARE
    org_record RECORD;
    user_record RECORD;
    new_slug TEXT;
    counter INTEGER;
BEGIN
    FOR org_record IN SELECT o.id, o.slug, o.name, om."userId"
                      FROM "Organization" o
                      JOIN "OrganizationMember" om ON o.id = om."organizationId"
                      WHERE o."isPersonal" = true
                      AND om.role = 'owner' LOOP

        -- Get user's name or email
        SELECT name, email INTO user_record FROM "User" WHERE id = org_record."userId";

        -- Generate correct slug: LOWER first, then replace non-alphanumeric
        -- The key fix: apply LOWER() BEFORE REGEXP_REPLACE
        new_slug := REGEXP_REPLACE(
            LOWER(COALESCE(user_record.name, user_record.email, 'user')),
            '[^a-z0-9]+',
            '-',
            'g'
        );

        -- Remove leading/trailing hyphens
        new_slug := TRIM(BOTH '-' FROM new_slug);

        -- Ensure uniqueness (only if different from current slug)
        IF new_slug != org_record.slug THEN
            counter := 1;
            WHILE EXISTS (SELECT 1 FROM "Organization" WHERE slug = new_slug AND id != org_record.id) LOOP
                new_slug := new_slug || '-' || SUBSTRING(org_record.id, 1, 8) || '-' || counter;
                counter := counter + 1;
            END LOOP;

            -- Update the organization slug
            UPDATE "Organization"
            SET slug = new_slug, "updatedAt" = NOW()
            WHERE id = org_record.id;
        END IF;

    END LOOP;
END $$;

