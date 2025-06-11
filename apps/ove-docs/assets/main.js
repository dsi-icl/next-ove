const changeState = (newState) => {
  if (newState === null) {
    document.getElementById("content").innerHTML = `
      <div class="card">
        <h2>Welcome to the next-ove documentation</h2>
        <p>This is a collapsible sidebar with a layout similar to shadcn UI.</p>
        <p>Features:</p>
        <ul>
          <li>API Documentation</li>
          <li>Compatibility</li>
          <li>Feature Documentation</li>
          <li>Dependency Analysis</li>
          <li>Specifications</li>
          <li>Test Coverage</li>
          <li>Type Documentation</li>
        </ul>
      </div>
      `;
    return;
  }
  document.getElementById("content").innerHTML = "";
  const iframe = document.createElement("iframe");
  iframe.src = newState;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  iframe.style.margin = "0";
  iframe.style.padding = "0";
  iframe.style.overflow = "hidden";
  document.getElementById("content").appendChild(iframe);
};

const buildWithSub = (listId, arr, icon) => {
  const ul = document.getElementById(listId);
  arr.forEach(({ header, files }) => {
    const li = document.createElement("li");
    li.role = "list";
    li.classList.add("sidebar-menu-item");
    const trigger = document.createElement("button");
    trigger.innerHTML = `
      ${icon}
      <span>${header}</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon chevron">
        <path d="m6 9 6 6 6-6"></path>
      </svg>
      `;
    trigger.classList.add("collapsible-trigger");
    trigger.classList.add("sidebar-menu-button");
    li.appendChild(trigger);
    const sub = document.createElement("ul");
    sub.classList.add("sidebar-menu-sub");

    files.forEach(({ href, label }) => {
      const li = document.createElement("li");
      li.classList.add("sidebar-menu-sub-item");
      const button = document.createElement("button");
      button.classList.add("sidebar-menu-sub-button");
      button.onclick = () => changeState(href);
      const span = document.createElement("span");
      span.textContent = label;
      button.appendChild(span);
      li.appendChild(button);
      sub.appendChild(li);
    });

    li.appendChild(sub);
    ul.appendChild(li);
  });
};

const buildWithoutSub = (listId, arr, icon) => {
  const ul = document.getElementById(listId);

  arr.forEach(({ href, label }) => {
    const li = document.createElement("li");
    li.role = "list";
    li.classList.add("sidebar-menu-item");
    const button = document.createElement("button");
    button.classList.add("sidebar-menu-button");
    button.innerHTML = `${icon}<span>${label}</span>`;
    button.onclick = () => changeState(href);

    li.appendChild(button);
    ul.appendChild(li);
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  changeState(null);
  const features = await (await fetch("%BASE_PATH%/components")).json();

  if (features.apis) {
    const apis = await (await fetch("%BASE_PATH%/api/available")).json();
    buildWithSub(
      "api-list",
      apis,
      `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
           viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           class="lucide lucide-globe icon">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>`,
    );
  } else {
    document.getElementById("api-group").style.display = "none";
    document.getElementById("api-separator").style.display = "none";
  }

  if (features.specs) {
    const specs = await (await fetch("%BASE_PATH%/specs/available")).json();
    buildWithoutSub(
      "spec-list",
      specs,
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text icon"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
    );
  } else {
    document.getElementById("specifications-group").style.display = "none";
    document.getElementById("specifications-separator").style.display = "none";
  }

  if (features.coverage) {
    const coverage = await (
      await fetch("%BASE_PATH%/coverage/available")
    ).json();
    buildWithSub(
      "coverage-list",
      coverage,
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-test-tube icon"><path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5c-1.4 0-2.5-1.1-2.5-2.5V2"/><path d="M8.5 2h7"/><path d="M14.5 16h-5"/></svg>`,
    );
  } else {
    document.getElementById("test-coverage-group").style.display = "none";
    document.getElementById("test-coverage-separator").style.display = "none";
    document.getElementById("type-coverage").style.display = "none";
  }

  if (!features.code) {
    document.getElementById("code-group").style.display = "none";
    document.getElementById("code-separator").style.display = "none";
  }

  if (!features.types) {
    document.getElementById("types-group").style.display = "none";
  }

  if (features.features) {
    const featureSpecs = await (
      await fetch("%BASE_PATH%/features/available")
    ).json();
    buildWithoutSub(
      "feature-list",
      featureSpecs,
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-atom icon"><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/></svg>`,
    );
  } else {
    document.getElementById("features-group").style.display = "none";
    document.getElementById("features-separator").style.display = "none";
  }

  if (!features.packages) {
    document.getElementById("packages-group").style.display = "none";
    document.getElementById("packages-separator").style.display = "none";
  }

  if (!features.compatibility) {
    document.getElementById("compatibility-group").style.display = "none";
    document.getElementById("compatibility-separator").style.display = "none";
  }

  // Sidebar toggle functionality
  const sidebarToggle = document.querySelector(".sidebar-toggle");
  const sidebar = document.querySelector(".sidebar");
  const sidebarWrapper = document.querySelector(".sidebar-wrapper");
  const mainContent = document.querySelector(".main-content");

  // Collapsible menu functionality
  const collapsibleTriggers = document.querySelectorAll(".collapsible-trigger");

  // Toggle sidebar on button click
  sidebarToggle.addEventListener("click", () => {
    const isCollapsed = sidebar.getAttribute("data-state") === "collapsed";

    if (window.innerWidth <= 768) {
      // Mobile behavior
      sidebar.classList.toggle("mobile-active");
    } else {
      // Desktop behavior
      if (isCollapsed) {
        sidebar.setAttribute("data-state", "expanded");
        sidebarWrapper.style.width = "var(--sidebar-width)";
        mainContent.style.marginLeft = "0";
      } else {
        sidebar.setAttribute("data-state", "collapsed");
        sidebarWrapper.style.width = "var(--sidebar-width-collapsed)";
        mainContent.style.marginLeft = "0";
      }
    }
  });

  // Toggle submenu on click
  collapsibleTriggers.forEach((trigger) => {
    trigger.addEventListener("click", function () {
      // Find the submenu
      const submenu = this.nextElementSibling;

      // Toggle active class on the button
      this.classList.toggle("active");

      // Toggle the submenu visibility
      if (submenu.classList.contains("active")) {
        submenu.classList.remove("active");
      } else {
        submenu.classList.add("active");
      }
    });
  });

  // Add keyboard shortcut (Ctrl+B or Cmd+B) to toggle sidebar
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "b") {
      event.preventDefault();
      sidebarToggle.click();
    }
  });

  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth <= 768) {
      // Reset to mobile view
      sidebar.classList.remove("mobile-active");
      sidebar.setAttribute("data-state", "expanded");
      sidebarWrapper.style.width = "0";
      mainContent.style.marginLeft = "0";
    } else {
      // Reset to desktop view if sidebar was in mobile mode
      sidebar.classList.remove("mobile-active");

      // Maintain current collapsed/expanded state
      const isCollapsed = sidebar.getAttribute("data-state") === "collapsed";
      sidebarWrapper.style.width = isCollapsed
        ? "var(--sidebar-width-collapsed)"
        : "var(--sidebar-width)";
      mainContent.style.marginLeft = "0";
    }
  });

  const body = document.body;
  const prefersDarkMode = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  if (prefersDarkMode) {
    body.classList.add("dark");
  }
});
