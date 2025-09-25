export class DragDrop {
  constructor() {
    this.dragState = {
      isDragging: false,
      currentItem: null,
    };

    this.items = document.querySelectorAll(".draggable-item");
    this.dropZones = document.querySelectorAll(".drop-zone");
  }

  init() {
    // Attach drag events
    this.items.forEach((item) => {
      item.addEventListener("dragstart", (e) => this.handleDragStart(e, item));
      item.addEventListener("dragend", () => this.handleDragEnd(item));

      // Touch support (mobile)
      item.addEventListener("touchstart", (e) => this.handleTouchStart(e, item));
      item.addEventListener("touchend", () => this.handleTouchEnd(item));
    });

    // Attach drop zone events
    this.dropZones.forEach((zone) => {
      zone.addEventListener("dragover", (e) => this.handleDragOver(e, zone));
      zone.addEventListener("dragleave", () => this.handleDragLeave(zone));
      zone.addEventListener("drop", () => this.handleDrop(zone));

      // Touch drop simulation
      zone.addEventListener("touchmove", (e) => e.preventDefault());
      zone.addEventListener("touchend", (e) => this.handleTouchDrop(e, zone));
    });
  }

  handleDragStart(e, item) {
    this.dragState.isDragging = true;
    this.dragState.currentItem = item;
    item.classList.add("opacity-50", "scale-95");
    e.dataTransfer.effectAllowed = "move";
  }

  handleDragEnd(item) {
    this.dragState.isDragging = false;
    item.classList.remove("opacity-50", "scale-95");
    this.dragState.currentItem = null;
  }

  handleDragOver(e, zone) {
    e.preventDefault();
    zone.classList.add("border-blue-400", "bg-blue-50");
  }

  handleDragLeave(zone) {
    zone.classList.remove("border-blue-400", "bg-blue-50");
  }

  handleDrop(zone) {
    if (this.dragState.currentItem) {
      zone.appendChild(this.dragState.currentItem);
    }
    this.handleDragLeave(zone);
    this.dragState.isDragging = false;
  }

  // Touch support
  handleTouchStart(e, item) {
    this.dragState.isDragging = true;
    this.dragState.currentItem = item;
    item.classList.add("opacity-50", "scale-95");
  }

  handleTouchEnd(item) {
    this.dragState.isDragging = false;
    if (item) {
      item.classList.remove("opacity-50", "scale-95");
    }
    this.dragState.currentItem = null;
  }

  handleTouchDrop(e, zone) {
    if (this.dragState.currentItem) {
      zone.appendChild(this.dragState.currentItem);
    }
    this.handleDragLeave(zone);
  }
}
