import { Link } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav style={{ padding: "1rem", background: "#eee" }}>
      <button onClick={() => setOpen(!open)}>
        ☰ תפריט
      </button>

      {open && (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
          <li><Link to="/" onClick={() => setOpen(false)}>בית</Link></li>
          <li><Link to="/login" onClick={() => setOpen(false)}>התחברות</Link></li>
          <li><Link to="/register" onClick={() => setOpen(false)}>הרשמה</Link></li>
          <li><Link to="/tax" onClick={() => setOpen(false)}>חישוב מס</Link></li>
          <li><Link to="/mortgage" onClick={() => setOpen(false)}>משכנתאות</Link></li>
          <li><Link to="/investments" onClick={() => setOpen(false)}>השקעות</Link></li>
          <li><Link to="/profile" onClick={() => setOpen(false)}>פרופיל</Link></li>
        </ul>
      )}
    </nav>
  );
}

export default Navbar;
