import { redirect } from "next/navigation";

// Unreleased lives inside the Exclusive page as a tab now, not as its own
// top-level destination — this route just forwards there so any existing
// links/bookmarks still land somewhere sensible.
export default function UnreleasedPage() {
  redirect("/exclusive?tab=unreleased");
}
