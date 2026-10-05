(() => {
  const feed = document.getElementById('posts');
  const AVATAR = document.querySelector('.avatar img').src;

  // A post is any text between a line holding only "-" and the next such line.
  // Blocks are read in pairs: opening "-" ... closing "-". Blank lines are ignored.
  function parse(text) {
    const posts = [];
    let cur = null;
    for (const line of text.replace(/\r/g, '').split('\n')) {
      if (line.trim() === '-') {
        if (cur === null) cur = [];
        else { const body = cur.join('\n').trim(); if (body) posts.push(body); cur = null; }
      } else if (cur) cur.push(line);
    }
    return posts;
  }

  const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  // Safe formatting: **bold** and *italic* only, after escaping.
  const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>');
  const html = body => body.split(/\n{2,}/).map(p => '<p>' + fmt(p).replace(/\n/g, '<br>') + '</p>').join('');

  // Posts are listed newest first: the top block in posts.txt is the newest.
  // Fictional stamp counts back from the current cycle, one per post.
  function render(list) {
    feed.innerHTML = list.map((body, i) => `
      <article class="post">
        <header>
          <img src="${AVATAR}" alt="" width="44" height="44" loading="lazy" decoding="async">
          <div><b>Zyphorux</b><span>Rift Wanderer · Seventh Veil</span></div>
          <time>Cycle 7,421 · Tide ${list.length - i}</time>
        </header>
        <div class="body">${html(body)}</div>
      </article>`).join('');
  }

  fetch('posts.txt', { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw 0; return r.text(); })
    .then(t => {
      const list = parse(t);
      if (!list.length) throw 0;
      render(list);
    })
    .catch(() => { feed.innerHTML = '<p class="msg">No transmission could be received. Check that posts.txt is in the same folder as index.html.</p>'; })
    .finally(() => feed.setAttribute('aria-busy', 'false'));
})();
