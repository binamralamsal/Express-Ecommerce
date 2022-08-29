const backdrop = document.querySelector(".backdrop") as HTMLDivElement;
const sideDrawer = document.querySelector(".mobile-nav") as HTMLDivElement;
const menuToggle = document.querySelector(
  "#side-menu-toggle"
) as HTMLButtonElement;

const backdropClickHandler = () => {
  if (backdrop) backdrop.style.display = "none";
  sideDrawer.classList.remove("open");
};

const menuToggleClickHandler = () => {
  backdrop.style.display = "block";
  sideDrawer.classList.add("open");
};

backdrop.addEventListener("click", backdropClickHandler);
menuToggle.addEventListener("click", menuToggleClickHandler);
