// The single place that says which media the invitation uses.
// Every file lives in public/media/, which is served as-is on Vercel, on Lovable and in local dev.
// (Not public/assets/: hosts cache that folder for a year, so a replaced song would not update.)

/**
 * Background music, played after a guest taps the seal and looped.
 *
 * To change the song, do one of these, then commit and push (Vercel redeploys on its own):
 *   - Replace public/media/wedding-music.mp3 with your new song, keeping the same file name, or
 *   - Add the new file to public/media/ and change the path below, e.g. "/media/my-song.mp3".
 * An MP3 of about 5 MB or less (128–192 kbps) loads quickly on phones.
 */
export const BACKGROUND_MUSIC = "/media/wedding-music.mp3";

/** Decorative artwork. The palace images are illustrations, not photographs of the venue. */
export const ARTWORK = {
  hall: "/media/royal-hall.png",
  doors: "/media/royal-doors.png",
  garden: "/media/garden.png",
  stairs: "/media/palace-stairs.png",
  frame: "/media/floral-invitation.webp",
};
