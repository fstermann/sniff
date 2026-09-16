(() => {
  const descriptions = {
    registry: "Every bundled rule",
    document: "Prose and markup",
    prompt: "Prompts and instructions",
    spec: "Requirements and specifications",
    code: "Comments and source rules",
    all: "Every LLM-evaluated rule",
  };

  function escape(value) {
    const node = document.createElement("div");
    node.textContent = value;
    return node.innerHTML;
  }

  function mount() {
    const root = document.querySelector("#sniff-rule-explorer");
    const data = window.SNIFF_DOCS;
    if (!root || !data || root.dataset.mounted) return;
    root.dataset.mounted = "true";
    let profile = "registry";
    let mode = "catalog";

    root.innerHTML = `
      <div class="sniff-profiles" role="tablist" aria-label="Rule profile"></div>
      <div class="sniff-toolbar">
        <label>Filter <input type="search" placeholder="Code, ID, message, or guidance"></label>
        <span class="sniff-count" aria-live="polite"></span>
        <div class="sniff-modes"><button data-mode="catalog">Catalog</button><button data-mode="prompt">Prompt preview</button></div>
      </div>
      <div class="sniff-catalog"></div>
      <div class="sniff-prompt" hidden><div><span>sniff rules output</span><button class="sniff-copy">Copy</button></div><pre><code></code></pre></div>`;

    const profiles = root.querySelector(".sniff-profiles");
    const input = root.querySelector("input");
    const catalog = root.querySelector(".sniff-catalog");
    const prompt = root.querySelector(".sniff-prompt");

    function render() {
      profiles.innerHTML = Object.keys(data.profiles).map(name =>
        `<button role="tab" aria-selected="${name === profile}" data-profile="${name}"><strong>${name}</strong><small>${descriptions[name]}</small></button>`
      ).join("");
      const selected = new Set(data.profiles[profile].rules);
      const query = input.value.trim().toLowerCase();
      const rules = data.rules.filter(rule => selected.has(rule.id) &&
        (!query || `${rule.code} ${rule.id} ${rule.name} ${rule.family} ${rule.severity} ${rule.message} ${rule.guidance}`.toLowerCase().includes(query)));
      root.querySelector(".sniff-count").textContent = `${rules.length} of ${selected.size} rules`;
      catalog.innerHTML = rules.map(rule => `<article class="sniff-rule">
        <a href="../generated/rules/${rule.id}/"><code>${rule.code}</code><span><strong>${escape(rule.name)}</strong><small>${rule.id} · ${rule.family}</small><small>${escape(rule.message)}</small></span><mark class="${rule.severity}">${rule.severity}</mark></a>
      </article>`).join("") || "<p>No matching rules.</p>";
      const preview = data.profiles[profile].prompt;
      prompt.querySelector("code").textContent = preview || "Choose document, prompt, spec, code, or all to preview the exact LLM rule bundle.";
      root.querySelector(".sniff-copy").disabled = !preview;
      catalog.hidden = mode !== "catalog";
      prompt.hidden = mode !== "prompt";
      root.querySelectorAll("[data-mode]").forEach(button =>
        button.classList.toggle("active", button.dataset.mode === mode));
    }

    profiles.addEventListener("click", event => {
      const button = event.target.closest("[data-profile]");
      if (button) { profile = button.dataset.profile; input.value = ""; render(); }
    });
    input.addEventListener("input", render);
    root.querySelector(".sniff-modes").addEventListener("click", event => {
      const button = event.target.closest("[data-mode]");
      if (button) { mode = button.dataset.mode; render(); }
    });
    root.querySelector(".sniff-copy").addEventListener("click", async event => {
      const value = data.profiles[profile].prompt;
      if (!value) return;
      await navigator.clipboard.writeText(value);
      event.target.textContent = "Copied";
      setTimeout(() => event.target.textContent = "Copy", 1200);
    });
    render();
  }

  if (typeof document$ !== "undefined") document$.subscribe(mount);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
