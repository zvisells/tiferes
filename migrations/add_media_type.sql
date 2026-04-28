-- Migration: Add media_type column to shiurim table
-- Supports 'audio' and 'video' content types. Defaults to 'audio' for all existing rows.

ALTER TABLE shiurim ADD COLUMN media_type VARCHAR(10) DEFAULT 'audio';

UPDATE shiurim SET media_type = 'audio' WHERE media_type IS NULL;
