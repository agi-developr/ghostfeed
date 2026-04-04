(function () {
  var pages = [
    { href: "/", label: "Home" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/dashboard.html", label: "Dashboard" },
    { href: "/#waitlist", label: "Early Access" },
  ];

  var current = window.location.pathname;

  var nav = document.createElement("nav");
  var container = document.createElement("div");
  container.className = "gf-nav";

  var logo = document.createElement("a");
  logo.href = "/";
  logo.className = "gf-nav-logo";
  logo.textContent = "GhostFeed";
  container.appendChild(logo);

  var links = document.createElement("div");
  links.className = "gf-nav-links";

  pages.forEach(function (p) {
    var a = document.createElement("a");
    a.href = p.href;
    a.className = "gf-nav-link";
    if (current === p.href || (p.href !== "/" && current.startsWith(p.href))) {
      a.className += " active";
    }
    a.textContent = p.label;
    links.appendChild(a);
  });

  container.appendChild(links);
  nav.appendChild(container);

  var style = document.createElement("style");
  style.textContent = [
    ".gf-nav { display:flex; align-items:center; justify-content:space-between; max-width:1100px; margin:0 auto; padding:14px 20px; font-family:Arial,Helvetica,sans-serif; }",
    ".gf-nav-logo { font-family:'Times New Roman',Times,serif; font-size:1.5em; font-weight:700; color:#000; text-decoration:none; letter-spacing:-0.5px; }",
    ".gf-nav-links { display:flex; gap:24px; }",
    ".gf-nav-link { font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#666; text-decoration:none; padding-bottom:2px; border-bottom:2px solid transparent; transition:all 0.15s; }",
    ".gf-nav-link:hover { color:#000; }",
    ".gf-nav-link.active { color:#000; border-bottom-color:#f97316; }",
    "@media (max-width:600px) { .gf-nav { flex-direction:column; gap:10px; } .gf-nav-links { gap:16px; } }",
  ].join("\n");

  document.head.appendChild(style);
  document.body.insertBefore(nav, document.body.firstChild);
})();
