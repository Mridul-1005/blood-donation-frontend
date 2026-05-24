// pages/inventory/inventory.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BloodInventoryService } from '../../core/services/blood-inventory';
import { AuthService } from '../../core/services/auth';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './inventory.html'
  ,
  styleUrls: ['./inventory.css']
})
export class InventoryComponent implements OnInit {
  Math = Math;

  inventory: any[]       = [];
  isLoading              = false;
  editingId: number | null = null;
  newUnits: number       = 0;

  bloodGroups: Record<string, string> = {
    A_POSITIVE: 'A+', A_NEGATIVE: 'A-',
    B_POSITIVE: 'B+', B_NEGATIVE: 'B-',
    AB_POSITIVE: 'AB+', AB_NEGATIVE: 'AB-',
    O_POSITIVE: 'O+', O_NEGATIVE: 'O-'
  };

  bloodGroupColors: Record<string, string> = {
    A_POSITIVE: '#e53935', A_NEGATIVE: '#c62828',
    B_POSITIVE: '#1565c0', B_NEGATIVE: '#0d47a1',
    AB_POSITIVE: '#6a1b9a', AB_NEGATIVE: '#4a148c',
    O_POSITIVE: '#2e7d32', O_NEGATIVE: '#1b5e20'
  };

  constructor(
    private inventoryService: BloodInventoryService,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory(): void {
    this.isLoading = true;
    this.inventoryService.getAllInventory().subscribe({
      next: (res) => {
        this.inventory = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load inventory', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  startEdit(inv: any): void {
    this.editingId = inv.id;
    this.newUnits  = inv.units;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.newUnits  = 0;
  }

  saveStock(bloodGroup: string): void {
    if (this.newUnits < 0) {
      this.snackBar.open('Units cannot be negative', 'Close', { duration: 3000 });
      return;
    }
    this.inventoryService.updateInventory({ bloodGroup, units: this.newUnits }).subscribe({
      next: () => {
        this.snackBar.open('Stock updated!', 'Close', { duration: 3000 });
        this.editingId = null;
        this.loadInventory();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Update failed', 'Close', { duration: 3000 });
      }
    });
  }

  getBloodLabel(value: string): string {
    return this.bloodGroups[value] || value;
  }

  getColor(bloodGroup: string): string {
    return this.bloodGroupColors[bloodGroup] || '#e53935';
  }

  getStockLevel(units: number): string {
    if (units === 0)  return 'critical';
    if (units < 5)   return 'low';
    if (units < 15)  return 'medium';
    return 'good';
  }

  getStockLabel(units: number): string {
    if (units === 0)  return 'Out of Stock';
    if (units < 5)   return 'Low';
    if (units < 15)  return 'Moderate';
    return 'Good';
  }

  getTotalUnits(): number {
    return this.inventory.reduce((sum, i) => sum + i.units, 0);
  }

  getCriticalCount(): number {
    return this.inventory.filter(i => i.units < 5).length;
  }
}