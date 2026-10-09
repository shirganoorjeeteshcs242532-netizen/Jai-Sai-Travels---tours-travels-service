import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryItem } from '../../models/gallery.model';

@Component({
  selector: 'app-lightbox-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lightbox-modal.component.html'
})
export class LightboxModalComponent {
  @Input() items: GalleryItem[] = [];
  @Input() activeIndex: number = 0;
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  zoomLevel: number = 1;
  panX: number = 0;
  panY: number = 0;
  isDragging: boolean = false;
  dragStartX: number = 0;
  dragStartY: number = 0;
  initialPanX: number = 0;
  initialPanY: number = 0;

  get currentItem(): GalleryItem | null {
    return this.items[this.activeIndex] || null;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen) return;

    if (event.key === 'Escape') {
      this.closeModal();
    } else if (event.key === 'ArrowRight') {
      this.next();
    } else if (event.key === 'ArrowLeft') {
      this.prev();
    } else if (event.key === '+' || event.key === '=') {
      this.zoomIn();
    } else if (event.key === '-' || event.key === '_') {
      this.zoomOut();
    } else if (event.key === '0') {
      this.resetZoom();
    }
  }

  closeModal(): void {
    this.resetZoom();
    this.close.emit();
  }

  next(): void {
    this.resetZoom();
    if (this.activeIndex < this.items.length - 1) {
      this.activeIndex++;
    } else {
      this.activeIndex = 0;
    }
  }

  prev(): void {
    this.resetZoom();
    if (this.activeIndex > 0) {
      this.activeIndex--;
    } else {
      this.activeIndex = this.items.length - 1;
    }
  }

  zoomIn(): void {
    if (this.zoomLevel < 4) {
      this.zoomLevel = +(this.zoomLevel + 0.35).toFixed(2);
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > 1) {
      this.zoomLevel = +(this.zoomLevel - 0.35).toFixed(2);
      if (this.zoomLevel <= 1) {
        this.resetZoom();
      }
    }
  }

  resetZoom(): void {
    this.zoomLevel = 1;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
  }

  toggleDoubleZoom(e: MouseEvent): void {
    e.preventDefault();
    if (this.zoomLevel > 1) {
      this.resetZoom();
    } else {
      this.zoomLevel = 2.2;
      this.panX = 0;
      this.panY = 0;
    }
  }

  onWheelZoom(e: WheelEvent): void {
    e.preventDefault();
    e.stopPropagation();
    if (e.deltaY < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
  }

  startDrag(e: MouseEvent): void {
    if (this.zoomLevel <= 1) return;
    e.preventDefault();
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.initialPanX = this.panX;
    this.initialPanY = this.panY;
  }

  onDrag(e: MouseEvent): void {
    if (!this.isDragging || this.zoomLevel <= 1) return;
    e.preventDefault();
    const dx = e.clientX - this.dragStartX;
    const dy = e.clientY - this.dragStartY;
    this.panX = this.initialPanX + dx;
    this.panY = this.initialPanY + dy;
  }

  endDrag(): void {
    this.isDragging = false;
  }

  startTouchDrag(e: TouchEvent): void {
    if (this.zoomLevel <= 1 || e.touches.length !== 1) return;
    this.isDragging = true;
    this.dragStartX = e.touches[0].clientX;
    this.dragStartY = e.touches[0].clientY;
    this.initialPanX = this.panX;
    this.initialPanY = this.panY;
  }

  onTouchDrag(e: TouchEvent): void {
    if (!this.isDragging || this.zoomLevel <= 1) return;
    const dx = e.touches[0].clientX - this.dragStartX;
    const dy = e.touches[0].clientY - this.dragStartY;
    this.panX = this.initialPanX + dx;
    this.panY = this.initialPanY + dy;
  }
}
