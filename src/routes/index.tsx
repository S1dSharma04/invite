import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowDown, ArrowUpRight, MapPin, Share2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvitationEffects } from "@/components/invitation-effects";
import { useFitToFrame } from "@/hooks/use-fit-to-frame";
import { ARTWORK, BACKGROUND_MUSIC } from "@/config/media";

const maps = "https://maps.app.goo.gl/CgFswWsaCWGwNV2aA?g_st=ic";
const eventTime = new Date("2026-10-19T11:30:00+05:30").getTime();
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tanya ♥ Vishal — Ring Ceremony Invitation" },
      {
        name: "description",
        content:
          "With love from Mr. Munesh & Mrs. Geeta: celebrate Tanya and Vishal’s Ring Ceremony on 19 October 2026, 11:30 AM, at Olga Palace, Govindpuram, Ghaziabad.",
      },
      { property: "og:title", content: "Tanya ♥ Vishal — A Beautiful Beginning" },
      {
        property: "og:description",
        content:
          "A warm invitation from Tanya’s family. 19 October 2026 · 11:30 AM · Olga Palace, Ghaziabad.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Invitation,
});

function Ornament() {
  return (
    <div className="ornament" aria-hidden="true">
      ❧
    </div>
  );
}
function Countdown() {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setRemaining(Math.max(0, eventTime - Date.now()));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);
  const seconds = remaining === null ? null : Math.floor(remaining / 1000);
  const values =
    seconds === null
      ? ["—", "—", "—", "—"]
      : [
          Math.floor(seconds / 86400),
          Math.floor(seconds / 3600) % 24,
          Math.floor(seconds / 60) % 60,
          seconds % 60,
        ].map((n) => String(n).padStart(2, "0"));
  return (
    <div className="countdown" aria-label="Countdown to the ring ceremony">
      {["DAYS", "HOURS", "MINUTES", "SECONDS"].map((label, i) => (
        <div key={label}>
          <strong>{values[i]}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function Invitation() {
  const [opened, setOpened] = useState(false);
  const [navShown, setNavShown] = useState(false);
  const [active, setActive] = useState("home");
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      // Past the hero, the nav slides away while scrolling down and returns on any scroll up.
      const y = window.scrollY;
      const delta = y - lastY;
      if (y <= Math.max(140, window.innerHeight * 0.5)) setNavShown(false);
      else if (delta > 4) setNavShown(false);
      else if (delta < -4) setNavShown(true);
      if (Math.abs(delta) > 4) lastY = y;
      // Covered scenes stay pinned on screen, so the active one is the last to reach the reading line.
      const line = window.innerHeight * 0.4;
      let current = "home";
      document.querySelectorAll<HTMLElement>("section[id]").forEach((section) => {
        if (section.getBoundingClientRect().top <= line) current = section.id;
      });
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  const [shareStatus, setShareStatus] = useState("");
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const invitationRef = useRef<HTMLElement>(null);
  const openingRef = useRef<HTMLDivElement>(null);
  const invitationTextRef = useRef<HTMLDivElement>(null);
  useFitToFrame(invitationRef, openingRef, invitationTextRef, 14, 21);
  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    // The audio element's play/pause events keep `playing` in sync, including system interruptions.
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  };
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [opened]);
  const share = async () => {
    const text =
      "With love from Mr. Munesh & Mrs. Geeta, you are invited to Tanya ♥ Vishal’s Ring Ceremony. 19 October 2026, 11:30 AM. Olga Palace, Block I, Govindpuram, Ghaziabad, Uttar Pradesh 201013.";
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Tanya ♥ Vishal — Ring Ceremony",
          text,
          url: window.location.href,
        });
        setShareStatus("Invitation shared.");
      } else {
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
        setShareStatus("Invitation link copied.");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError")
        setShareStatus("Unable to share. Please copy the page link.");
    }
  };
  // A pinned scene's on-screen box isn't its place in the page, so native anchor jumps can't
  // scroll back to it; measure the scenes above the target instead.
  const goTo = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setOpened(true);
    const target = document.getElementById(id);
    if (!target) return;
    let top = 0;
    for (let el = target.previousElementSibling; el; el = el.previousElementSibling)
      if (el instanceof HTMLElement && el.hasAttribute("data-scene")) top += el.offsetHeight;
    // Scenes fill the screen and reserve room for the nav themselves, so land on the scene's top.
    // No history update: the router would follow it with its own hash scroll and undo this one.
    window.scrollTo({ top });
  };
  return (
    <main className="invitation-site">
      <audio
        ref={audioRef}
        src={BACKGROUND_MUSIC}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        className={`music-toggle ${opened ? "is-visible" : ""} ${playing ? "is-playing" : ""}`}
        onClick={toggleMusic}
        aria-label={playing ? "Pause the music" : "Play the music"}
        aria-pressed={playing}
        tabIndex={opened ? 0 : -1}
      >
        {playing ? <Volume2 size={19} /> : <VolumeX size={19} />}
      </button>
      <nav
        className={`site-nav ${opened && navShown ? "is-visible" : ""}`}
        aria-label="Invitation sections"
      >
        <a
          href="#home"
          className="monogram"
          onClick={goTo("home")}
          aria-label="Tanya and Vishal, home"
        >
          T<span>♥</span>V
        </a>
        <div className="nav-links">
          {(
            [
              ["home", "Home"],
              ["invitation", "Invitation"],
              ["event", "Event"],
              ["venue", "Venue"],
              ["families", "Families"],
            ] as const
          ).map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={goTo(id)}
              className={active === id ? "active" : ""}
              aria-current={active === id ? "location" : undefined}
            >
              {label}
            </a>
          ))}
        </div>
        <span className="nav-date">19 · 10 · 2026</span>
      </nav>
      <InvitationEffects />
      <div className={`door-stage ${opened ? "opened" : ""}`} aria-hidden={opened}>
        <div className="door-panel left">
          <img decoding="async" src={ARTWORK.doors} alt="" />
        </div>
        <div className="door-panel right">
          <img decoding="async" src={ARTWORK.doors} alt="" />
        </div>
        <div className="door-message">
          <p className="eyebrow">With love, from our family to yours</p>
          <h2>
            TANYA<span className="heart">♥</span>VISHAL
          </h2>
          <p className="ceremony">A beautiful beginning</p>
          <Button
            variant="seal"
            onClick={() => {
              setOpened(true);
              audioRef.current?.play().catch(() => {});
            }}
            aria-label="Open the invitation"
            tabIndex={opened ? -1 : 0}
          >
            T V
          </Button>
          <p className="door-caption">OPEN THE INVITATION</p>
        </div>
      </div>
      <section id="home" className="scene hero" data-scene>
        <img
          decoding="async"
          className="scene-art"
          src={ARTWORK.hall}
          alt="Royal floral hall with golden chandeliers"
          fetchPriority="high"
        />
        <div className="scene-veil" />
        <div className="scene-content">
          <p className="eyebrow">Together with our beloved families</p>
          <Ornament />
          <h1>
            TANYA<span className="heart">♥</span>VISHAL
          </h1>
          <p className="ceremony">Ring Ceremony</p>
          <p className="event-date">
            19 OCTOBER 2026 <span aria-hidden="true"> &nbsp; | &nbsp; </span> 11:30 AM
          </p>
          <Ornament />
          <p className="hero-note">Two hearts. One beautiful beginning.</p>
        </div>
        <a href="#invitation" className="scroll-cue" onClick={goTo("invitation")}>
          THE INVITATION
          <ArrowDown size={17} />
        </a>
      </section>
      <section id="invitation" className="scene invitation" data-scene ref={invitationRef}>
        <img decoding="async" className="scene-art" src={ARTWORK.frame} alt="" loading="lazy" />
        <div className="frame-opening" ref={openingRef}>
          <div className="scene-content" ref={invitationTextRef}>
            <p className="eyebrow invite-eyebrow" data-shimmer>
              An invitation from the heart
            </p>
            <h2 className="section-title">
              Together with our family,
              <br />
              we invite you
            </h2>
            <Ornament />
            <div className="invitation-copy">
              <p>
                With immense joy and happiness in our hearts, we invite you and your family to join
                us on the auspicious occasion of the Ring Ceremony of our beloved daughter Tanya
                with Vishal.
              </p>
              <p>
                As they begin this beautiful journey of love, companionship and togetherness, we
                would be honoured to have your gracious presence and blessings on this special day.
                Your presence will add warmth and happiness to our celebration and make this
                cherished occasion even more memorable for our family.
              </p>
              <p>
                We look forward to celebrating this beautiful beginning with you and creating
                memories that will remain close to our hearts forever.
              </p>
            </div>
            <div className="parents-signature">
              <Ornament />
              <p className="script-line">With love and blessings,</p>
              <h3 className="parent-names">Mr. Munesh & Mrs. Geeta</h3>
            </div>
          </div>
        </div>
      </section>
      <section id="event" className="scene celebration" data-scene>
        <img decoding="async" className="scene-art" src={ARTWORK.garden} alt="" loading="lazy" />
        <div className="scene-veil" />
        <div className="scene-content">
          <p className="eyebrow">A promise of forever</p>
          <h2 className="section-title">The Celebration</h2>
          <Ornament />
          <div className="event-frame" data-interactive>
            <div className="rings" aria-hidden="true">
              <span className="ring" />
              <span className="ring" />
            </div>
            <p className="eyebrow">TANYA ♥ VISHAL</p>
            <h3>Ring Ceremony</h3>
            <p className="event-date">19 October 2026</p>
            <p className="event-time">11:30 AM</p>
            <p className="small-label">MONDAY · INDIA STANDARD TIME</p>
            <Ornament />
            <p className="script-line">Counting the moments until we celebrate</p>
            <Countdown />
          </div>
        </div>
      </section>
      <section id="venue" className="scene venue" data-scene>
        <div className="venue-artwork">
          <img
            decoding="async"
            src={ARTWORK.stairs}
            alt="Decorative palace illustration with a pink floral staircase"
            loading="lazy"
          />
        </div>
        <div className="venue-details">
          <h2>
            Olga <br />
            Palace
          </h2>
          <p className="script-line">Where our celebration begins</p>
          <div className="venue-divider" />
          <MapPin size={22} aria-hidden="true" />
          <p className="address">
            Block I, Govindpuram,
            <br />
            Ghaziabad,
            <br />
            Uttar Pradesh 201013
          </p>
          <div className="venue-actions">
            <Button variant="royal" asChild>
              <a href={maps} target="_blank" rel="noopener noreferrer">
                GET DIRECTIONS
                <ArrowUpRight />
              </a>
            </Button>
            <a className="location-link" href={maps} target="_blank" rel="noopener noreferrer">
              VIEW LOCATION
            </a>
          </div>
        </div>
      </section>
      <section id="families" className="scene families" data-scene>
        <img decoding="async" className="scene-art" src={ARTWORK.garden} alt="" loading="lazy" />
        <div className="scene-veil" />
        <div className="scene-content">
          <p className="eyebrow">Love that brings us together</p>
          <h2 className="section-title">
            With the blessings
            <br />
            of our families
          </h2>
          <Ornament />
          <div className="family-grid">
            <div>
              <p className="eyebrow">BRIDE’S FAMILY</p>
              <h3>
                Mr. Munesh
                <br />& Mrs. Geeta
              </h3>
            </div>
            <div>
              <p className="eyebrow">GROOM’S FAMILY</p>
              <h3>
                Mr. Ompal
                <br />& Mrs. Babita
              </h3>
            </div>
          </div>
          <Ornament />
          <p className="script-line">Two families, one beautiful celebration.</p>
        </div>
      </section>
      <section className="scene closing" data-scene>
        <img decoding="async" className="scene-art" src={ARTWORK.hall} alt="" loading="lazy" />
        <div className="scene-veil" />
        <div className="scene-content">
          <p className="eyebrow">The beginning of forever</p>
          <Ornament />
          <h2>TANYA ♥ VISHAL</h2>
          <p className="ceremony">Ring Ceremony</p>
          <p className="event-date">19 OCTOBER 2026 &nbsp; | &nbsp; 11:30 AM</p>
          <p className="script-line">With love, blessings and warm wishes</p>
          <h3 className="parent-names">Mr. Munesh & Mrs. Geeta</h3>
          <Ornament />
          <p className="closing-quote">
            “We look forward to celebrating this beautiful beginning with you.”
          </p>
          <Button variant="royal" onClick={share} className="share-action">
            <Share2 />
            SHARE THE INVITATION
          </Button>
          <p role="status" className="share-status">
            {shareStatus}
          </p>
        </div>
      </section>
      <footer className="footer">
        <span>TANYA ♥ VISHAL</span>
        <span>WITH LOVE · 19 OCTOBER 2026</span>
      </footer>
    </main>
  );
}
