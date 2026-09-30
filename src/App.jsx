import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  MapPin,
  Menu as MenuIcon,
  X,
  Search,
  Download,
  Leaf,
  Check,
  Compass,
  Pause,
  Play,
  Sun,
  Moon,
} from "lucide-react";
import { menuCategories, menuItems } from "./data/menu";
import SoundControl from "./components/SoundControl";

const VenueScene = lazy(() => import("./components/VenueScene"));
const INSTAGRAM = "https://www.instagram.com/tamberma_ibadan/";
const GLOVO =
  "https://glovoapp.com/en/ng/ringroad-ibadan-challenge/stores/tamberma-ibadan-rch";
const WHATSAPP = "https://wa.me/2348075590939";
const DIRECTIONS =
  "https://www.google.com/maps/search/?api=1&query=Tamberma+Restaurant+Bar+1+Oba+Aleshinloye+Crescent+Iyaganku+Ibadan";
const money = (value) => `₦${value.toLocaleString("en-NG")}`;
const localDate = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

function Instagram({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.6" cy="6.5" r=".8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Brand({ footer = false }) {
  return (
    <a
      className={`brand ${footer ? "brand-footer" : ""}`}
      href="#home"
      aria-label="Tamberma home"
    >
      <svg
        className="brand-mark"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8 24 32 9l24 15M15 22v30h34V22M21 40h22M23 39c1 12 17 12 18 0M26 33c-4-5 5-6 1-12m10 12c-4-5 5-6 1-12M10 54h44"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      <span className="brand-name">
        Tamberma<span>RESTAURANT & BAR</span>
      </span>
    </a>
  );
}

function Modal({ title, className = "", onClose, children }) {
  const dialog = useRef();
  const previous = useRef();
  useEffect(() => {
    previous.current = document.activeElement;
    const el = dialog.current;
    el.showModal();
    const scroll = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = scroll;
      el.close();
      previous.current?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-label={title}
      className={`modal ${className}`}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <div className="modal-shell">
        <button
          className="icon-button modal-close"
          aria-label={`Close ${title}`}
          onClick={onClose}
        >
          <X size={22} />
        </button>
        {children}
      </div>
    </dialog>
  );
}

function MenuModal({ onClose, initialCategory }) {
  const [category, setCategory] = useState(initialCategory || "all");
  const [search, setSearch] = useState("");
  const results = useMemo(
    () =>
      menuItems.filter(
        (item) =>
          (category === "all" || item.category === category) &&
          `${item.name} ${item.description}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
      ),
    [category, search],
  );
  return (
    <Modal
      title="Food and drinks menu"
      className="menu-modal"
      onClose={onClose}
    >
      <div className="menu-modal-header">
        <span className="eyebrow">SOMETHING FOR EVERY CRAVING</span>
        <h2>
          Find your <em>favourite.</em>
        </h2>
        <p>
          A selection from our food & drinks menus. Prices exclude 7.5% VAT.
        </p>
      </div>
      <div className="menu-tools">
        <label className="search-box">
          <Search size={19} />
          <span className="sr-only">Search the menu</span>
          <input
            type="search"
            placeholder="A dish, a drink, a craving…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search && (
            <button aria-label="Clear search" onClick={() => setSearch("")}>
              <X size={16} />
            </button>
          )}
        </label>
        <div className="category-filters" aria-label="Menu categories">
          {menuCategories.map((cat) => (
            <button
              key={cat.id}
              aria-pressed={category === cat.id}
              className={category === cat.id ? "active" : ""}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      <div className="menu-result-count" role="status">
        {results.length} {results.length === 1 ? "selection" : "selections"}
      </div>
      <div className="menu-results">
        {results.length ? (
          results.map((item) => (
            <article className="menu-item" key={item.id}>
              <div className="menu-item-top">
                <h3>
                  {item.name}{" "}
                  {item.vegetarian && (
                    <Leaf size={15} aria-label="Vegetarian option" />
                  )}
                </h3>
                <span className="menu-price">
                  {item.variants ? "from " : ""}
                  {money(item.price)}
                </span>
              </div>
              <p>{item.description}</p>
              {item.variants && (
                <div className="variants">
                  {item.variants.map((variant) => (
                    <span key={variant.label}>
                      {variant.label} <b>{money(variant.price)}</b>
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))
        ) : (
          <div className="empty-state">
            <Search size={30} />
            <h3>No matches just yet.</h3>
            <p>Try another dish, or explore all our selections.</p>
            <button
              className="text-link"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
            >
              Show all selections <ArrowRight size={17} />
            </button>
          </div>
        )}
      </div>
      <div className="menu-downloads">
        <div>
          <strong>The whole menu, at your fingertips.</strong>
          <p>
            Availability and current prices are confirmed by the restaurant.
            Please ask the team about allergies.
          </p>
        </div>
        <div className="download-links">
          <a href="/menus/tamberma-food.pdf" target="_blank" rel="noreferrer">
            Food PDF <Download size={16} />
          </a>
          <a href="/menus/tamberma-drinks.pdf" target="_blank" rel="noreferrer">
            Drinks PDF <Download size={16} />
          </a>
        </div>
      </div>
    </Modal>
  );
}

function ReservationModal({ onClose }) {
  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({});
  const submit = (event) => {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    if (!fields.name.trim()) {
      setError("Please enter your name.");
      return;
    }
    const requestedTime = new Date(`${fields.date}T${fields.time}:00+01:00`);
    if (requestedTime <= new Date()) {
      setError("Please choose a future date and time.");
      return;
    }
    const formatted = new Date(
      `${fields.date}T12:00:00+01:00`,
    ).toLocaleDateString("en-NG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Africa/Lagos",
    });
    const message = `Hello Tamberma Ibadan! I'd like to enquire about a table.\n\nName: ${fields.name.trim()}\nDate: ${formatted}\nTime: ${fields.time} (Nigeria time)\nGuests: ${fields.guests}\nOccasion: ${fields.occasion}${fields.notes.trim() ? `\nNotes: ${fields.notes.trim()}` : ""}\n\nPlease let me know if a table is available. Thank you!`;
    setError("");
    setDraft(fields);
    setRequest({
      ...fields,
      formatted,
      url: `${WHATSAPP}?text=${encodeURIComponent(message)}`,
    });
  };
  return (
    <Modal
      title="Table enquiry"
      className="reservation-modal"
      onClose={onClose}
    >
      {!request ? (
        <>
          <span className="eyebrow">MAKE A LITTLE TIME FOR YOURSELF</span>
          <h2>
            Your table <em>awaits.</em>
          </h2>
          <p>
            Tell us what you have in mind. We’ll prepare your enquiry to send to
            our team on WhatsApp.
          </p>
          <form onSubmit={submit} className="reservation-form">
            <label>
              Your name
              <input
                autoComplete="name"
                name="name"
                defaultValue={draft.name || ""}
                required
                maxLength={80}
                placeholder="How should we address you?"
              />
            </label>
            <div className="form-row">
              <label>
                Date
                <input
                  type="date"
                  name="date"
                  defaultValue={draft.date || ""}
                  min={localDate()}
                  required
                />
              </label>
              <label>
                Time · WAT
                <input
                  type="time"
                  name="time"
                  required
                  defaultValue={draft.time || "19:00"}
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Guests
                <select name="guests" defaultValue={draft.guests || "2 guests"}>
                  {[
                    "1 guest",
                    "2 guests",
                    "3 guests",
                    "4 guests",
                    "5 guests",
                    "6 guests",
                    "7–10 guests",
                    "11+ guests",
                  ].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label>
                Occasion
                <select
                  name="occasion"
                  defaultValue={draft.occasion || "Just because"}
                >
                  <option>Just because</option>
                  <option>Date night</option>
                  <option>Family gathering</option>
                  <option>Birthday</option>
                  <option>Group celebration</option>
                </select>
              </label>
            </div>
            <label>
              A little extra detail <span className="optional">(optional)</span>
              <textarea
                name="notes"
                defaultValue={draft.notes || ""}
                rows={3}
                maxLength={500}
                placeholder="Anything you’d like the team to know?"
              />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button button-clay" type="submit">
              Prepare my enquiry <ArrowRight size={18} />
            </button>
            <p className="form-note">
              This is a table request. Your reservation is confirmed only when
              the restaurant replies.
            </p>
          </form>
        </>
      ) : (
        <div className="request-summary">
          <span className="summary-check">
            <Check size={27} />
          </span>
          <span className="eyebrow">READY WHEN YOU ARE</span>
          <h2>
            Let’s make <em>a plan.</em>
          </h2>
          <p>
            Your enquiry is ready. Continue to WhatsApp to review and send it to
            Tamberma.
          </p>
          <dl>
            <div>
              <dt>Name</dt>
              <dd>{request.name}</dd>
            </div>
            <div>
              <dt>When</dt>
              <dd>
                {request.formatted}
                <br />
                {request.time} WAT
              </dd>
            </div>
            <div>
              <dt>Your table</dt>
              <dd>
                {request.guests} · {request.occasion}
              </dd>
            </div>
          </dl>
          <a
            className="button button-clay"
            href={request.url}
            target="_blank"
            rel="noreferrer"
          >
            Continue to WhatsApp <ArrowUpRight size={18} />
          </a>
          <button className="text-link" onClick={() => setRequest(null)}>
            Edit enquiry
          </button>
          <p className="form-note">
            Nothing has been sent yet. The restaurant will confirm availability.
          </p>
        </div>
      )}
    </Modal>
  );
}

const CHAPTERS = [
  {
    name: "Welcome",
    label: "IYAGANKU, IBADAN",
    title: (
      <>
        A little
        <br />
        <em>escape.</em>
      </>
    ),
    text: "Step out of the everyday. Into good food, warm company, and a world of your own.",
    action: "Step inside",
    number: "01",
  },
  {
    name: "The garden",
    label: "ROOM TO SLOW DOWN",
    title: (
      <>
        Stay a<br />
        <em>little longer.</em>
      </>
    ),
    text: "Find your corner. Share a story. Let the afternoon take its time.",
    action: "Find your table",
    number: "02",
  },
  {
    name: "The table",
    label: "MANY FLAVOURS. ONE TABLE.",
    title: (
      <>
        Made to
        <br />
        <em>be shared.</em>
      </>
    ),
    text: "From the tandoor to the grill. Nigerian favourites, Indian classics, and something for every craving.",
    action: "Explore the food",
    number: "03",
  },
  {
    name: "The bar",
    label: "POURED FOR THE MOMENT",
    title: (
      <>
        A toast to
        <br />
        <em>right now.</em>
      </>
    ),
    text: "Something citrusy. Something sparkling. Something worth another round of conversation.",
    action: "Discover the drinks",
    number: "04",
  },
  {
    name: "After dusk",
    label: "GOOD EVENINGS BEGIN HERE",
    title: (
      <>
        Stay for
        <br />
        <em>the night.</em>
      </>
    ),
    text: "As the lights come on, settle into music, conversation, and the company you came for.",
    action: "Save a seat",
    number: "05",
  },
];

function App() {
  const [chapter, setChapter] = useState(0);
  const [modal, setModal] = useState(null);
  const [menuCategory, setMenuCategory] = useState("all");
  const [exploring, setExploring] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const progress = useRef(0);
  const progressBar = useRef();
  const hotspot = useRef();
  const journey = useRef();
  const active = CHAPTERS[chapter];
  const onReady = useCallback(() => setReady(true), []);
  const onFail = useCallback(() => {
    setFailed(true);
    setReady(true);
    setExploring(false);
  }, []);
  const closeModal = () => setModal(null);
  const showMenu = (category = "all") => {
    setMenuCategory(category);
    setModal("menu");
  };
  const travel = (index) => {
    setExploring(false);
    const direct =
      reduced || matchMedia("(pointer: coarse), (max-width: 759px)").matches;
    window.scrollTo({
      top: (index / 4) * (journey.current.offsetHeight - window.innerHeight),
      behavior: direct ? "instant" : "smooth",
    });
  };

  useEffect(() => {
    let scrollRange = 1;
    const update = () => {
      // Update the ref in the scroll event so the next WebGL frame sees it.
      progress.current = Math.min(1, Math.max(0, window.scrollY / scrollRange));
      setChapter(Math.round(progress.current * 4));
      if (progressBar.current)
        progressBar.current.style.transform = `scaleX(${progress.current})`;
    };
    const resize = () => {
      scrollRange = Math.max(
        1,
        journey.current.offsetHeight - window.innerHeight,
      );
      update();
    };
    const visibility = () => setHidden(document.hidden);
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const motion = (event) => setReduced(event.matches);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibility);
    preference.addEventListener("change", motion);
    resize();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
      preference.removeEventListener("change", motion);
    };
  }, []);

  const chapterAction = () => {
    if (chapter < 2) travel(chapter + 1);
    else if (chapter === 2) showMenu("all");
    else if (chapter === 3) showMenu("drinks");
    else setModal("reservation");
  };

  return (
    <div
      id="home"
      className={`experience ${chapter >= 3 ? "is-evening" : ""} ${exploring ? "is-exploring" : ""} ${ready ? "is-ready" : ""}`}
    >
      <a className="skip-link" href="#journey-controls">
        Skip to experience controls
      </a>
      <div className={`world ${failed ? "world-fallback" : ""}`}>
        <div className="scene-poster" />
        {!failed && (
          <Suspense fallback={null}>
            <VenueScene
              progress={progress}
              reduced={reduced}
              exploring={exploring}
              paused={!!modal || hidden}
              onReady={onReady}
              onFail={onFail}
              chapter={chapter}
              hotspot={hotspot}
            />
          </Suspense>
        )}
        <div className="world-shade" />
        {!failed && !exploring && chapter > 0 && chapter < 4 && (
          <div ref={hotspot} className="spatial-hotspot-anchor">
            <button
              className="spatial-hotspot"
              onClick={() =>
                chapter === 1
                  ? travel(2)
                  : showMenu(chapter === 3 ? "drinks" : "all")
              }
            >
              <span>+</span>
              <b>
                {chapter === 1
                  ? "A seat at the table"
                  : chapter === 2
                    ? "Taste the menu"
                    : "Find your favourite"}
              </b>
            </button>
          </div>
        )}
      </div>

      <header className="experience-header">
        <Brand />
        <span className="header-location">
          A LITTLE ESCAPE IN IBADAN <span>RESTAURANT · BAR · GOOD COMPANY</span>
        </span>
        <nav className="header-actions" aria-label="Main navigation">
          <button onClick={() => showMenu()} className="menu-trigger">
            The menu <MenuIcon size={17} />
          </button>
          <button
            className="book-trigger"
            onClick={() => setModal("reservation")}
          >
            Book a table <ArrowUpRight size={17} />
          </button>
        </nav>
      </header>

      <main
        ref={journey}
        id="journey"
        className="journey-track"
        aria-label="Journey through Tamberma"
      >
        <h1 className="sr-only">
          Tamberma Restaurant & Bar — A little escape in Ibadan
        </h1>
        <div
          className="chapter-copy"
          key={chapter}
          aria-live="polite"
          aria-atomic="true"
          inert={exploring ? true : undefined}
        >
          <div className="chapter-eyebrow">
            <span className="fine-line" />
            {active.label}
          </div>
          <h2>{active.title}</h2>
          <p>{active.text}</p>
          {chapter === 3 && (
            <span className="sr-only">
              A host behind the bar waves hello. Welcome to Tamberma.
            </span>
          )}
          <button className="journey-action" onClick={chapterAction}>
            {active.action}
            <span>
              <ArrowUpRight size={21} />
            </span>
          </button>
          {chapter === 4 && (
            <button className="visit-inline" onClick={() => setModal("visit")}>
              Find us in Iyaganku <MapPin size={14} />
            </button>
          )}
        </div>

        <aside className="scene-note" aria-label="Current setting">
          <span className="scene-note-number">
            {active.number}
            <i> / 05</i>
          </span>
          <span>
            {chapter < 3 ? <Sun size={14} /> : <Moon size={14} />}
            {chapter < 3 ? "An afternoon, unhurried." : "The evening is yours."}
          </span>
        </aside>

        {chapter === 2 && !exploring && (
          <button className="dish-peek" onClick={() => showMenu("pizza")}>
            <img src="/images/food-pizza.jpg" alt="Chicken suya pizza" />
            <span>
              <small>A TASTE OF TAMBERMA</small>Chicken suya pizza
              <em>
                Explore the menu <ArrowUpRight size={15} />
              </em>
            </span>
          </button>
        )}
        {chapter === 4 && !exploring && (
          <button className="visit-peek" onClick={() => setModal("visit")}>
            <MapPin size={20} />
            <span>
              Find your way to us<small>Iyaganku GRA, Ibadan</small>
            </span>
            <ArrowUpRight size={18} />
          </button>
        )}
      </main>

      <div className="journey-rail" id="journey-controls">
        <div className="journey-progress">
          <span ref={progressBar} />
        </div>
        <nav className="chapter-nav" aria-label="Explore the spaces">
          {CHAPTERS.map((item, index) => (
            <button
              key={item.name}
              onClick={() => travel(index)}
              className={chapter === index ? "active" : ""}
              aria-current={chapter === index ? "step" : undefined}
            >
              <span>{item.number}</span>
              <b>{item.name}</b>
              <i />
            </button>
          ))}
        </nav>
        <div className="journey-bottom">
          <button className="concept-link" onClick={() => setModal("about")}>
            An independent concept <ArrowUpRight size={11} />
          </button>
          <div className="scroll-cue">
            {!ready ? (
              <>
                <i className="loading-dot" /> Preparing your escape
              </>
            ) : failed ? (
              "Still view · menus & enquiries available"
            ) : exploring ? (
              "Drag to look around · pinch or scroll to zoom"
            ) : (
              <>
                <ArrowDown size={13} /> Scroll to wander
              </>
            )}
          </div>
          <div className="view-controls">
            <SoundControl onCredits={() => setModal("about")} />
            {!failed && (
              <button
                className={exploring ? "selected" : ""}
                onClick={() => setExploring(!exploring)}
                aria-pressed={exploring}
              >
                <Compass size={16} />
                <span>{exploring ? "Return to journey" : "Look around"}</span>
              </button>
            )}
            <button
              onClick={() => setReduced(!reduced)}
              aria-label={
                reduced
                  ? "Enable camera motion and breeze"
                  : "Reduce camera motion and pause breeze"
              }
              aria-pressed={reduced}
              title={
                reduced
                  ? "Enable camera motion and breeze"
                  : "Reduce camera motion and pause breeze"
              }
            >
              {reduced ? <Play size={14} /> : <Pause size={14} />}
            </button>
          </div>
        </div>
      </div>

      {modal === "menu" && (
        <MenuModal onClose={closeModal} initialCategory={menuCategory} />
      )}
      {modal === "reservation" && <ReservationModal onClose={closeModal} />}
      {modal === "about" && (
        <Modal
          title="About this concept"
          className="about-modal"
          onClose={closeModal}
        >
          <span className="eyebrow">AN IDEA FOR TAMBERMA</span>
          <h2>
            A place you can <em>step into.</em>
          </h2>
          <p>
            This is an independent website pitch for Tamberma Restaurant & Bar,
            Ibadan. The 3D courtyard is an artistic interpretation, not a
            surveyed model or an exact representation of the venue.
          </p>
          <p>
            Food and drinks selections come from the supplied Tamberma menus.
            The pizza photograph comes from an older public Tamberma website.
            The restaurant should approve imagery, prices, and business
            information before publication.
          </p>
          <div className="music-credit">
            <span className="eyebrow">THE SOUNDTRACK</span>
            <p>
              <a
                href="https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1700074"
                target="_blank"
                rel="noreferrer"
              >
                “Jazz Brunch” by Kevin MacLeod (incompetech.com)
              </a>
              , licensed under{" "}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noreferrer"
              >
                Creative Commons Attribution 4.0
              </a>
              . Played at a lower volume and repeated as background music.
            </p>
          </div>
          <a
            className="text-link"
            href={INSTAGRAM}
            target="_blank"
            rel="noreferrer"
          >
            Visit Tamberma on Instagram <ArrowUpRight size={17} />
          </a>
        </Modal>
      )}
      {modal === "visit" && (
        <Modal
          title="Visit Tamberma"
          className="about-modal"
          onClose={closeModal}
        >
          <span className="eyebrow">YOUR LITTLE ESCAPE</span>
          <h2>
            See you in <em>Ibadan.</em>
          </h2>
          <p>
            1 Oba Aleshinloye Crescent,
            <br />
            Iyaganku GRA, Ibadan.
          </p>
          <p>
            For today’s opening hours, entertainment, or group celebrations,
            please check with the team.
          </p>
          <div className="visit-links">
            <a
              className="button button-clay"
              href={DIRECTIONS}
              target="_blank"
              rel="noreferrer"
            >
              Get directions <MapPin size={17} />
            </a>
            <a
              className="text-link"
              href={WHATSAPP}
              target="_blank"
              rel="noreferrer"
            >
              Chat on WhatsApp <ArrowUpRight size={16} />
            </a>
            <a
              className="text-link"
              href={INSTAGRAM}
              target="_blank"
              rel="noreferrer"
            >
              What’s on at Tamberma <Instagram size={16} />
            </a>
            <a
              className="text-link"
              href={GLOVO}
              target="_blank"
              rel="noreferrer"
            >
              Order on Glovo <ArrowUpRight size={16} />
            </a>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default App;
