// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  json,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createCharacterDataTable = pgTableCreator(() => `arcmania_character_data`);
export const createUserDataTable = pgTableCreator(() => `arcmania_user_data`);
export const createJourneyDataTable = pgTableCreator(() => `arcmania_journey_data`);

export const characterData = createCharacterDataTable(
  "character_data",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id"),
    characterData: json("character_data"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
);

export const userData = createUserDataTable(
  "user_data",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id"),
    journeyIdArray: json("journey_id_array"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
);

export const journeyData = createJourneyDataTable(
  "journey_data",
  {
    id: serial("id").primaryKey(),
    journeyId: varchar("journey_id"),
    journeyTitle: varchar("journey_title"),
    journeyData: json("journey_data"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
);
